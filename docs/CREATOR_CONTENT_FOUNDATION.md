# Player Creator Content Draft and Publishing Foundation

**Status:** Engine-independent content workflow foundation; not yet connected to an account backend, creator UI, asset storage, automated moderation or public catalogue.

## Supported creator types

Mission, character, business, home, district, story and tournament records share one versioned workflow. A creator can prepare a private draft with a region, content rating, structured payload and declared asset rights.

## Controlled publishing workflow

`draft → submitted → approved → published`

Alternative review outcomes:
- `changes-requested`: creator can revise and resubmit.
- `rejected`: cannot be published.
- `archived`: permitted for rejected or previously published records.

Submission runs deterministic validation. Publishing is only allowed after an explicit approval decision. New content can target a limited test audience before the wider catalogue. A draft is never made public automatically.

## Rights and safety foundations

- Assets must declare original, licensed or public-domain rights.
- Non-original assets require rights evidence/reference.
- Content carries an age/content rating and a region reference.
- Moderation decisions retain reviewer ID, decision, note and timestamp.
- Content records are immutable-style values; each transition returns a new record.

This is a data contract, not a complete trust-and-safety system. Production still requires server-side authorisation, reviewer roles, automated and human moderation, report/takedown/appeal workflows, copyright evidence review, asset scanning, audit storage and secure catalogue publishing. A client must never be trusted to approve or publish its own content.

## Next integration work

1. Bind owner IDs to authenticated accounts and server-enforced permissions.
2. Add draft autosave and creator-friendly guided forms.
3. Add schema-specific validation for each content type and region.
4. Connect review queues, community reports, takedowns, appeals and version rollback.
5. Add asset storage with malware scanning, licence metadata and attribution.
6. Add limited-audience playtests and quality/safety analytics before public discovery.
