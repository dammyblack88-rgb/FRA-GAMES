# NEXT WORLD — Shared Identity Foundation

**Status:** Implemented as an engine-independent gameplay-core module; automated verification is pending CI.

## Purpose

Compatible NEXT WORLD experiences should recognise one player identity and preserve selected achievements across game modes. A player may begin in a city-life experience, later enter a movement challenge or a sports career, and still retain a coherent profile and legacy.

This module establishes the data contract only. It does not create accounts, authenticate players, synchronise data online or grant one game authority over another game's private save.

## Current API

Import from `src/core/identity.js`:

- `createWorldIdentity({ playerId, handle, createdAt, homeRegion })`
- `registerWorldExperience(identity, { gameId, playedAt })`
- `recordWorldMilestone(identity, { eventId, gameId, type, title, occurredAt, metadata })`
- `getWorldIdentitySummary(identity)`

The identity contains a stable player ID, public in-game handle, home region, registered compatible experiences and a milestone history. It deliberately contains no email, password, phone number or real-world identity fields.

## Integrity rules

- Schema version is explicit.
- Each game experience is registered once; repeated registration does not reset its first-played date.
- A milestone must belong to a registered game.
- Milestone event IDs are idempotency keys; replaying the same event does not duplicate history or counters.
- IDs and required labels are validated.
- Summary data is detached from the source snapshot.
- Functions return new snapshots rather than mutating the caller's save.

## What is not included yet

- Online accounts, authentication, server authority or cloud synchronisation.
- Cross-device saves, multiplayer trust, anti-cheat or conflict resolution.
- A production privacy/consent model or parental controls.
- Transfer of currency, paid items or competitive rankings between games.
- A migration of existing browser MVP localStorage saves.

Do not use this client-side module as a security boundary. When online play is introduced, the server must validate milestone events and decide which progress is eligible for cross-experience display. Competitive rewards and purchases must remain server-authoritative.

## Next compatible systems

1. Character profile and life-history schema with versioned migrations.
2. Relationship and reputation records with explicit source events.
3. District ownership and business records linked to a player identity.
4. NPC memory and world-history event contracts.
5. A server-owned identity/save service after the first playable slice is proven.

The first public MVP remains a compact 3D prototype. This foundation is designed to be reusable by the existing browser validation client and the planned Unreal Engine runtime without making either one the authority for online identity.
