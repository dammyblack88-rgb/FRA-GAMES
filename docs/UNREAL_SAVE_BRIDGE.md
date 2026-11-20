# Unreal Local Save Bridge

**Status:** C++ source committed; not compiled or runtime-tested in Unreal Engine 5.8.

## Source

- `FRAPlayerSaveGame.h` defines a versioned `USaveGame` snapshot.
- `FRAPlayerSaveSubsystem.h/.cpp` exposes validated save-slot and load-slot calls to Blueprint.
- The save model includes player identity, life slots and active life, world district and clock, wallet, experience, inventory, economy transaction IDs/details, businesses and stock, NPC location/activity snapshots, repeatable mission runs and objective/event history, and consumed interaction targets/events.

## Validation

The subsystem rejects:
- Unsupported save schema versions and empty player/district identities.
- Missing or duplicate life IDs and an active life that is not in the saved life list.
- Negative wallet, experience or business balances.
- Duplicate/invalid inventory items, businesses, NPC identities, mission run IDs, objective IDs, mission event IDs, economy transaction IDs and consumed interaction IDs.
- Mission runs with invalid status, impossible objective progress or a completion status inconsistent with objective completion.

`SaveToSlot` validates before writing and stamps the UTC save time. `LoadFromSlot` checks that the slot exists, casts to the expected save class and validates the restored snapshot before returning it.

## Current limitations

- This is local Unreal save-slot persistence, not cloud synchronisation or server-authoritative multiplayer persistence.
- The save data model and slot subsystem are not yet wired to the live player, business, NPC, interaction or mission actors.
- No migration beyond schema version 1 exists yet. A future breaking change must add an explicit migration path rather than silently changing the saved structure.
- C++ compilation, editor startup, save/reload runtime testing and packaged-build testing remain outstanding because Unreal Engine is not available in the current execution environment.

The headless Node test suite can verify source structure only; it does not compile or execute these Unreal classes.
