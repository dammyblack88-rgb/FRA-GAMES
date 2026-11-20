# NEXT WORLD NPC Memory Foundation

This module gives each NPC a bounded, event-driven memory ledger. It records authored world events from that NPC's perspective and supports recalling memories about a particular player or subject.

## Current capabilities

- Separate memory state per NPC.
- Event-ID deduplication so retried simulation events do not create duplicate memories.
- Subject-specific recall, newest recorded first.
- Optional tag filtering for dialogue and behaviour systems.
- Sentiment and importance metadata for future reactions.
- A bounded 100-entry ledger that removes the lowest-priority entry when full.
- Detached recall results so callers cannot mutate saved state by changing returned objects.

## Integration contract

- Call `createNpcMemoryState(npcId)` when an NPC is created.
- Call `rememberNpcEvent(state, event)` after a validated world event.
- Call `recallNpcMemories(state, playerId, options)` when selecting dialogue context or behaviour.
- Persist the returned state through the existing game save layer.

## Important limits

This is an engine-independent gameplay data module, not an AI dialogue system or a cloud memory service. It does not infer memories, use generative AI, or store personal account data. The game simulation must decide which events an NPC notices and what they mean. Dates are retained as supplied; callers are responsible for supplying consistent timestamps.
