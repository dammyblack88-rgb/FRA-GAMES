# FRA GAMES — Unreal Project Foundation

## What is now in the repository

A native Unreal Engine **5.8 C++ project scaffold** is present at the repository root:

- `FRAGames.uproject`
- Game and Editor targets
- One runtime module: `FRAGames`
- A native third-person player character with a spring-arm camera
- Basic keyboard/mouse movement and jump mappings
- A prototype GameMode that selects the native player character
- Unreal generated-file exclusions in `.gitignore`

This is source scaffolding. It is not yet a compiled Unreal project, packaged game, or playable build.

## First launch path (when UE 5.8 is installed)

1. Clone with submodules: `git clone --recurse-submodules https://github.com/dammyblack88-rgb/FRA-GAMES.git`.
2. Right-click `FRAGames.uproject` and generate project files.
3. Build the `FRAGamesEditor` target in Development Editor / Win64.
4. Open the project in Unreal Engine 5.8.
5. Create the first test level from the **Open World** template so World Partition, One File Per Actor, Data Layers and HLODs are configured by the engine.
6. Set the level's GameMode override to `FRAPrototypeGameMode`, add a PlayerStart and a simple floor/terrain test surface, then Play.

Epic documents C++ project builds through Unreal Build Tool and the generated Build.cs/Target.cs files: https://dev.epicgames.com/documentation/unreal-engine/compiling-game-projects-in-unreal-engine-using-cplusplus

Epic documents the Open World template and World Partition setup here: https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition-in-unreal-engine

## Input

- W / S: move forward/back
- A / D: strafe left/right
- Mouse: camera look
- Space: jump

This uses Unreal's legacy input mappings to keep the first scaffold small and avoid an extra Enhanced Input dependency. A later input layer can migrate to Enhanced Input once controller, touch and remapping requirements are implemented.

## Architecture boundary

The project deliberately starts with one FRA GAMES-owned runtime module. City Form and KinetiForge remain isolated submodules; neither is referenced as a build dependency yet. This avoids coupling the first project compile to unverified upstream code.

## Current validation

- Repository source structure committed: yes.
- C++ compile: not run; Unreal Engine is not installed in the available build environment.
- Editor launch: not run.
- Play-in-editor test: not run.
- Packaged build: not run.
- Map/3D assets: not created.

Do not mark the first playable milestone complete until the C++ target compiles, the editor opens, a test map runs, and the movement/camera/jump loop is verified.
