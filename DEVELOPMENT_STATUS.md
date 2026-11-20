# NEXT WORLD / FRA GAMES — Development Status

**Last updated:** 2026-11-20  
**Product identity:** NEXT WORLD  
**Repository:** `dammyblack88-rgb/FRA-GAMES`  
**Studio:** SimeonJr Studios  
**Overall state:** Gameplay foundation, first browser-playable 3D MVP, and native Unreal source scaffold. The MVP is an early low-poly prototype; the Unreal project is not yet compiled. Development is cloud-first; the founder's PC must not be a required build/render host.

## Product boundary

NEXT WORLD is the original connected-world game IP being developed in this repository. FRA GAMES is the repository/workspace and SimeonJr Studios project label in this workstream. The earlier FRA GAMES free games-library/launcher concept (a searchable collection of independently licensed online/offline games) is a separate product idea; it must not be confused with NEXT WORLD or used as a reason to combine unrelated games into NEXT WORLD.

## Vision and non-negotiable principles

- One persistent universe, one connected character identity and life history, shared progression/economy/property and save systems.
- **Non-negotiable presentation requirement:** the game itself is a real-time, fully 3D, explorable and playable world. 2D interfaces may be used for menus/maps, but a 2D/1D game or text simulation is not an acceptable substitute.
- Lagos first: a fictional, researched, Lagos-inspired neighbourhood, then other Nigerian, African and international regions.
- Life simulation, original stories, jobs, businesses, sport, entertainment, action and later creator experiences are modules in one world—not six separate games joined together.
- New Life creates a new identity; Continue Life restores the existing one without silently resetting history.
- Players create through understandable in-world menus, voice-assisted structured proposals later, and approved modular templates—not by being exposed to a developer editor.
- NPCs should have identities, roles, schedules, households, relationships, goals and bounded memories.
- Multiplayer, player-created worlds, advanced AI and voice are later milestones, not features to pretend are already working.
- Original IP only. No unauthorised GTA/FIFA/WWE/Sims code, maps, characters, brands, music or assets.
- Free-first. No paid GPU, cloud backend, API, subscription, asset, upgrade or purchase without explicit approval.
- Reuse open-source projects selectively after exact licence, dependency, engine-version, build and performance review.

## Implemented engine-independent gameplay foundation

- `src/core/life.js`: New Life scenarios, Continue Life validation and age progression.
- `src/core/business.js`: akara-stand stock, sales, cash, expenses and ledger rules.
- `src/core/inventory.js`: player wallet, item inventory, finite-stock shops, buy/sell transactions and duplicate-safe transaction ledgers.
- `src/core/npc.js`: deterministic daily schedules, overnight shifts, overlap checks and shared-clock NPC population snapshots.
- `src/core/world.js`: deterministic world clock, pause/time scale, calendar rollover, validated districts/roads, neighbours and Dijkstra routing.
- `src/core/missions.js`: mission definitions, distinct run IDs, objectives, progress/completion events and atomic one-time rewards to wallet ledger and experience progression. Objectives can be constrained to a specific NPC, shop, item, bus stop or service.
- `src/core/interactions.js`: validated NPC conversations, one-time pickups, shop trading, authored bus-stop travel, service use and mission event bridging. Mission events only count when authored target constraints match.
- `src/core/save.js`: versioned, detached in-memory game-save snapshots for life identity, world, businesses, NPCs, wallet/inventory/ledger, consumed interactions, mission runs and progression. Validation rejects broken references, duplicate IDs and inconsistent mission state.
- `src/content/first-district.js`: first fictional Lagos neighbourhood seed: eight locations, eight road links, 50 m planning grid and six scheduled residents.
- `src/content/first-district-interactions.js`: Mama Kemi, provision stall, dropped bread, community bus stop, clinic and workshop interaction targets.
- `src/content/first-district-missions.js`: "Your First Morning"—greet Mama Kemi, buy bread from the named provision stall and ride the named community bus; one-time reward of ₦750 and 100 experience.

## Native Unreal Engine source foundation

**Target:** Unreal Engine 5.8. Exact C++ compilation and runtime verification remain outstanding.

- `FRAGames.uproject`, Game/Editor targets and runtime module.
- Native third-person player character, camera boom/follow camera, keyboard/mouse movement and jump, and prototype GameMode.
- `UFRAWorldSimulationSubsystem`: per-world clock, pause/time scale, validated district graph and shortest-route API exposed to Blueprint.
- Native player interaction interface and camera-forward trace component with contextual prompt/target APIs and E-key dispatch.
- `AFRAWorldInteractableActor`: reusable Blueprintable actor base with visual mesh slot, prompt, enabled/range checks and Blueprint response event.
- Versioned `USaveGame` data model and GameInstanceSubsystem slot save/load API with validation for life, economy, NPC, mission and interaction records.
- `AFRAFirstDistrictBlockout`: source for a procedural 300 m × 300 m ground plane, eight road corridors and greybox masses for home, bus stop, market, akara stand, clinic, school frontage and workshop. It is not yet placed in a map.

## Open-source candidates and licence decisions

