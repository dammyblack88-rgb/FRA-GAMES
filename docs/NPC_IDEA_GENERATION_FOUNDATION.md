# Autonomous NPC Ideas Foundation

This engine-independent module lets residents develop their own possible goals from their personality, unmet needs, memories and opportunities in the world. It is a deterministic simulation foundation: it does not require an AI API, cloud service or paid model.

## API

- `createNpcIdeaState(npcId)` creates a versioned, save-friendly idea history.
- `generateNpcIdeas(npc, context, state?)` evaluates possible ideas and returns up to three ranked suggestions plus an updated history snapshot.
- `updateNpcIdeaStatus(state, ideaId, status, occurredAt)` records an idea as accepted, completed or abandoned.
- `npcIdeaRules` exposes history limits, suggestion limits, statuses and categories.

## How ideas emerge

The initial authored idea catalogue covers business, career, learning, social, exploration and community goals. Candidate scores combine:
- personality traits such as ambition, creativity, curiosity, discipline, kindness and sociability;
- unmet needs such as low fun or social fulfilment;
- relevant memory tags;
- matching local opportunities, such as a football trial, training place, market demand or community event.

Matching opportunities can add a location and world-authored context to the suggestion. The same inputs produce the same ranked output, making simulation replayable and testable.

## Integration contract

Pass an NPC profile with a stable `id` and optional 0–100 `traits`, a context containing optional 0–100 `needs`, memory summaries with `tags`, local `opportunities`, and a world timestamp in `occurredAt`. Persist the returned state through the versioned save layer. The world simulation should decide when to run an idea pass (for example, at a daily planning boundary or after a meaningful event), rather than recalculating every frame.

The caller remains responsible for turning an accepted idea into an actual activity, mission, business, relationship or travel plan. It must check money, skills, permissions, available locations and other world constraints before execution.

## Safety and limits

- NPC ideas are suggestions, not guaranteed actions or unrestricted world mutations.
- The initial catalogue is authored and bounded; this is not open-ended AI-generated dialogue or self-modifying code.
- No real-world personal data or external model is used.
- Multiplayer implementations must validate accepted goals and resulting world changes on the authoritative server.
- A later expansion can add goal prerequisites, plans with multiple steps, NPC-to-NPC collaboration, career progression and emergent events.
