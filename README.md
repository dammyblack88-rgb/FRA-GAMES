# FRA GAMES

**A SimeonJr Studios project**

FRA GAMES is the working platform name for an ambitious, connected game universe. The final player-facing game title has not yet been selected.

> Imagine it. Build it. Play it. Share it.

## Vision

Create one cohesive, premium open-world experience with the freedom, depth and presentation expected of a major modern game. Players can live original stories, explore a richly simulated world, build businesses and communities, take on missions, play sports and other experiences, and eventually create and share their own approved game modes.

This is **not** intended to be a low-quality portal of unrelated mini-games. The experiences should share a consistent identity, player profile, progression framework and connected world.

## Development principles

1. **One coherent universe:** consistent presentation, controls, identity and progression.
2. **Original intellectual property:** no unauthorised GTA maps, characters, code, music, branding or other protected assets.
3. **Playable proof over promises:** every milestone must be implemented and tested before being marked complete.
4. **Cloud-first, free-first:** use free development resources where practical; no paid cloud, AI API, asset, subscription or upgrade without explicit approval.
5. **Hardware-aware:** current development can focus on architecture, game rules, tools and lightweight prototypes. High-end 3D authoring and rendering will move to a capable workstation when available.
6. **Reuse responsibly:** inspect source code, licences, dependencies, quality and compatibility before adopting any external project.
7. **Incremental world-building:** begin with one compact, detailed Lagos-inspired district rather than claiming to build all of Lagos at once.

## First playable milestone

A small but real Lagos-inspired district with:
- A controllable player character.
- A persistent save and load flow.
- A distinct life beginning and character profile.
- A small explorable environment.
- A few functional NPC routines.
- One interactive business loop, beginning with an akara stand.
- Clear performance and test criteria.

## Current development state

**Foundation phase with a native Unreal project scaffold.** Engine-independent life and business rules are implemented and covered by passing automated GitHub Actions tests. A UE 5.8 C++ project skeleton now includes a native third-person character, camera, basic keyboard/mouse movement, jump and prototype GameMode. It has not yet been compiled or opened in Unreal; no playable 3D city, NPC visuals or district exists yet.

- [Development status](DEVELOPMENT_STATUS.md)
- [Unreal project foundation](docs/UNREAL_PROJECT_FOUNDATION.md)
- [Architecture](ARCHITECTURE.md)
- [Roadmap](ROADMAP.md)
- [Open-source candidate audit](docs/OPEN_SOURCE_AUDIT.md)
- [Licence and asset register](LICENCE_AND_ASSET_REGISTER.md)

## Engine and upstream projects

The first Unreal integration target is **Unreal Engine 5.8**. Two reviewed upstream repositories are pinned as Git submodules: City Form (city simulation/roads/zoning reference) and KinetiForge Vehicles (candidate vehicle-physics plugin). They are isolated and are not yet compiled or enabled in a playable FRA GAMES build.

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

## Working title

FRA GAMES is the project/platform label only. The official game title remains undecided.
