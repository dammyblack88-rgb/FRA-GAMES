# NEXT WORLD — Shared Identity Foundation

**Status:** Implemented as engine-independent gameplay-core modules; automated verification is running in GitHub Actions.

## Purpose

Compatible NEXT WORLD experiences should recognise one player identity and preserve selected achievements across game modes. A player may begin in a city-life experience, later enter a movement challenge or a sports career, and still retain a coherent profile and legacy.

These modules establish data contracts only. They do not create accounts, authenticate players, synchronise data online or grant one game authority over another game's private save.

## Shared player identity API

Import from `src/core/identity.js`:

- `createWorldIdentity({ playerId, handle, createdAt, homeRegion })`
- `registerWorldExperience(identity, { gameId, playedAt })`
- `recordWorldMilestone(identity, { eventId, gameId, type, title, occurredAt, metadata })`
- `getWorldIdentitySummary(identity)`

The identity contains a stable player ID, public in-game handle, home region, registered compatible experiences and a milestone history. It deliberately contains no email, password, phone number or real-world identity fields.

## NPC relationship API

Import from `src/core/relationships.js`:

- `createRelationshipState(ownerId)`
- `applyRelationshipEvent(state, { eventId, targetId, dimension, delta, occurredAt })`
- `getRelationship(state, targetId)`

Relationships separately track **trust, respect, affection and familiarity** from 0 to 100. Authored world events adjust one dimension at a time, and event IDs prevent retries from applying the same consequence twice. This is a deterministic relationship ledger, not yet a complete NPC memory or dialogue AI.

## Integrity rules

- Schema versions are explicit.
- Each game experience is registered once; repeated registration does not reset its first-played date.
- A milestone must belong to a registered game.
- Relationship event IDs are idempotency keys.
- Relationship scores are clamped to 0–100.
- Self-relationships, unknown dimensions, duplicate IDs and invalid references are rejected.
- Summary and lookup data are detached from source snapshots.
- Functions return new snapshots rather than mutating the caller's save.

## What is not included yet

- Online accounts, authentication, server authority or cloud synchronisation.
- Cross-device saves, multiplayer trust, anti-cheat or conflict resolution.
- A production privacy/consent model or parental controls.
- Transfer of currency, paid items or competitive rankings between games.
- A migration of existing browser MVP localStorage saves.
- Full NPC episodic memory, independent goals, dialogue generation or relationship decay.

Do not use these client-side modules as a security boundary. When online play is introduced, the server must validate milestone and relationship events and decide which progress is eligible for cross-experience display. Competitive rewards and purchases must remain server-authoritative.

## Next compatible systems

1. Character profile and life-history schema with versioned migrations.
2. District ownership and business records linked to a player identity.
3. NPC memory and world-history event contracts.
4. Persistent neighbourhood simulation and daily world events.
5. A server-owned identity/save service after the first playable slice is proven.

The first public MVP remains a compact 3D prototype. These foundations are designed to be reusable by the existing browser validation client and the planned Unreal Engine runtime without making either one the authority for online identity.
