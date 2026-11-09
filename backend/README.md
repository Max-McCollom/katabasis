# Research access backend foundation

Prepared November 8, 2026. **The installed backend has passed hosted database, owner-panel, private-PDF access/revocation, production-CORS and recovery-email delivery checks.** The database suite passed 78/78 assertions. The confirmed owner was bootstrapped and real login/list/approve/revoke actions were exercised. Eight private assets are uploaded and registered outside this source tree; two PDFs were checked through the protected endpoint with matching SHA-256 hashes. Custom SMTP and both branded email templates are configured; the provider reported the test recovery email Delivered. The new-visitor UI was not rerun end to end with custom SMTP, and no recovery link was opened or password changed. This source tree contains no private documents, account identifiers or credentials.

## What is implemented

- Confirmed-email signup/sign-in is followed by a **pending access request**. Owner approval is mandatory, with a distinct grant for each material. Phone is optional, unverified contact information; no SMS service is needed.
- The request RPC derives the user UUID from the session. Contact edits preserve pending/approved/rejected/revoked review state. Browser roles cannot write approval, grant or material records.
- RLS exposes only the caller's request/grants and currently approved, individually granted, published materials. Expired/revoked grants fail on subsequent queries without refreshing a JWT. User metadata never authorizes access.
- `research-private` is private and limited to 20 MB per file. Restrictive Storage policies deny **all** ordinary direct reads/signing/writes, including when another permissive policy exists. Only the Edge proxy delivers bytes after current user-scoped authorization.
- `research-download` verifies the user with Auth, queries material RLS before and after its server-only Storage fetch, uses only the DB-selected object path, and returns an attachment with `private, no-store`/no-cache headers. No signed URL or public Storage URL is sent to the browser.

This proxy design responds to Supabase's November 4, 2026 warning: authenticated Storage CDN responses can survive access removal until JWT expiry. A UI refresh or an unshown URL is insufficient protection. [Current caching warning and custom-function option](https://supabase.com/kb/troubleshooting/storage-private-bucket-files-still-accessible-after-remove-access-or-logout)

Authorization is checked at the function's final database read before delivery. Revocation cannot recall previously delivered bytes, an existing local copy or a response already authorized/in flight. Use immutable versioned object paths rather than overwriting a file at the same path.

## Frontend contract

```
RPC submit_research_access_request(p_display_name text, p_contact_phone text|null)
  -> own request row (verified email required; optional blank name uses account email)

research_access_requests:
  user_id, status, display_name, contact_phone, created_at, updated_at,
  reviewed_at, reviewed_by
  status = pending | approved | rejected | revoked

research_materials (RLS-filtered catalog):
  id, title, summary, storage_path, file_type, published, created_at

POST <SUPABASE_URL>/functions/v1/research-download
Origin: https://katabasis.rip
Authorization: Bearer <current user's access token>
apikey: <publishable key>
Content-Type: application/json
{"material_id":"<catalog UUID>"}
  -> 200 attachment bytes; non-2xx generic {error: "..."}
```

The UI should query only the catalog fields it needs. It must not call `storage.download`, `getPublicUrl`, `createSignedUrl` or expose raw object paths. Treat unknown request statuses as denied. Do not collect passwords when provider configuration is absent. The browser receives only the project URL and `sb_publishable_...` key; secret/service-role keys remain provider-managed server values.

The UI and download response omit Storage paths; this is not column-level secrecy. An approved, individually granted user can query that material's `storage_path` through the authenticated table API because it is part of the permitted catalog row. Use generic immutable object identifiers. Knowing a path never grants object access: ordinary Storage SELECT/signing remains denied and the proxy still verifies current permissions.

## Files

