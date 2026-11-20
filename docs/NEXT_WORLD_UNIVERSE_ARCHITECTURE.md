# NEXT WORLD — Connected Universe Architecture

**Repository:** FRA GAMES  
**Product identity:** NEXT WORLD  
**Studio:** SimeonJr Studios  
**Status:** Long-term product architecture; only the first gameplay foundations are implemented.

> **One World. Unlimited Lives. Infinite Possibilities.**

NEXT WORLD is one persistent, expandable game universe. It is not a launcher containing unrelated games, and it is not separate games stitched together. A shared world, character identity, progression model, economy and save system support different careers and experiences.

## 1. Product rule: one universe, many experiences

The player should feel they are continuing one life and one connected identity. A football career, business career, story mission, property portfolio or later original superhero chapter is an experience layer operating on shared platform and world services—not a disconnected game with a second profile.

Experiences may have different rules and competitive balance. They must not silently reset or overwrite shared character history, owned property, relationships or earned progression. Where a mode needs a separate competitive ruleset, its mode-specific record is stored separately and linked to the same account/character identity.

## 2. Shared foundation

### Player and life identity
- Account identity and one or more saved life slots.
- New Life and Continue Life.
- Character appearance, background, relationships, age and life history.
- Skills, education, career records, reputation and achievements.
- Recoverable, versioned saves with explicit migration rules.

### Persistent world
- Regions, cities, districts and streamed world cells.
- World clock, day/night, weather and authored world events.
- NPC identity, occupation, household, schedule, relationships and bounded memory.
- Property, businesses, jobs, money, inventory and ownership history.
- Transport, vehicles, traffic and public services.

### Experience framework
- Open-world life and adventure.
- Original story and mission experiences.
- Professional sports and athlete careers.
- Business, entertainment and creative careers.
- Later original action, security, science-fiction and superhero experiences.
- Player-created missions, events and approved modes after creator safety and publishing systems exist.

## 3. Career and experience continuity

A character may move between careers over time. For example, the player can begin in a Lagos neighbourhood, develop as a footballer, invest in a club, own a music studio, build businesses and later enter civic leadership storylines. These are connected by the same identity and history.

Not every activity must be available in the first release. The architecture should make later experiences possible without pretending they already exist. Career-specific progress can be stored in modules while shared identity, selected assets, money and world ownership remain governed by common rules. Mission objectives may require exact authored NPCs, shops, items, bus stops or services so unrelated actions cannot accidentally complete a story beat.

## 4. Player-led creation

Players should create through understandable in-world choices, not by being exposed to a game editor. Early creation uses deterministic menus, budgets, permissions and approved modular templates:

1. Choose a business, property, event, mission or other supported creation.
2. Configure it using safe in-game options.
3. Validate location, ownership, cost, capacity and world rules.
4. Preview and confirm.
5. Save the authored result as versioned game data.
6. Publish to private play or moderated sharing only when the relevant systems exist.

Voice and AI can translate player intent into structured proposals later. Generated output must never execute arbitrary code in the game client or authoritative multiplayer server.

## 5. World strategy: Lagos first, not Lagos only

The first vertical slice is a compact, fictional Lagos-inspired neighbourhood with grounded local detail and a small set of real gameplay loops. It is a proof of the shared simulation architecture, not a claim that the whole city is already built.

Expansion should proceed district by district, then to additional Nigerian, African and international regions. Each region needs researched reference, distinct architecture and everyday life, respectful cultural representation, and a tested streaming/performance budget.

## 6. Technical direction

- Keep one primary runtime. The repository currently targets Unreal Engine 5.8; do not combine Unreal, Godot and O3DE as simultaneous runtime engines.
- Keep engine-independent gameplay rules testable outside the 3D editor.
- Connect those rules to Unreal through FRA-owned interfaces and Blueprint/C++ subsystems.
- Treat City Form and KinetiForge as isolated, pinned candidates until each passes exact-version compile, runtime, licence and performance checks.
- Keep external code and assets in a licence register; never import a whole sample game blindly.
- Use cloud/browser coding and headless CI for work that does not need a GPU. Do not mistake a free coding workspace for a high-end Unreal workstation.
- No paid GPU, cloud backend, API, asset, subscription or upgrade without explicit approval.

## 7. First real proof

The first playable proof remains one small neighbourhood where a player can:
- Create and continue a life.
- Move through a visible 3D environment.
- Meet scheduled NPCs and interact with them.
- Travel along a small authored road/transport network.
- Operate one business and manage money/items.
- Complete a mission and receive a one-time reward.
- Save and reload the same character, economy, mission progress and world state.

Only after this loop is playable and repeatable should the team expand into vehicle traffic, more districts, sports careers, multiplayer or creator tools.

## 8. Honesty standard

A rule module is not a 3D feature. A C++ source file is not a compiled Unreal build. A design document is not a playable game. Every milestone must identify implementation paths, tests, runtime verification, known limitations and upstream licences. NEXT WORLD's ambition remains large, but completion claims must always match evidence.