Pinned, isolated Git submodules (not merged into the runtime):
- City Form, MIT, pinned at `90810c86099a6e904d6a2e3bf17886aeb1b70fc5`; UE 5.8 city simulation/roads/zoning reference, pre-alpha.
- KinetiForge Vehicle System, MIT, pinned at `7b918afa47e824f21eac3a6dfd3543979cc37ab5`; vehicle physics candidate, exact pinned revision's UE 5.8 compatibility unverified.

Other reviewed candidates:
- ALIS: component-specific mixed licences; no casual copying.
- GT-Caliber: game code MIT, but gated/private large asset submodule and separate asset licences; not selected as the base.
- Unreal Open World Starter: Apache-2.0 framework reference with third-party notices.
- City Generator: MIT workflow reference with Houdini/Unreal and OpenStreetMap data obligations.

See `docs/OPEN_SOURCE_AUDIT.md`, `docs/UPSTREAM_ENGINE_SETUP.md` and `LICENCE_AND_ASSET_REGISTER.md`.

## Automated verification

- Node.js 20+ dependency-free test suite; run with `npm test`.
- Latest completed code test run: [GitHub Actions run 44823165712](https://github.com/dammyblack88-rgb/FRA-GAMES/actions/runs/44823165712), commit `b6d6211fd586bdc67bc331a0812c970024158282`.
- **69 tests passed, 0 failed.**
- Coverage includes life, business, inventory, save validation, world clock/routing, NPC schedules/population, district content, interactions, target-specific mission progress/rewards and Unreal source-structure checks.
- These tests do not compile Unreal C++, launch the editor, render a 3D level or prove a packaged game is playable.

## Not yet implemented / verified

- Unreal 5.8 has not been compiled or opened in the available environment.
- No committed Unreal map/level, PlayerStart placement or visually verified district.
- No final player/NPC/vehicle art, animation, dialogue UI, traffic simulation, weather presentation, audio or Lagos-specific environment art.
- The procedural blockout actor has not been placed in a level or previewed in Unreal.
- Unreal save-slot subsystem is not yet connected to live player, economy, mission, NPC and interaction actors.
- The engine-independent JavaScript save layer is in-memory snapshot validation; it is not durable disk/cloud persistence.
- Mission, shop, bus, pickup and NPC rules are not yet connected end-to-end to Unreal actors and UI.
- No vehicle driving implementation verified in Unreal; KinetiForge remains an uncompiled candidate.
- No sports career, club ownership, property construction, advanced career system, multiplayer, voice/AI runtime, creator marketplace or international map is implemented.
- No packaged playable build or public release.

## Browser MVP status

A first real-time 3D browser prototype now lives in `mvp/`. It uses Three.js/WebGL, a third-person player, a compact Lagos-inspired blockout, four ambient NPCs, a Mama Kemi conversation, bread purchase and bus interaction mission, a local browser save and a small HUD. It is intended for free static hosting and early feedback. It is not a 2D/1D substitute, but it is also not the final Unreal production game. It has no server, multiplayer, account system, cloud save, advanced NPC AI, drivable vehicles or final art. The first public URL is conditional on GitHub Pages being enabled and its deployment workflow succeeding.

The browser prototype is a low-cost validation client. Preserve the existing engine-independent gameplay rules and keep the production Unreal Engine 5.8 project intact; do not silently redefine the browser prototype as the final engine.

## Cloud-first development and build strategy

The founder's personal workstation is not to be a required build server, rendering machine or always-on host. GitHub is the source of truth; free GitHub Actions runs lightweight gameplay tests and repository checks; a remote Unreal-capable build service or dedicated cloud agent must compile/cook/package the native UE5 project; a temporary remote GPU workstation is reserved for editor authoring and visual playtests. The cloud service must be selected only after engine-version, storage, GPU, region, security, licensing and total-cost checks.

Research candidates and the no-spend decision are recorded in `docs/CLOUD_FIRST_BUILD_STRATEGY.md`. GitHub-hosted runners are useful for lightweight CI but do not automatically include Unreal Engine 5.8, a display GPU, or enough disk for a complete engine/project cache. No free, dependable UE5.8 GPU workstation has yet been verified. No paid service, trial, top-up or cloud instance is authorised without explicit approval.

## Immediate implementation order

1. Keep free GitHub Actions gameplay tests and lightweight repository validation green; syntax-check the browser MVP in CI.
2. Publish and test the browser 3D MVP through GitHub Pages for early feedback, subject to Pages configuration and workflow success.
3. Establish the remote Unreal 5.8 build/editor environment without relying on the founder's PC; do not incur cost until explicitly approved.
4. Compile the existing C++ project on that remote environment and fix real compiler errors.
5. Create the Unreal Open World level, place the district blockout actor and PlayerStart, then verify movement, camera and collision in the actual 3D editor.
6. Create Blueprint children for the first district's actual NPCs, shop, pickups, bus stop and services; connect the first mission.
7. Wire live gameplay state into save/load and verify save → close/reopen → continue.
8. Package and launch a Development build remotely; retain commit-linked logs and test evidence.
9. Add vehicles and traffic only after the first 3D slice is stable; then expand NPC dialogue/routines and district life.

## Definition of done

Every milestone must report repository paths, actual implementation, run instructions, tests performed, runtime verification, known limitations and licence/source notes. A rules module is not a 3D feature; a C++ source file is not a compiled Unreal build; a design document is not a playable game.
