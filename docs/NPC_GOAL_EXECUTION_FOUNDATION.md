# NPC goal execution foundation

**Status: deterministic goal contracts and event-driven progress are implemented in this branch. They are not yet wired to a live NPC actor, navigation system or rendered world.**

## Why this exists

The existing NPC idea generator can let a resident consider plausible ambitions based on personality, unmet needs, memories and local opportunities. Previously, accepted ideas did not become concrete behaviour. This module adds the next safe step: an accepted idea becomes a save-friendly goal that can progress only when the simulation emits matching world-action events.

## API

Import from `src/core/npc-goals.js`:

- `createNpcGoalState(npcId)` — create a versioned, serialisable goal snapshot.
- `acceptNpcIdea(ideaState, goalState, idea, occurredAt)` — mark a generated idea accepted and create its mapped goal.
- `applyNpcGoalEvent(state, event)` — progress the active goal from an authoritative simulation event.
- `getNpcGoalSummary(state)` — return a detached summary for UI/debug views.

Supported mappings include starting or improving a business, football training, music practice, learning a skill, socialising, visiting a new location and helping a neighbour. Repeated practice goals require three matching events; single-action goals require one.

## Integrity and simulation rules

- Only an idea already present in that NPC's `considering` history can be accepted.
- Each NPC can have one active goal at a time.
- A goal is completed only by a matching action event.
- If the goal has a target opportunity/location, the event must match that target.
- Event IDs are idempotency keys. A repeated event cannot progress a goal twice.
- Unrelated events are recorded but do not progress the goal, preventing old events from being replayed against a later goal.
- The module returns new snapshots and does not mutate caller state.
- No currency, XP or reward is created by this module.

## Remaining integration work

1. Connect accepted goals to the NPC daily planner and activity selector.
2. Resolve required actions into actual district navigation and interactable targets.
3. Emit authoritative events only after the action succeeds.
4. Persist goal snapshots alongside NPC memory, needs and relationship state.
5. Add goal interruption, reprioritisation, failure, decay and multi-step prerequisites.
6. Add player-facing visibility and debug tools without exposing hidden NPC state unfairly.

The goal engine is a deterministic simulation foundation, not an LLM and not proof that NPCs currently walk to a pitch or open a shop in the 3D MVP.
