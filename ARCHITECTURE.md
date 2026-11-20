# FRA GAMES — Initial Architecture

**Status:** Proposed foundation; not yet implemented.  
**Engine decision:** Unreal Engine 5 is the leading candidate for the intended high-end game, but final engine and production pipeline decisions require a tested vertical slice on suitable hardware.

## 1. Product shape

FRA GAMES is one connected game universe, not a collection of disconnected browser games. Shared systems should support different activities and modes while preserving a coherent player experience.

### Shared platform layer
- Player account and identity.
- Character slots and life history.
- Save/load and progression.
- Friends, parties and social presence (later milestone).
- Entitlements, moderation and creator permissions (later milestone).
- Content catalogue and versioning for approved experiences (later milestone).

### Shared world simulation layer
- World regions, districts and streaming boundaries.
- Time, weather and world events.
- Characters, relationships and schedules.
- Economy, property, businesses and jobs.
- Vehicles, transport and traffic.
- Missions, opportunities and rewards.

### Experience layer
- Open-world life and adventure.
- Story and mission experiences.
- Sports and career experiences.
- Entertainment and creative careers.
- Player-created, approved modes in a later creator programme.

Modes may have their own rules and competitive balance, but should reuse shared identity, presentation and suitable progression systems.

## 2. Player life and save model

A player can start a new life or continue an existing one.

- **New Life:** creates a new character slot and a distinct opening scenario.
- **Continue Life:** loads the selected saved character and its history without resetting it.
- Each life records origin, family background, relationships, age stage, education, work, possessions, finances and important events.
- Origins may include real-world locations and original fictional or science-fiction scenarios.
- Background affects starting circumstances and opportunities; it must not determine a character's destiny.
- Opening scenarios are selected or generated when a new life is created, not randomly substituted every time the player launches an existing save.

Save data must be versioned, validated and recoverable. Autosave and explicit save points should not silently overwrite a different character slot.

## 3. World expansion and creation

Player requests such as opening a restaurant should be interpreted as structured game actions, not unrestricted code generation.

Proposed flow:
1. Player chooses a build action or makes a voice request.
2. Intent is converted into a structured proposal.
3. Game validates location, money, materials, permissions and gameplay rules.
4. An approved modular template is configured.
5. Player previews, confirms and operates the creation.
6. The world records the change and makes it available to the simulation.

Early versions should use menus and deterministic templates. Voice and AI-assisted creation are later features. Never execute arbitrary generated code in the live game or multiplayer simulation.

## 4. Character and NPC architecture

Three content categories:
1. Authored story characters.
2. System-generated world NPCs.
3. Player-created characters, subject to moderation and publishing permissions.

NPC data should separate:
- Appearance and licensed character assets.
- Identity and biography.
- Personality traits and dialogue profile.
- Needs, goals and relationships.
- Daily schedule and current task.
- Bounded memory and relevant world events.
- Animation and interaction state.

High-fidelity human visuals require a dedicated character, animation, lighting and optimisation pipeline. A dialogue model alone does not create a production-ready 3D character. Crowd density, level of detail and simulation frequency must be budgeted.

## 5. World content pipeline

- Use original or properly licensed environments, props, vehicles, audio and characters.
- Track source, author, licence, attribution, modification rights and redistribution limits for every external asset.
- Build a compact district first; stream larger regions as separate world cells.
- Use modular buildings and environment kits where appropriate, while protecting visual authenticity and avoiding repetitive copy-paste streets.
- Use real-world reference research respectfully; do not reduce Lagos or any culture to stereotypes.

## 6. Technical layers

The implementation should keep these boundaries clear:

- **Game client:** rendering, input, animation, UI and local presentation.
- **Gameplay systems:** character state, missions, interaction, economy and simulation rules.
- **Persistence:** versioned saves and later server-authoritative player/world data.
- **Online services:** identity, friends, multiplayer sessions and content delivery (later).
- **Creator pipeline:** validated templates, moderation, publishing and versioning (later).
- **Build and test pipeline:** automated checks, reproducible builds and performance reports.

Do not introduce paid backend services or always-on infrastructure until there is a measured requirement and explicit budget approval.

## 7. Engine and tooling strategy

Unreal Engine 5 is the current leading candidate because the target includes high-fidelity open-world environments, vehicles, animation and large-scale world systems. It is not yet a locked implementation choice. Validate engine version, target hardware, licences, plugin compatibility and a small playable slice before importing large sample projects.

The current computer is suitable for repository work, gameplay rules, lightweight tools and remote collaboration, but not for authoring and rendering a large UE5 AAA city. Use browser/cloud coding where free quotas permit. Do not assume a free cloud coding workspace provides a high-end GPU.

## 8. Non-functional requirements

- Stable save/load and migration.
- Measurable frame-time and memory budgets.
- Clear ownership and licence records.
- Reproducible builds.
- Privacy-conscious accounts and social features.
- Age-appropriate safety and moderation.
- Accessibility options.
- No paid service or asset purchase without approval.

## 9. Architecture decision records

Record significant decisions in this file or a dedicated docs/decisions/ folder. Each decision should state context, options, decision, consequences and date. Keep provisional decisions visibly provisional.
