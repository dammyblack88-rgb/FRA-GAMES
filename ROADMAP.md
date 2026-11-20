# FRA GAMES — Development Roadmap

This roadmap is a sequence of evidence-based milestones. Dates are not promised until scope, hardware and staffing are known.

## Phase 0 — Foundation and verification
- [x] Establish project repository.
- [x] Record initial product vision and architecture.
- [x] Establish licensing and asset tracking rules.
- [x] Desk-audit candidate open-source projects and licences; see docs/OPEN_SOURCE_AUDIT.md.
- [x] Implement initial engine-independent life and business rules with automated tests.
- [ ] Choose and document the initial engine/toolchain after compatibility review.
- [ ] Define acceptance tests for the first 3D vertical slice.
- [ ] Verify a reproducible Unreal build on the future target workstation.

**Exit condition:** a defensible technical plan, verified dependencies and a reproducible development setup.

## Phase 1 — First playable district
Target: one compact Lagos-inspired district, not the entire city.

- Player movement and camera.
- One small explorable street/neighbourhood.
- Character profile and distinct New Life opening.
- Continue Life with persistent save/load.
- Basic time-of-day and simple world activity.
- A small set of NPCs with visible schedules and interactions.
- One usable business loop: akara stand, customers, sales and upgrades.
- Basic audio, UI, accessibility and performance instrumentation.

**Exit condition:** a tester can start a new life, explore the district, interact with NPCs, operate the business, save, exit and continue without losing progress.

## Phase 2 — Life simulation and economy
- Family, relationships and age-stage foundations.
- Jobs, education, skills and personal finances.
- Additional businesses and employees.
- Property, interiors and upgrades.
- More reliable NPC schedules and reactions.
- Mission and free-play progression.

## Phase 3 — Player-driven world expansion
- Land, zoning and permission rules.
- Modular building and business templates.
- Resource and affordability checks.
- Preview/confirm/build workflow.
- Community facilities and neighbourhood progression.
- Voice commands only after deterministic menu-driven creation is reliable.

## Phase 4 — Story and world depth
- Multiple original opening scenarios.
- More districts and travel.
- Traffic and vehicle systems.
- Weather and world events.
- More nuanced NPC goals, relationships and bounded memories.
- Original narrative missions.

## Phase 5 — Shared online universe
- Account and identity services.
- Multiplayer sessions and shared spaces.
- Server-authoritative economy and important world state.
- Anti-cheat, moderation, privacy and safety.
- Network and scale testing.

## Phase 6 — Creator alpha
- Approved modular gameplay systems.
- Player-authored maps, missions and rule sets.
- Private playtests and versioning.
- Automated performance, safety and intellectual-property checks.
- Publishing permissions and transparent creator terms.

## Phase 7 — Broader experiences and regions
- Sports and career modes.
- Entertainment and film-production experiences.
- Additional original action/adventure modes.
- More Nigerian, African and international locations.
- Creator marketplace only when moderation, rights and payout systems are ready.

## Rules for marking progress

A task is not complete because a design, screenshot or generated code snippet exists. Mark it complete only when the implementation is present in the repository and the stated test passes. Record known limitations and test evidence in DEVELOPMENT_STATUS.md.
