# Gameplay Core

This directory contains engine-independent rules that can be tested without a 3D editor or GPU.

Current modules:
- life.js: character-life creation, safe continuation and age progression.
- business.js: first-business economy rules for an akara stand.
- inventory.js: player wallet and item inventory, finite-stock shops, atomic buy/sell transactions and duplicate-safe ledgers.
- npc.js: deterministic daily activity and location resolution, including overnight schedules, overlap validation and shared-clock population snapshots.
- world.js: deterministic world clock, validated district/location/road records, neighbour lookup and lowest-cost road pathfinding.
- save.js: versioned game snapshots with active-life/business ownership checks, world-clock validation, wallet/inventory, interaction consumption/event history, mission progress and shared experience progression.
- missions.js: deterministic mission definitions, distinct mission-run IDs, objective progress, completion events, and atomic one-time rewards applied to the player's wallet ledger and experience progression.
- interactions.js: validated local NPC conversations, item pickups, finite shop transactions, bus-stop travel, service interactions and mission-event bridging.

These are domain foundations, not a playable 3D game and not yet connected to Unreal Engine. Keep rendering, input, animation and world presentation in the game client. The logical road graph and world clock are engine-independent simulation contracts; City Form remains a separately pinned upstream reference. src/content/first-district.js supplies the initial fictional Lagos neighbourhood layout and six resident schedules as testable seed content. When the engine integration is ready, connect the simulation through FRA GAMES-owned interfaces and retain parity tests.

Run tests with Node.js 20 or newer using npm test.
