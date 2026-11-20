# First Playable Slice — Lagos Neighbourhood

**Milestone:** first playable vertical slice  
**Status:** scope defined; not yet built in Unreal  
**Engine target:** Unreal Engine 5.8  
**Working area:** fictional neighbourhood inspired by Agege, Lagos, Nigeria

## Purpose

Prove one coherent life-simulation loop in a compact, recognisable neighbourhood before expanding to a larger Lagos map. The slice must be small enough to build and profile, but complete enough to feel like a game rather than a technology demo.

This is an original fictional district informed by research and reference photography. It is not a claim to reproduce the whole of Agege or to be a survey-accurate copy of any real street.

## District footprint and places

Target footprint: approximately 600 m × 600 m of walkable/driveable space, divided into World Partition cells when the Unreal level is authored. The first test level may use a smaller blockout while movement and interaction are validated. A logical 50 m grid seed is committed in `src/content/first-district.js`; it is a planning/blockout coordinate system, not a surveyed map or a rendered Unreal level.

Required places:
1. **Player's home compound** — the character's starting point and save/resume location.
2. **Community junction and bus stop** — a recognisable street node and route connection.
3. **Neighbourhood market** — vendors, shoppers and basic buying/selling interactions.
4. **Akara stand** — the first player-operable business.
5. **Community clinic** — a public-service destination with staff routines.
6. **Local school frontage** — establishes everyday neighbourhood life; no full school simulation in the first slice.
7. **Small workshop/garage** — introduces a future vehicle-service business location.

Street character should use varied building setbacks, drainage, footpaths, roadside stalls, signs, utility poles, shade, road wear, traffic noise and tropical vegetation. Use original or properly licensed props and audio. Do not use GTA assets or unlicensed photographs, maps or sound recordings.

## Player loop

1. Start a new life or continue an existing saved life.
2. Spawn at the home compound.
3. Walk through the neighbourhood using keyboard/controller movement.
4. Meet residents and receive a simple opportunity to open an akara stand.
5. Choose an approved stall location and confirm the setup cost.
6. Buy/restock ingredients and set a selling price.
7. Serve customers; stock, cash, revenue and expenses update from authoritative game rules.
8. Return home or save; continue the same life without resetting character identity or business state.

The first slice does not require voice AI, multiplayer, procedural skyscrapers, full traffic simulation or player-created modes.

## NPC roster and routines

A first target of 12–20 named or ambient NPCs is sufficient for a small slice:
- Household members and one neighbour.
- Market traders and shoppers.
- Akara customers.
- A clinic worker and patient.
- A school staff member and passers-by.
- A mechanic/workshop owner.

Every persistent NPC record has a stable ID, role, home/work location, daily schedule and current activity. Ambient pedestrians can use simpler non-persistent agents. Schedules must resolve deterministically against the shared world clock. NPC visuals, dialogue, animation and crowd behaviour remain separate presentation systems.

## World simulation contracts

The engine-independent core now provides:
- World clock with explicit date, minute-of-day, pause and time-scale.
- Validated district locations and road edges.
- One-way and two-way road connections.
- Lowest-cost logical route lookup.
- NPC daily schedule validation and activity resolution.
- Shared-minute population snapshots that validate resident identities and ensure all schedule locations belong to the active district.
- A first-district seed layout with eight locations, eight logical road links and six scheduled residents.
- Character-life state and business ledger rules.
- Local interaction registry for resident conversations (only when the NPC schedule snapshot places them at the player location), one-time item pickups, shop buy/sell transactions, bus-stop travel to authored destinations and service interactions.
- World interaction events can advance matching mission objectives with event-ID replay protection. First-district target and provision-stall stock seeds are in `src/content/first-district-interactions.js`.

The Unreal project must treat the logical world state as authoritative; actors and meshes visualize it. Do not make the simulation depend on every NPC Actor being loaded in the level.

## Acceptance criteria

The slice is complete only when all of the following are demonstrated in an Unreal build:

### Player and life
- [ ] Player can move, turn the camera, jump and interact.\n- [ ] Player can talk to a resident only when that resident is actually present, pick up an item once, buy/sell from a finite-stock shop, use a service and travel to an authored bus destination.\n- [ ] World interaction events advance matching mission objectives once; persistent save integration is a separate follow-up.
- [ ] New Life creates a distinct character save.
- [ ] Continue Life restores the same character and business state.
- [ ] Save/load survives closing and reopening the game.

### Neighbourhood
- [ ] Player can navigate between all required locations.
- [ ] The road graph returns a valid route for connected locations and no route for disconnected locations.
- [ ] District boundaries and loading behaviour are stable.
- [ ] A small set of original/licensed environmental assets communicates Lagos neighbourhood character.

### NPCs
- [ ] At least 12 NPCs appear with distinct roles and locations.
- [ ] At least 6 NPCs follow deterministic daily schedules.
- [ ] NPC activity and location change correctly when world time advances.
- [ ] Unloaded NPCs continue through lightweight simulation without requiring full 3D actors.

### Business
- [ ] Player can open an akara stand at an approved location.
- [ ] Stock, sales, revenue, expenses and cash update correctly.
- [ ] The player cannot sell unavailable stock or spend unavailable business cash.
- [ ] Transactions are recorded and survive save/load.

### Quality
- [ ] No placeholder/demo data is represented as a real completed feature.
- [ ] No missing, unlicensed or gated assets are required.
- [ ] The test map launches and can be completed without editor-only actions.
- [ ] Performance is measured on the intended minimum target hardware before increasing NPC density or world size.

## Out of scope for this slice

- Full Lagos or multiple countries.
- High-speed traffic, vehicle ownership and police simulation.
- Full family/childhood life progression.
- Multiplayer, online accounts and creator marketplace.
- AI voice construction, arbitrary content generation or player-published code.
- Cinematic story campaign and photorealistic crowd density.

## Build order

1. Compile the native UE project and verify the player/camera/jump.
2. Create a greybox Open World test level and a home-to-market route.
3. Connect the world clock and logical district model to an Unreal subsystem.
4. Add interaction and the akara stand loop.
5. Add scheduled NPCs and save/load.
6. Replace greybox pieces with a small, quality-controlled Lagos-inspired art set.
7. Profile and refine before adding more streets or NPCs.
