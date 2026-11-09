# Research access

The public research publication remains open. Detailed research is shared
through a separate authenticated library, with Max's approval required.

## Visitor flow

1. Open Research access and create an account with email and password.
2. Optionally provide a name and phone number. Phone is contact information,
   not a sign-in method or an SMS service.
3. Confirm the email address and sign in.
4. Wait for owner review. A pending, rejected or revoked account cannot read
   private material metadata or download files.
5. After approval, view the materials specifically shared with that account.

Password recovery uses an emailed link and a recovery-authenticated session.
Ordinary restored sessions cannot authorize a reset from a URL marker alone.

## Owner review

The owner signs in with a confirmed account explicitly provisioned as a reviewer
by the provider owner. The review panel lists access requests and their status.
Approve shares the selected published materials; reject denies a request;
revoke stops subsequent authorized delivery. Client-supplied metadata and a
matching display name never make someone a reviewer.

Grant revocation cannot remove bytes a recipient has already downloaded.
Use immutable versioned objects when updating research.

## Deployment configuration

The frontend is a static GitHub Pages build. The only browser variables are:

- `VITE_SUPABASE_URL`: the public project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the public `sb_publishable_` key.

Never supply a privileged key through a `VITE_` setting. The server download
function uses provider-managed credentials, validates the current Auth identity
and checks current database permission before and after fetching file bytes.

Configure email/password authentication, email confirmation, a verified SMTP
sender, the production Site URL and exact portal confirmation/recovery redirects.
The default trial sender is insufficient for visitor signup. Keep the private
helper schema outside the Data API's exposed schemas.

The production Site URL is `https://katabasis.rip/research-access/`.
Allow exactly that URL and its `?access=recovery` variant as email redirects.
Account emails use the verified `auth.katabasis.rip` sending domain. SMTP
credentials are entered directly in the provider, never in repository settings.

## Publication boundary

Private PDFs, source tables and working research stay outside the public repo
and build. Upload cleared files directly to the private bucket and register
their immutable paths in the protected catalog. Ordinary clients cannot read,
write or sign Storage objects directly. Downloads use authenticated,
permission-checked responses and no-store headers, never public or signed URLs.

## Acceptance

Verify real signup/confirmation/sign-in, recovery and logout. Check anonymous,
unconfirmed, pending, rejected, revoked, approved-ungranted and approved-granted
identities. Check cross-user/material denial, attempts to alter review state,
direct Storage access and revocation with the same still-valid session.

Owner privileges must come from the server allowlist. Test that ordinary users
cannot list other requests, invoke owner actions or spoof a reviewer role.
Local render fixtures and successful builds do not establish these guarantees.

The installed backend passed 78 hosted SQL/RLS assertions and real browser
grant/revoke/restore checks with the same authenticated session. Permitted PDF
responses matched the uploaded hashes; ungranted/revoked delivery and direct
Storage download/signing were denied. The recovery email was delivered through
the configured sender. Its link was not opened and no password was changed.
