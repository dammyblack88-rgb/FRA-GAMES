# Open-Source Candidate Audit

**Reviewed:** 2026-11-20  
**Purpose:** identify reusable foundations for FRA GAMES without importing incompatible projects or accidentally inheriting restrictive asset terms.

This is a desk review of public repository documentation and licence statements. It is not a source-code security audit, a build test, or approval to copy content. Candidate versions and licences must be rechecked at the exact commit before integration.

## Summary decision

Do not merge a complete game repository into FRA GAMES. Keep FRA GAMES as the product and integration owner. Adopt isolated, useful systems only after checking source, dependencies, exact licence, engine version, performance and Windows build compatibility.

## Candidates

### 1. City Form — city simulation reference

- Repository: https://github.com/JonathanWMorris/city-form
- Stated licence: MIT.
- Engine: Unreal Engine 5.8.
- Relevant systems: headless city simulation, road graph/routing, zoning, parcels, buildings, population/employment roadmap and separation of authoritative simulation from Unreal presentation.
- Current state disclosed by its README: source-first pre-alpha; no packaged release; its Windows portability is a design requirement but Windows is not yet verified; the current development baseline is Apple Silicon Mac.
- FRA GAMES decision: **Architecture reference only for now.** Its simulation concepts may help our traffic, road, neighbourhood and economy architecture. Do not adopt its code until Windows compatibility and integration boundaries are tested on our eventual Unreal workstation.

### 2. KinetiForge Vehicle System — vehicle physics candidate

- Repository: https://github.com/myoozy/KinetiForge-Vehicle-System
- Stated licence: MIT.
- Engine: UE 5.3 development baseline; repository documentation reports later testing on UE 5.7, with some earlier versions not recently re-verified.
- Relevant systems: C++ modular vehicle physics, tyres, suspension, drivetrain, engine, transmission, differential, ABS and traction control.
- Caveats: migration guide warns that class/variable renames can require CoreRedirects to preserve Blueprint references; documented limitations include no camber thrust and unsuitable angular-momentum behavior for motorcycles/bicycles.
- FRA GAMES decision: **Preferred vehicle-system candidate for a later integration spike.** Review the exact source and dependencies, test against the selected UE version, and inspect asset licences separately before copying anything.

### 3. ALIS — world generation and modular architecture reference

- Repository: https://github.com/fallintodusk/alis
- Relevant systems: modular Unreal plugins, real-geography world generation, streaming, inventory, dialogue, interaction, character/motion foundations, JSON-driven editor tooling and save/settings systems.
- Licence: not a single blanket MIT licence. Its policy assigns MPL-2.0 to Unreal in-process code and documentation, AGPL-3.0-only to separate-process tools/services, Apache-2.0 to explicitly marked interoperability components, and separate terms to assets/data. Third-party and Epic content retain their original terms.
- Caveats: obligations depend on the exact component boundary; asset and data provenance rules are extensive.
- FRA GAMES decision: **Architecture reference only. Do not copy code yet.** The component-by-component licence and distribution implications need a dedicated compatibility review before any integration.

### 4. GT-Caliber — open-world gameplay code reference

- Repository: https://github.com/yangzhen02/GT-caliber
- Stated terms: game code under MIT; authored assets under CC BY 4.0, excluding the separately licensed asset submodule.
- Relevant systems: Unreal C++ gameplay logic, save/persistence, missions, NPC dialogue, vehicle logic and large automated test suite.
- Critical caveat: the README says much of its art is in a private Git LFS submodule of approximately 15 GB; access is gated. Third-party assets are separately licensed. Without access to the private assets, the public code repository is not runnable as a complete game.
- FRA GAMES decision: **Do not use as the base project.** It is a useful code-architecture reference, but its missing gated art prevents it from being a turnkey free foundation. Do not attempt to access or reproduce private assets.

### 5. Unreal Open World Starter — integration framework reference

- Repository: https://github.com/GameFusi/Unreal-Open-World-Starter
- Stated project licence: Apache-2.0; bundled third-party components retain their own licences.
- Engine: UE 5.8.1 is the supported starting point; Git LFS and a Windows C++ toolchain are required.
- Relevant direction: integrated open-world framework, city pipeline design, and maintained plugin set.
- Caveats: its README distinguishes accepted target architecture from features that are not yet implemented on main; the city foundation described is still planned. It also includes maintained forks of third-party foundations whose individual licences and notices must be preserved.
- FRA GAMES decision: **Reference only pending component-level audit.** Do not import the entire bundle blindly.

### 6. City Generator — procedural city workflow reference

- Repository: https://github.com/AlexKorotkin-creator/CityGenerator
- Stated licence: MIT.
- Relevant systems: Houdini/Unreal workflow to generate city districts from OpenStreetMap data.
- Caveats: requires Houdini 22 and Unreal 5.8 plus a capable machine; Epic City Sample tools and downloaded map data retain their own terms; OSM-derived outputs require attribution and applicable ODbL compliance.
- FRA GAMES decision: **Future city-pipeline reference only.** It is not suitable for the current free cloud coding stage, and we must separately review OSM data terms and required software.

### 7. City Form vs. a complete open-world game

City Form is a city-builder simulation foundation, not a ready-made GTA-style action/life game. Its road, parcel, resident and traffic concepts may inform a city simulation layer, but it does not supply the complete character, narrative, combat, driving, animation, audio, mission or online systems FRA GAMES needs.

## Integration policy

1. No full-game merge based on a README or trailer.
2. Prefer small, isolated plugins/modules with explicit APIs and compatible licences.
3. Preserve upstream copyright and licence notices.
4. Keep third-party assets and proprietary assets in separately tracked boundaries.
5. Record the exact upstream commit and local modifications.
6. Require an engine build, functional test and performance comparison before calling an integration accepted.
7. Do not download gated private submodules or paid assets.
8. Do not introduce an engine upgrade or paid software subscription without approval.

## Next audit actions

- Recheck the exact current commit and root licence of each selected candidate.
- Inspect source entry points and third-party dependencies.
- Select the eventual Unreal version against the future workstation specification.
- Run a minimal integration test for the chosen vehicle and city-simulation modules before accepting either.
