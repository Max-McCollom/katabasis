import { createClient } from 'npm:@supabase/supabase-js@2.119.0';

// Gateway verify_jwt=false avoids legacy/asymmetric-key compatibility failures.
// Authentication remains mandatory: getUser() below verifies the caller's JWT
// against Auth before any private lookup. API keys/decoded claims are not users.
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const maxBodyBytes = 1024;
const maxFileBytes = 20 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'text/csv': 'csv',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

function configuredKey(dictionaryName: string, singularName: string, legacyName: string): string {
  const dictionary = Deno.env.get(dictionaryName);
  if (dictionary) {
    const values = JSON.parse(dictionary);
    if (typeof values.default === 'string' && values.default) return values.default;
  }
  return Deno.env.get(singularName) || Deno.env.get(legacyName) || '';
}

function allowedOrigins(): Set<string> {
  const configured = Deno.env.get('RESEARCH_ALLOWED_ORIGINS') ?? 'https://katabasis.rip';
  return new Set(configured.split(',').map((entry) => entry.trim()).filter((entry) => {
    try {
      const value = new URL(entry);
      const local = value.hostname === 'localhost' || value.hostname === '127.0.0.1';
      return value.origin === entry && (value.protocol === 'https:' ||
        (local && value.protocol === 'http:'));
    } catch {
      return false;
    }
  }));
}

function headers(origin?: string): Headers {
  const values = new Headers({
    'Cache-Control': 'private, no-store, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
  });
  if (origin) {
    values.set('Access-Control-Allow-Origin', origin);
    values.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    values.set('Access-Control-Allow-Headers', 'authorization, apikey, content-type, x-client-info');
    values.set('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');
  }
  return values;
}

function errorResponse(status: number, message: string, origin?: string): Response {
  const responseHeaders = headers(origin);
  responseHeaders.set('Content-Type', 'application/json');
  return new Response(JSON.stringify({ error: message }), { status, headers: responseHeaders });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('Origin') ?? '';
  // Origin is an additional browser boundary, not authentication: callers can
  // spoof it outside browsers. JWT verification and DB RLS remain mandatory.
  if (!allowedOrigins().has(origin)) return errorResponse(403, 'Origin not allowed');
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(origin) });
  if (request.method !== 'POST') return errorResponse(405, 'POST required', origin);
  if (!(request.headers.get('Content-Type') ?? '').toLowerCase().startsWith('application/json')) {
    return errorResponse(415, 'JSON required', origin);
  }

  try {
    const authorization = request.headers.get('Authorization') ?? '';
    const tokenMatch = authorization.match(/^Bearer\s+(\S+)$/i);
    if (!tokenMatch) return errorResponse(401, 'Sign in required', origin);

    const projectUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const publicKey = configuredKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY');
    const serverKey = configuredKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY');
    if (!projectUrl || !publicKey || !serverKey) {
      return errorResponse(503, 'Research access unavailable', origin);
    }

    const userClient = createClient(projectUrl, publicKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data: identity, error: authError } = await userClient.auth.getUser(tokenMatch[1]);
    if (authError || !identity.user?.email_confirmed_at) {
      return errorResponse(401, 'Confirmed sign-in required', origin);
    }

    // Bound the actual incoming body, not just its optional Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return errorResponse(400, 'Material ID required', origin);
    const chunks: Uint8Array[] = [];
    let bodyBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bodyBytes += value.byteLength;
      if (bodyBytes > maxBodyBytes) {
        await reader.cancel();
        return errorResponse(413, 'Request too large', origin);
      }
      chunks.push(value);
    }
    const joined = new Uint8Array(bodyBytes);
    let offset = 0;
    for (const value of chunks) { joined.set(value, offset); offset += value.byteLength; }
    let body: unknown;
    try { body = JSON.parse(new TextDecoder().decode(joined)); }
    catch { return errorResponse(400, 'Invalid request', origin); }
    if (!body || typeof body !== 'object' || Array.isArray(body) ||
        Object.keys(body).length !== 1 || !('material_id' in body) ||
        typeof body.material_id !== 'string' || !uuidPattern.test(body.material_id)) {
      return errorResponse(400, 'Material ID required', origin);
    }

    // This query runs with the USER JWT and current DB policies, not service role.
    const { data: material, error: materialError } = await userClient
      .from('research_materials')
      .select('id, storage_path, file_type')
      .eq('id', body.material_id)
      .maybeSingle();
    if (materialError) return errorResponse(503, 'Research access unavailable', origin);
    if (!material) return errorResponse(404, 'Material unavailable', origin);

    // Only now create a privileged client. Neither client input nor a user
    // metadata field can choose the bucket/path. No Storage URL is returned.
    const serverClient = createClient(projectUrl, serverKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data: file, error: fileError } = await serverClient.storage
      .from('research-private').download(material.storage_path);
    if (fileError || !file) return errorResponse(404, 'Material unavailable', origin);
    if (file.size > maxFileBytes) return errorResponse(413, 'Material exceeds download limit', origin);

    // Recheck after file retrieval so a revocation during a slow fetch blocks
    // the response. Already-delivered/downloaded copies cannot be recalled.
    const { data: stillAllowed, error: recheckError } = await userClient
      .from('research_materials').select('id, storage_path, file_type')
      .eq('id', material.id).maybeSingle();
    if (recheckError) return errorResponse(503, 'Research access unavailable', origin);
    if (!stillAllowed || stillAllowed.storage_path !== material.storage_path ||
        stillAllowed.file_type !== material.file_type) {
      return errorResponse(404, 'Material unavailable', origin);
    }

    const responseHeaders = headers(origin);
    const extension = allowedTypes[material.file_type] ?? 'bin';
    responseHeaders.set('Content-Type', extension === 'bin' ? 'application/octet-stream' : material.file_type);
    responseHeaders.set('Content-Disposition', `attachment; filename="katabasis-research-${material.id}.${extension}"`);
    return new Response(file, { status: 200, headers: responseHeaders });
  } catch {
    // Do not log bearer tokens, contact data, file contents/paths or SDK errors.
    return errorResponse(503, 'Research access unavailable', origin);
  }
});
