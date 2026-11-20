# Gameplay Core

This directory contains engine-independent rules that can be tested without a 3D editor or GPU.

Current modules:
- `life.js`: character-life creation, safe continuation and age progression.
- `business.js`: first-business economy rules for an akara stand.
- `npc.js`: deterministic daily activity and location resolution, including overnight schedules and overlap validation.
- `world.js`: deterministic world clock, validated district/location/road records, neighbour lookup and lowest-cost road pathfinding.
- `save.js`: versioned game snapshots with active-life/business ownership checks, world-clock validation and detached load copies.

These are domain foundations, not a playable 3D game and not yet connected to Unreal Engine. Keep rendering, input, animation and world presentation in the game client. The logical road graph and world clock are engine-independent simulation contracts; City Form remains a separately pinned upstream reference. When the engine integration is ready, connect the simulation through FRA GAMES-owned interfaces and retain parity tests.

Run tests with Node.js 20 or newer using `npm test`.