- `supabase/migrations/202611080001_research_access.sql`: tables, grants, RLS, private guarded definer helpers, public invoker RPC, private bucket and restrictive Storage policies.
- `supabase/functions/research-download/index.ts`: proxy implementation using Supabase JS `2.119.0` (matching the frontend lockfile) and `auth.getUser()`. Resolve/check the Deno dependency lock during provider development; Deno is unavailable in this workspace.
- `supabase/function-config.toml`: merge the function's `verify_jwt = false` setting into generated project config. This disables the legacy gateway compatibility check; mandatory `auth.getUser()` and live RLS authorization remain inside the function.
- `supabase/tests/database/research_access.test.sql`: rollback-isolated pgTAP tests with synthetic identities/object metadata. Includes hostile permissive Storage policy, metadata spoofing, cross-user/material access, pending/rejected/revoked/expired/unpublished cases, phone-only confirmation and direct Storage mutations.
- `supabase/tests/dashboard-research-access.sql`: the same 78 assertions with captured TAP output, an expected-count check and **RAISE EXCEPTION on any failure**, followed by rollback and one visible success summary. Use the entire file as one SQL Editor execution in the owner's fresh configured project; a failed SQL operation or assertion must be treated as failure. It creates synthetic identities/object metadata only, never private file bytes.
- `owner-bootstrap.example.sql`: provider-owner-only template binding a confirmed Auth UUID to the private active reviewer allowlist; zero UUID fails closed. No browser/user metadata or email match can create a reviewer.
- `owner-approve.example.sql`, `owner-revoke.example.sql`: optional direct provider-owner fallback templates. The normal owner panel uses the guarded review RPC below, which records the authenticated reviewer and a private review event transactionally.

## Owner panel contract

Owner authority is separate from reader approval and is checked against the current confirmed Auth UUID in `research_access_private.reviewers` on every RPC. The allowlist has no ordinary-client table writes and remains outside exposed API schemas. Deactivating it prevents the next review/list call with the same JWT. A reviewer does not automatically receive reader/file grants.

| RPC | Result |
| --- | --- |
| `research_is_reviewer()` | Boolean; requires authenticated caller; true only for confirmed active allowlisted UUID |
| `list_research_access_requests()` | Owner-only rows: `user_id,email,display_name,contact_phone,status,created_at,updated_at,reviewed_at,email_confirmed,material_ids[]` |
| `list_research_review_materials()` | Owner-only published+uploaded choices: `id,title,summary,file_type`; no object paths |
| `review_research_access(p_user_id,p_status,p_material_ids[])` | Owner-only approve/reject/revoke; returns reviewed request row; client can ignore and reload |

Approval replaces the complete file-grant selection. An empty list approves the account with **zero files**. Rejected/revoked decisions revoke all material grants. Invalid/unpublished/unuploaded IDs and unconfirmed requesters cannot be approved. The database derives `reviewed_by` from the reviewer session and records successful decisions privately. Errors: `42501` unauthorized reviewer, `22023` invalid decision/selection, `P0002` missing requester. The migration is one atomic installer; rerunning this same marked version preserves users/reviewer state, while an unrecognized existing app schema aborts for review.

After the owner signs in with a confirmed Auth identity, independently verify its UUID in the provider Auth Users page and apply only that UUID in the bootstrap template. There is no public reviewer-registration or reviewer-management RPC.

## Dashboard execution

Before the reviewed migration/test execution, check extension availability with this read-only query:

```sql
select name, default_version, installed_version
from pg_available_extensions where name = 'pgtap';
```

