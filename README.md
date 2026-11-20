# FRA GAMES

**A SimeonJr Studios project**  
**Game universe: NEXT WORLD**

> **One World. Unlimited Lives. Infinite Possibilities.**

NEXT WORLD is a connected, expandable game universe. It is not a collection of unrelated mini-games. One shared world, character identity, progression model, economy and save system support multiple careers and experiences over time.

Players can live original stories, explore a richly simulated world, build businesses and communities, pursue sports and entertainment careers, take on missions and eventually create and share approved experiences. A football career, business empire or later original action/superhero chapter should remain part of the same connected identity—not a disconnected restart.

## Development principles

1. **One coherent universe:** consistent presentation, controls, identity, progression and persistent history.
2. **Original intellectual property:** no unauthorised GTA maps, characters, code, music, branding or other protected assets.
3. **Playable proof over promises:** every milestone must be implemented and tested before being marked complete.
4. **Cloud-first, free-first:** use free development resources where practical; no paid cloud, AI API, asset, subscription or upgrade without explicit approval.
5. **Hardware-aware:** current development can focus on architecture, game rules, tools and lightweight prototypes. High-end 3D authoring and rendering will move to a capable workstation when available.
6. **Reuse responsibly:** inspect source code, licences, dependencies, quality and compatibility before adopting any external project.
7. **Incremental world-building:** begin with one compact, detailed Lagos-inspired district, then expand region by region.

## First playable milestone

A small but real Lagos-inspired district with:
- A controllable player character.
- A persistent save and load flow.
- A distinct life beginning and character profile.
- A small explorable environment.
- Functional NPC routines and interactions.
- One interactive business loop, beginning with an akara stand.
- Mission completion with a one-time wallet and experience reward.
- Clear performance and test criteria.

## Current development state

**Foundation phase with a native Unreal project scaffold.** Engine-independent life, business, NPC, mission, save-schema, economy, interaction and district/world-clock rules are implemented with a dependency-free test suite. A UE 5.8 C++ project skeleton includes a native third-person character, camera, basic keyboard/mouse movement, jump and prototype GameMode. It has not yet been compiled or opened in Unreal; no playable 3D city, NPC visuals or district exists yet.

- [Development status](DEVELOPMENT_STATUS.md)
- [NEXT WORLD connected-universe architecture](docs/NEXT_WORLD_UNIVERSE_ARCHITECTURE.md)
- [Unreal project foundation](docs/UNREAL_PROJECT_FOUNDATION.md)
- [First playable Lagos neighbourhood scope](docs/FIRST_PLAYABLE_SLICE.md)
- [Architecture](ARCHITECTURE.md)
- [Roadmap](ROADMAP.md)
- [Open-source candidate audit](docs/OPEN_SOURCE_AUDIT.md)
- [Licence and asset register](LICENCE_AND_ASSET_REGISTER.md)

## Engine and upstream projects

The first Unreal integration target is **Unreal Engine 5.8**. Two reviewed upstream repositories are pinned as Git submodules: City Form (city simulation/roads/zoning reference) and KinetiForge Vehicles (candidate vehicle-physics plugin). They are isolated and are not yet compiled or enabled in a playable NEXT WORLD build.

Clone the repository and its pinned upstream sources with:

```powershell
git clone --recurse-submodules https://github.com/dammyblack88-rgb/FRA-GAMES.git
```

See [Engine and upstream setup](docs/UPSTREAM_ENGINE_SETUP.md) for exact pinned commits, compatibility caveats, hardware requirements and Unreal Engine source-access rules.

## Run the gameplay-core tests

Requires Node.js 20 or newer:

```bash
npm test
```

The tests run without third-party npm dependencies. GitHub Actions also runs them on pushes and pull requests.

## Project leadership

- **Founder / Concept Lead:** Afolabi Oluwadamilare Simeon
- **Studio:** SimeonJr Studios

Repository: dammyblack88-rgb/FRA-GAMES  
Established game-universe identity: NEXT WORLD
