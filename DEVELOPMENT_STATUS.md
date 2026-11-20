# FRA GAMES — Development Status

**Last updated:** 2026-11-20  
**Overall state:** Foundation phase. Core logic tests pass. Not a playable 3D game. Not production-ready.

## Confirmed and committed

- Project repository: dammyblack88-rgb/FRA-GAMES.
- Product vision, initial architecture and phased roadmap.
- Cloud-first and free-first development policy.
- Engine-independent JavaScript gameplay core:
  - New life creation with origin and opening scenario.
  - Safe continuation of an existing save without resetting identity/history.
  - Age progression and event history.
  - Akara stand business model with stock, sales, cash and ledger records.
  - Player wallet and item inventory, finite-stock shop catalogue, atomic buy/sell transactions, safe-naira arithmetic and duplicate transaction protection.\n  - Local interaction registry for scheduled NPC conversations, one-time item pickups, shop trading, authored bus-stop destinations and service interactions.\n  - World interaction events with duplicate-event protection and a mission-objective bridge for talk, pickup, travel, service and trade objectives.\n  - First-district interaction seed: Mama Kemi, provision stall, dropped bread, community bus stop, clinic and workshop service points.
  - Save snapshots now include optional validated player economy state (wallet, unique item quantities and transaction ledger).
  - Deterministic NPC daily schedules, location/activity resolution, overnight shifts and overlap validation.
  - Shared-clock NPC population simulation with stable identities and district-location validation.
  - First fictional Lagos district seed: eight locations, eight road links, a 50 m blockout grid and six scheduled residents.
  - Deterministic world clock with pause/time-scale and calendar rollover.
  - Validated district locations and one-way/two-way road connections.
  - Lowest-cost road pathfinding with disconnected-route handling.
- Versioned game-save snapshots with player-life references, business ownership integrity, world-clock validation and detached load/restore.
- Mission definitions, typed objectives, deterministic progress/completion events and reward-claim state with duplicate-event protection.
- Native Unreal world-simulation bridge source: per-world clock state, pause/time scale, validated district graph and Dijkstra routing exposed to Blueprint.
- Dependency-free Node.js test suite and GitHub Actions workflow.
- Open-source candidate desk audit in docs/OPEN_SOURCE_AUDIT.md.
- No paid cloud GPU, subscription, AI API, asset or upgrade is authorised.

## Automated test evidence

GitHub Actions workflow: Core gameplay tests.

- Latest previously completed run: https://github.com/dammyblack88-rgb/FRA-GAMES/actions/runs/44807563792 — **success** (documentation/status commit before the native subsystem bridge).
- A new run covering the Unreal scaffold structural tests and world simulation tests was triggered for commit `7c3869f` and was still in progress at the time of this update: https://github.com/dammyblack88-rgb/FRA-GAMES/actions/runs/44807342618.
- The earlier workflow run for the workflow commit also completed successfully.
- Tests cover life creation, invalid opening rejection, save continuation, age progression, business opening, sales, stock validation, restocking, NPC daily schedules, overnight shifts, invalid/overlapping schedules, world clock rollover/pause, district validation, road neighbours and weighted route finding. Structural checks also validate the Unreal project descriptor, targets, player/GameMode source and input mappings. Latest run after the NPC overlap-validation hardening: **success**.

These are headless domain-logic tests. They do not prove that a 3D game, Unreal project, graphics pipeline or playable city works.

## Not yet implemented

