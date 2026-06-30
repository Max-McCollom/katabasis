# Public telemetry contract

Everything in this directory is a static site asset and must be assumed public.
If a browser can request it from the deployed site, it is not protected by a
client-side login, hidden route, blurred DOM node, or render gate.

This directory may contain only demo-safe payloads:

- synthetic demonstration data,
- explicitly redacted records,
- irreversible public aggregates,
- payload-empty placeholders for private cockpit surfaces.

Real telemetry requires a separate private application with authenticated
server-side authorization before bytes are returned. Real telemetry must not be
committed here, shipped as static JSON, embedded in source, or hidden in the UI.

Every panel payload must declare exactly one `state`:

- `READY`
- `PARTIAL`
- `MISSING`
- `GATED`
- `PROPRIETARY_REDACTED`
- `DEMO_SYNTHETIC`

Every public fixture must also declare provenance. Synthetic payloads use
`DEMO_SYNTHETIC` and must be visibly labeled by any panel that renders them.

Redaction means removing fields from exported payloads. It does not mean hiding,
masking, blurring, or omitting values only in DOM/UI after the browser has
downloaded them.

## Validation

Run `npm run check:telemetry` before committing public telemetry fixture changes.
