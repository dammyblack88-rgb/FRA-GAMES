# Player Start Integration Foundation

## Purpose

Connect the existing character creator to the shared world identity and first-life systems. A completed character profile should become the same persistent player identity and opening life, rather than three disconnected records.

## Implemented

- `createPlayerStart` validates the character profile and selected region/district.
- Creates the shared world identity using the character's stable player ID and handle.
- Registers the shared-world experience once.
- Creates the opening life with the chosen character name, origin and opening scenario.
- Returns a detached character profile with identity, life and starting-point records.
- `validatePlayerStart` checks that player IDs, names, scenarios and starting location remain consistent.
- Automated tests cover the happy path, mismatched region/district, input immutability and cross-record consistency.

## Current Lagos prototype mapping

The caller supplies explicit region metadata for `lagos-ng` and district ID `agege-core`. This integration does not silently treat planned global cities as playable. A region must be selected and supplied by the world registry/content layer.

## Boundaries

- This is an engine-independent local data bootstrap, not a user account, authentication system, cloud save or cross-device sync.
- It does not yet migrate existing save files or change the browser MVP UI.
- The caller must provide trusted region metadata; server-side validation will be required for online sessions.
- No paid service, external API or proprietary third-party game asset is introduced.