- Unreal Engine target selected: **UE 5.8**.
- Native Unreal C++ project scaffold committed: `FRAGames.uproject`, Game/Editor targets, runtime module, third-person player character, camera, basic movement/jump input and prototype GameMode.
- Unreal Engine/editor is not installed in the available environment; the new project has not been compiled or opened.
- Native player character and camera source classes exist, but there is no compiled or visually verified 3D character yet.
- Native `UFRAWorldSimulationSubsystem` and reflected world/road/route data structures are committed; C++ compilation and runtime parity remain unverified.
- Versioned save snapshot logic and tests are committed in `src/core/save.js` and `test/save.test.js`; this is an in-memory schema/validation layer, not cloud or disk persistence.
- Mission rules and tests are committed in `src/core/missions.js` and `test/missions.test.js`; no mission UI, world triggers, persistent reward ledger or multiplayer authority is connected yet.
- Player inventory and shop transaction rules are committed in `src/core/inventory.js` with `test/inventory.test.js`; save validation includes optional economy state.\n- Engine-independent interaction contracts are committed in `src/core/interactions.js` with `test/interactions.test.js`; first-district targets and shop stock are seeded in `src/content/first-district-interactions.js`. These are tested domain rules only—not Unreal interaction components, dialogue UI, item pickup actors, bus vehicle simulation or a durable backend.\n- Mission events can be advanced by the interaction bridge, but durable mission-state save integration and reward-to-player-wallet integration remain outstanding.
- Structural Node tests now check that the native world subsystem API and implementation are present. This is source-structure coverage only.
- First playable Lagos-inspired neighbourhood is scoped in `docs/FIRST_PLAYABLE_SLICE.md`; no 3D district or explorable world has been built yet.
- No visual NPCs, traffic or crowds. NPC population/schedule rules and first-district seed content exist only as engine-independent code; no 3D actors or Unreal district level have been created.
- No connected in-game business interaction or customer AI.
- No production save backend or UI.
- No multiplayer or creator tools.
- Two upstream repositories are pinned as Git submodules (not merged into core): City Form at `ThirdParty/CityForm` and KinetiForge Vehicles at `Plugins/KinetiForgeVehicles`. They have not yet been compiled, enabled or validated inside a FRA GAMES Unreal project.
- No third-party art assets have been imported.

## Open-source review decisions

- City Form: MIT city-simulation reference, pinned to `90810c86099a6e904d6a2e3bf17886aeb1b70fc5`; its project descriptor targets UE 5.8. It remains a pre-alpha reference, not a complete open-world game.
- KinetiForge Vehicle System: MIT vehicle physics plugin, pinned to `7b918afa47e824f21eac3a6dfd3543979cc37ab5`; UE 5.8 compatibility is unverified for this exact pinned revision and must pass a compile/runtime spike.
- ALIS: modular Unreal architecture reference; component-specific licences make casual copying inappropriate.
- GT-Caliber: MIT game code, but its major asset submodule is private/gated and separately licensed; not selected as the base.
- Unreal Open World Starter: Apache-2.0 framework reference with third-party component notices; do not merge the whole bundle blindly.
- City Generator: MIT workflow reference, with Houdini/Unreal and OpenStreetMap data obligations.

These two sources are approved for isolated submodule tracking only, not production integration. Details and setup instructions are in `docs/OPEN_SOURCE_AUDIT.md` and `docs/UPSTREAM_ENGINE_SETUP.md`.

## Immediate engineering sequence

1. Compile and open the committed UE 5.8 C++ scaffold on a compatible workstation.
2. Create a small Open World test level and verify player movement, camera and jump.
3. Compile and validate the FRA GAMES-owned Unreal world subsystem, then connect the seeded district and NPC population snapshots with parity tests.
4. Build the home-to-market greybox route and first business interaction.
5. Compile City Form and KinetiForge in isolation; validate the Windows toolchain, runtime behavior, licence notices and performance.

## Hardware and cloud constraints

The current PC can support browser-based development, Git operations, documentation and lightweight code work. It is not suitable for authoring and rendering a large high-fidelity UE5 city project.

A free cloud coding environment is not equivalent to a remote GPU workstation. High-end rendering, editor operation and packaging may need a future capable computer or paid GPU access. No such spend should occur without explicit approval.

## Definition of done

Every feature must include:
- Repository path and implementation summary.
- Steps to run it.
- Test performed and result.
- Known limitations.
- Licence/source notes for imported code or assets.
