# NPC Needs Simulation Foundation

This engine-independent module gives each resident a small, versioned needs snapshot that can evolve with the shared world clock.

## API

- `createNpcNeedsState(npcId, initialNeeds?)` creates a serialisable state with hunger, energy, social, hygiene and fun values from 0–100.
- `advanceNpcNeeds(state, { elapsedMinutes, activity })` advances the needs by elapsed in-game time and returns a new snapshot.
- `getNpcNeedsSummary(state)` returns a detached summary, lowest need and broad condition.
- `npcNeedRules` exposes the supported need keys, defaults and activity names.

## Current activity model

Supported activity labels are `rest`, `sleep`, `work`, `commute`, `eat`, `socialise`, `exercise`, `leisure` and `train`. Each has authored per-hour effects. Effects scale with elapsed minutes and values are clamped to 0–100.

These numbers are prototype tuning values, not realistic physiology or a final difficulty curve. They should be playtested and adjusted so the simulation creates interesting choices without becoming tedious or punitive.

## Integration boundary

This module is deliberately separate from NPC schedules and memory. The world simulation can resolve an NPC's current activity from its schedule, calculate elapsed world time, then pass that activity to `advanceNpcNeeds`. The caller decides when an NPC eats, sleeps, socialises or changes plans. No AI, cloud persistence, multiplayer authority or automatic behaviour planner is included.

The function is deterministic and immutable: it does not mutate the prior save snapshot. Persist returned state through the game's versioned save system. Online multiplayer must validate and advance needs on the authoritative server rather than trusting a client.

## Limitations

- No hunger/thirst death or forced collapse mechanics.
- No autonomous decision-making or pathfinding.
- No medical simulation.
- No real-world personal data.
- Need values and effects are provisional game-design parameters.
