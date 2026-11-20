const MAX_IDEA_HISTORY = 100;
const MAX_SUGGESTIONS = 3;

const IDEA_CATALOG = Object.freeze([
  { id: "start-shop", title: "Start a small business", category: "business", traits: ["ambition", "creativity"], need: "fun", threshold: 35, opportunity: "market-demand", summary: "Explore a small business that could serve the neighbourhood." },
  { id: "expand-shop", title: "Grow an existing business", category: "business", traits: ["ambition", "discipline"], need: "fun", threshold: 30, opportunity: "business-growth", summary: "Improve stock, reach new customers or hire help." },
  { id: "football-training", title: "Train for a football opportunity", category: "career", traits: ["ambition", "athleticism"], need: "fun", threshold: 30, opportunity: "football-trial", summary: "Build football skills and prepare for a local trial." },
  { id: "music-practice", title: "Develop a music career", category: "career", traits: ["creativity", "ambition"], need: "fun", threshold: 35, opportunity: "music-scene", summary: "Practise, meet other musicians and look for a performance." },
  { id: "learn-skill", title: "Learn a useful skill", category: "learning", traits: ["curiosity", "discipline"], need: "fun", threshold: 25, opportunity: "training-place", summary: "Find a class, mentor or practical way to learn." },
  { id: "meet-people", title: "Build new friendships", category: "social", traits: ["sociability", "curiosity"], need: "social", threshold: 45, opportunity: "community-event", summary: "Attend a local event and get to know people." },
  { id: "change-routine", title: "Explore a new place", category: "exploration", traits: ["curiosity", "adventurousness"], need: "fun", threshold: 30, opportunity: "new-place", summary: "Visit somewhere unfamiliar and discover what is happening there." },
  { id: "help-neighbour", title: "Help someone nearby", category: "community", traits: ["kindness", "sociability"], need: "social", threshold: 35, opportunity: "neighbour-needs-help", summary: "Offer practical help to someone in the community." }
]);

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}
function validateState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state) || state.schemaVersion !== 1) {
    throw new TypeError("A supported NPC idea state is required");
  }
  requireText(state.npcId, "npcId");
  if (!Array.isArray(state.history) || state.history.length > MAX_IDEA_HISTORY) throw new TypeError("NPC idea history is invalid");
  const ids = new Set();
  for (const item of state.history) {
    requireText(item.ideaId, "history.ideaId");
    requireText(item.status, "history.status");
    requireText(item.updatedAt, "history.updatedAt");
    if (ids.has(item.ideaId)) throw new RangeError("NPC idea history IDs must be unique");
    ids.add(item.ideaId);
  }
}
function traitScore(npc, trait) {
  const value = npc.traits?.[trait] ?? 50;
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new RangeError(`npc.traits.${trait} must be from 0 to 100`);
  return value;
}
function stableIdeaId(npcId, templateId, opportunityId = "self") {
  return `${npcId}:${templateId}:${opportunityId}`;
}

/** Create a save-friendly, bounded history of ideas an NPC has considered or pursued. */
export function createNpcIdeaState(npcId) {
  return { schemaVersion: 1, npcId: requireText(npcId, "npcId"), history: [] };
}

/**
 * Let an NPC independently notice plausible goals from personality, unmet needs,
 * memories and nearby opportunities. This is deterministic game simulation, not an LLM.
 */
export function generateNpcIdeas(npc, context = {}, snapshot = createNpcIdeaState(npc?.id)) {
  validateState(snapshot);
  if (!npc || typeof npc !== "object" || Array.isArray(npc)) throw new TypeError("NPC profile is required");
  const npcId = requireText(npc.id, "npc.id");
  if (snapshot.npcId !== npcId) throw new RangeError("Idea state belongs to a different NPC");
  const needs = context.needs ?? {};
  for (const [key, value] of Object.entries(needs)) {
    if (!Number.isFinite(value) || value < 0 || value > 100) throw new RangeError(`needs.${key} must be from 0 to 100`);
  }
  const memories = context.memories ?? [];
  const opportunities = context.opportunities ?? [];
  if (!Array.isArray(memories) || !Array.isArray(opportunities)) throw new TypeError("memories and opportunities must be arrays");
  const known = new Set(snapshot.history.map(item => item.ideaId));
  const candidates = [];

  for (const template of IDEA_CATALOG) {
    const needValue = needs[template.need] ?? 50;
    if (needValue > template.threshold) continue;
    const personality = template.traits.reduce((sum, trait) => sum + traitScore(npc, trait), 0) / template.traits.length;
    const rememberedInterest = memories.some(memory =>
      Array.isArray(memory.tags) && memory.tags.includes(template.category)
    ) ? 12 : 0;
    const matching = opportunities.filter(item => item && item.type === template.opportunity);
    const sources = matching.length ? matching : [null];
    for (const opportunity of sources) {
      const ideaId = stableIdeaId(npcId, template.id, opportunity?.id ?? "self");
      if (known.has(ideaId)) continue;
      const score = Math.round(personality * 0.65 + (100 - needValue) * 0.2 + rememberedInterest + (opportunity ? 15 : 0));
      if (score < 35) continue;
      candidates.push({
        id: ideaId,
        templateId: template.id,
        title: opportunity?.title ? `${template.title}: ${opportunity.title}` : template.title,
        category: template.category,
        summary: opportunity?.description ?? template.summary,
        opportunityId: opportunity?.id ?? null,
        locationId: opportunity?.locationId ?? null,
        score,
        status: "considering"
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const ideas = candidates.slice(0, MAX_SUGGESTIONS);
  const now = requireText(context.occurredAt ?? "world-time-unset", "context.occurredAt");
  const history = [...snapshot.history, ...ideas.map(idea => ({
    ideaId: idea.id, status: "considering", updatedAt: now
  }))].slice(-MAX_IDEA_HISTORY);
  return {
    state: { schemaVersion: 1, npcId, history },
    ideas
  };
}

/** Record that an NPC accepted, completed, or abandoned an idea; repeated updates are safe. */
export function updateNpcIdeaStatus(snapshot, ideaId, status, occurredAt) {
  validateState(snapshot);
  const safeId = requireText(ideaId, "ideaId");
  const safeStatus = requireText(status, "status");
  const safeTime = requireText(occurredAt, "occurredAt");
  if (!["accepted", "completed", "abandoned"].includes(safeStatus)) throw new RangeError("Unsupported NPC idea status");
  const index = snapshot.history.findIndex(item => item.ideaId === safeId);
  if (index < 0) throw new RangeError("NPC idea has not been generated for this character");
  const history = snapshot.history.map((item, itemIndex) =>
    itemIndex === index ? { ...item, status: safeStatus, updatedAt: safeTime } : item
  );
  return { schemaVersion: 1, npcId: snapshot.npcId, history };
}

export const npcIdeaRules = Object.freeze({
  maxHistory: MAX_IDEA_HISTORY,
  maxSuggestionsPerPass: MAX_SUGGESTIONS,
  statuses: Object.freeze(["considering", "accepted", "completed", "abandoned"]),
  categories: Object.freeze([...new Set(IDEA_CATALOG.map(item => item.category))])
});