Supabase documents enabling pgTAP in Database → Extensions and running ordinary SQL tests. The Dashboard runner uses one transaction and real `SET ROLE`/JWT-GUC checks; success is not inferred from raw TAP strings. If it raises, fixtures remain uncommitted; issue `ROLLBACK` before retrying if the editor session remains open. The documented automated CLI runner remains `supabase test db`. [pgTAP extension](https://supabase.com/docs/guides/database/extensions/pgtap), [RLS testing](https://supabase.com/docs/guides/database/postgres/testing-row-level-security)

Run the **entire** Dashboard file as one query, with no highlighted subset. PostgreSQL stops the rest of a single query batch when a statement errors, so the post-rollback PASS row is reached only after the assertion guard succeeds. A client that deliberately continues statement-by-statement after an error is unsupported; use `ON_ERROR_STOP` for any psql alternative and never select the last PASS statement by itself. The hosted project advertised pgTAP `1.3.3`; root subsequently executed the corrected runner and recorded its 78/78 PASS result. [PostgreSQL query/error processing](https://www.postgresql.org/docs/current/protocol-flow.html)

For the single download function, Dashboard → Edge Functions → Deploy a new function → Via Editor accepts `index.ts`; set its function name to `research-download`, deploy and set gateway JWT verification off while preserving the function's mandatory `getUser()` checks. Current Dashboard docs describe its Deno-aware editor but warn that edits overwrite deployed code without automatic version-control rollback; retain this reviewed source. [Dashboard deployment](https://supabase.com/docs/guides/functions/quickstart-dashboard), [Gateway compatibility](https://supabase.com/kb/troubleshooting/edge-function-401-error-response)

Current default SMTP is restricted to project-team addresses and two emails/hour (subject to change), with no production delivery SLA. External signup and recovery need configured custom SMTP and actual confirmation/reset delivery tests; adding recruiters to the project team is not a workaround. [SMTP restrictions/configuration](https://supabase.com/docs/guides/auth/auth-smtp)

## Local execution, once tooling is available

Use a new isolated development directory/project, not an existing production database. Keep this backend directory outside the public site's `public/` and Vite build. Install the Supabase CLI and its supported local container runtime, then:

```sh
supabase init
```

Copy this migration, test and function into the generated `supabase/` paths and merge the function config. Do not replace a generated `config.toml` with the small snippet.

```sh
supabase start
supabase db reset
supabase test db
supabase functions serve research-download
```

`db reset` is destructive to that **isolated local** database. Do not run it on a shared or production project. The SQL tests exercise real Postgres role permissions/RLS with pgTAP; fixture inserts create metadata only, not actual Storage file bytes. End-to-end file tests require a temporary harmless uploaded PDF and actual Auth sessions.

**Completed verification:** independent static security review; Node 24 TypeScript syntax check; isolated PostgreSQL-WASM (PGlite) application of the migration twice, owner/request RPCs, reader RLS, direct Storage denial, exhaustive grant replacement/revocation and inactive-reviewer denial. The replacement DELETE test also passed isolated checks for zero-row denial, provider `42501`, actual deletion failure and propagation of other errors. These used minimal Supabase-shaped schema fixtures and do not substitute for hosted tests.

Root then installed the reviewed migration and executed the corrected **78/78 hosted pgTAP suite**. The result screenshot was inspected at `outputs/Katabasis_Supabase_Permissions_Passed.png` in the working deliverables; synthetic fixtures and temporary policies rolled back. The DELETE assertion accepts either zero affected rows or the platform's `storage.protect_delete()` denial with SQLSTATE `42501`; it never disables that guard or accepts actual deletion.

The deployed `research-download` function loaded and executed its denial/preflight branches with legacy gateway JWT verification off and its internal `getUser()` authentication intact. Recorded HTTP results were checked against the source contract:

| Recorded case | Status | Recorded response/header result |
| --- | --- | --- |
| Allowed-origin preflight | 204 | Empty body; exact allowed origin, private/no-store and nosniff |
| Missing user bearer | 401 | Sign-in required; exact allowed origin, private/no-store and nosniff |
| Invalid user bearer | 401 | Confirmed sign-in required; same recorded proxy headers |
| Publishable API key used as a user | 401 | Rejected as user identity; same recorded proxy headers |
| Untrusted origin | 403 | No allow-origin header; private/no-store and nosniff |
| Wrong HTTP method | 405 | POST required; exact allowed origin, private/no-store and nosniff |
| Anonymous catalog read | 401 | PostgREST `42501` table permission denial; no private rows/bytes. Proxy cache/CORS headers are not asserted for this separate REST endpoint |

The initial HTTP receipt is `work/hosted-access-http-denial-checks.json` outside this source tree. It records status, body, cache control, allow-origin and nosniff; it does not record allow-methods, allow-headers or exposed-response-header values. Local Deno type checking was not performed; hosted requests establish execution of the observed branches rather than every possible runtime path.

Subsequent live testing exercised the confirmed owner identity and the real owner panel's login/list/approve/revoke actions. The UUID allowlist was bootstrapped through the provider with explicit owner approval; no actual UUID or email is included in public documentation. Eight owner-selected private assets (two PDFs and six CSVs) were uploaded and registered outside the public repository.

An independent review of the recorded browser results verified **13 records: one session baseline and 12 access checks** across this matrix, without exporting or inspecting the access token:

| Same-session stage | PDF A through proxy | PDF B through proxy | Ordinary direct Storage A | Direct signing A |
| --- | --- | --- | --- | --- |
| Approved for A only | 200, SHA-256 matched | 404, ungranted | 400, denied | 400, denied |
| Reader approval revoked | 404 | 404 | 400, denied | 400, denied |
| Access restored | 200, SHA-256 matched | 200, SHA-256 matched | 400, denied | 400, denied |

All 13 records reported the same in-memory identity/access-token equality; the three successful PDF deliveries matched the original hashes. All six proxy responses reported private/no-store cache control, and successful responses reported the expected attachment filenames. CORS-origin and nosniff values were not browser-readable in this run; null did not establish their absence or independently verify them. Anonymous requests against actual uploaded objects also remained denied: public/direct/signing routes returned 400 and the anonymous catalog returned 401/`42501`.

The temporary acceptance harness has been removed from the built site. Production CORS was restored and independently checked by HTTP: `https://katabasis.rip` preflight returned 204, while the former localhost origin returned 403. The provider configuration contains only that production origin.

The sender domain is verified, and both branded confirmation/recovery HTML templates are saved in the provider. The owner created and entered the scoped sending credential directly; no agent read, copied or stored it. A real GoTrue recovery request for the existing owner returned HTTP 200 and was accepted; the sending provider then marked the matching branded recovery email **Delivered**. The email body/recovery link was not opened and no password was changed. The Auth Site URL is `https://katabasis.rip/research-access/`, with the two exact allowed return URLs `https://katabasis.rip/research-access/` and `https://katabasis.rip/research-access/?access=recovery`.

These observations do not claim a complete new-visitor signup/email-confirmation UI run with custom SMTP, another real reader account's HTTP behavior, six-CSV byte verification, in-flight/midstream revocation or an actual password change through recovery.

## Provider completion work

1. **Installed:** the owner project and reviewed migration are in place. Keep `research_access_private` **out of exposed API schemas**. Review advisors; private authenticated-executable helpers are intentional, narrowly guarded and never grant general writes. [Definer/RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security), [Function security](https://supabase.com/docs/guides/database/functions)
2. **SMTP configured; recovery delivery verified:** the sender domain and both branded email templates are configured, and a real recovery request was accepted with provider-reported delivery. The owner entered the scoped credential directly. Keep email confirmation enabled, Site URL `https://katabasis.rip/research-access/` and the two exact return URLs above. Default Supabase SMTP is not used for general recruiter registration. [Passwords](https://supabase.com/docs/guides/auth/passwords), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Redirects](https://supabase.com/docs/guides/auth/redirect-urls)
3. **Deployed; denial/preflight checked:** `research-download` uses **`verify_jwt = false`**, with explicit `auth.getUser(bearerToken)` and both live user-scoped RLS checks intact. Current hosted environments inject `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEYS` and `SUPABASE_SECRET_KEYS`; the implementation also accepts modern singular local variables and injected legacy fallbacks. Do not copy any secret into the frontend/GitHub/Vite environment. Keep **`RESEARCH_ALLOWED_ORIGINS=https://katabasis.rip`**; add exact localhost origins only for local testing. No wildcard origins. [Verified Auth lookup](https://supabase.com/docs/reference/javascript/auth-getuser), [Environment/keys](https://supabase.com/docs/guides/functions/secrets)
4. **Owner and PDF access verified:** the confirmed owner reviewer is bootstrapped, eight assets are registered, and the two-PDF same-session grant/revoke/restore matrix passed. Continue to upload private files only to private Storage with immutable versioned paths; no private document, database dump or privileged credential belongs in the public repo/dist/history.
5. **Verification limits:** production CORS and recovery-email delivery are verified. A complete new-visitor UI run with custom SMTP, recovery-link consumption/password change and additional real-reader/CSV-byte tests were not performed; record any such later checks separately rather than inferring them from the completed owner/database/PDF/delivery results.

## Required real HTTP acceptance checks

Use temporary confirmed test identities A/B and harmless files A/B. Never use real private research for acceptance tests.

| Caller/action | Expected |
| --- | --- |
| Anonymous, malformed JWT, expired JWT, unconfirmed email; proxy | No bytes; 401/403 (platform may reject first) |
| Confirmed pending account; request RPC then catalog/proxy | Own pending request only; empty catalog and no bytes |
| Approved A/granted A requests B UUID; B requests A UUID | No other material metadata or bytes |
| Ordinary client attempts status/grant/material writes or another user's contact read | Denied/empty; no privilege change |
| Approved A invokes private bucket authenticated download, signing/sign-many, upload/update/delete directly | Denied, even with a permissive policy on another bucket |
| Approved A requests its permitted material through proxy | Correct harmless bytes; attachment, nosniff, exact CORS origin and no-store/no-cache headers |
| Revoke grant/account while retaining A's same JWT; retry proxy with old body and cache enabled | No new authorized delivery; catalog empty; no signed/public URL workaround |
| Revoke during a deliberately slow provider fetch | Second RLS check blocks response if revoked before final check |
| Omit/spoof external Origin, extra `storage_path` field, invalid/oversized JSON, wrong method | Denied without path disclosure; spoofing an allowed Origin still requires valid JWT and RLS grant |
| Forgot/reset email, invalid/reused recovery link, logout/reload/Back | Generic recovery response, valid recovery session required, UI/session/blob URLs cleared; direct file delivery remains blocked |

The ordinary direct-Storage restrictions prevent callers from minting replayable signed URLs. Tests must inspect actual network responses rather than relying on UI visibility. Supabase's recommended SQL testing approach uses real role switches and rollback-isolated pgTAP fixtures. [RLS testing](https://supabase.com/docs/guides/database/postgres/testing-row-level-security)

Logout clears the local session and temporary Blob URLs, and ends the refresh session. A previously issued access JWT may remain usable until expiry; `getUser()` does not promise immediate token invalidation after logout. The stronger next-request guarantee here is **database approval/grant/reviewer revocation**, which is read live even with the same unexpired JWT. [Session lifetime](https://supabase.com/docs/guides/auth/sessions), [Sign-out behavior](https://supabase.com/docs/guides/auth/signout)

## Gateway compatibility correction, November 8, 2026

Official documentation currently conflicts. The October 22 Authorization headers guide says the gateway accepts asymmetric user JWTs. The newer November 3 troubleshooting article calls it a legacy check and directs asymmetric-key projects to turn it off; the November 5 signing-keys guide also warns that it can break Edge Functions. This foundation therefore uses `verify_jwt = false` for compatibility and performs mandatory authentication itself. This is an implementation choice in response to the dated conflicting guidance, not a claim that every hosted gateway currently rejects asymmetric keys. [October 22 reference](https://supabase.com/docs/guides/functions/auth-headers), [November 3 troubleshooting](https://supabase.com/kb/troubleshooting/edge-function-401-error-response), [November 5 signing-key guidance](https://supabase.com/docs/guides/auth/signing-keys)

The security consequence is that unauthenticated requests can execute the handler and consume runtime, but cannot reach private lookups or bytes: missing/malformed bearer headers are rejected, Auth must validate a confirmed user, and current database approval/grants are checked twice. The public `apikey` is not treated as a user. CORS only limits browser origins; it does not replace authentication. Do not remove these checks to resolve deployment errors.

Node syntax validation alone cannot establish runtime or provider behavior. Hosted migration/database checks, owner authentication/review, denial/preflight, the two-PDF same-session access/revoke/restore matrix, production-only CORS and provider-reported recovery-email delivery have now been exercised as described above. New-visitor confirmation UI and an actual password change through recovery are not claimed.
