# Global World Registry and Character Creator Foundation

**Status:** Engine-independent data foundation; not yet connected to the 3D client, account backend, save migration or visual avatar editor.

## World registry

`src/core/world-regions.js` adds a versioned registry for global region metadata:
- Region IDs, display names, country codes, city, content-pack reference and status.
- Explicit statuses: `planned`, `prototype`, `available`, `retired`.
- Typed travel connections: road, rail, air, sea or authored transition.
- Immutable add/connect operations and registry version increments.
- Validation against duplicate IDs and dangling routes.
- Queries for available regions and routes touching a region.

This intentionally does not fabricate a fully playable global map. Candidate hubs can be recorded as planned; only regions explicitly marked available are returned as available. Agege remains the existing prototype district until actual content is built and tested.

## Character creator data contract

`src/core/character-creator.js` adds a versioned character profile:
- Stable player and character IDs, handle and character display name.
- Starting region/district and approved opening scenario.
- Background and first career interest.
- Appearance preset IDs rather than arbitrary asset paths.
- Bounded personality tendencies and up to five aspirations.
- Interface language and accessibility preferences.
- Controlled profile updates that preserve player identity and starting location.

This is not yet a rendered character creator, account registration flow, avatar rig, asset catalogue or cloud save. The character profile deliberately uses fictional character information; it should not require a player's legal name or sensitive personal data.

## Integration contract and next work

1. Seed the registry with Lagos/Agege as the actual prototype and other candidate cities as planned metadata only.
2. Add region/district compatibility validation to new-life creation.
3. Connect character creation to the existing shared player identity and save migration.
4. Build an accessible visual creator using approved original/licensed appearance presets.
5. Add content-pack manifests, signed/versioned publishing and region-level compatibility checks.
6. Add travel selection to the world client only when destination content is available.

Run `npm test` with Node 20 or newer. These files are designed to be dependency-free and deterministic; CI must still verify the branch after commit.
