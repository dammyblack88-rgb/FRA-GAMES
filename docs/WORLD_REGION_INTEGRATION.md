# Global Region and District Connection

## Implemented

- Added a content-backed global region catalogue.
- Lagos is explicitly marked as a prototype and points to the existing `fra-lagos-first-district` content pack.
- Abuja, Accra, Johannesburg, London, New York and Tokyo are planned entries only.
- `resolveWorldStartLocation` checks region registration, playable status, content-pack identity, district region label and the required player home location.
- `createRegisteredPlayerStart` uses the validated registry result to create the player's opening life.
- Tests cover Lagos resolution, successful life creation, planned-region blocking and invalid district mappings.

## Compatibility

The existing first-district ID and content are preserved. This work does not rename or rebuild the district. New registered starts must use its actual ID: `fra-lagos-first-district`.

## Boundaries

- A prototype region is not a finished city or a production-ready open world.
- Planned city entries are catalogue metadata only; they do not imply playable maps, travel, streaming or city simulation.
- Region and content-pack validation is local engine-independent logic. Online multiplayer and server-authoritative world access still need backend enforcement.
