const MAX_MEMORIES_PER_NPC = 100;
const MIN_SENTIMENT = -100;
const MAX_SENTIMENT = 100;

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function validateMemoryState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state) || state.schemaVersion !== 1) {
    throw new TypeError("A supported NPC memory state is required");
  }
  requireText(state.npcId, "npcId");
  if (!Array.isArray(state.memories)) throw new TypeError("memories must be an array");
  const ids = new Set();
  for (const [index, memory] of state.memories.entries()) {
    if (!memory || typeof memory !== "object" || Array.isArray(memory)) {
      throw new TypeError(`memories[${index}] must be an object`);
    }
    const eventId = requireText(memory.eventId, `memories[${index}].eventId`);
    if (ids.has(eventId)) throw new RangeError("NPC memory event IDs must be unique");
    ids.add(eventId);
    requireText(memory.subjectId, "memory.subjectId");
    requireText(memory.summary, "memory.summary");
    requireText(memory.occurredAt, "memory.occurredAt");
    if (!Number.isInteger(memory.sentiment) || memory.sentiment < MIN_SENTIMENT || memory.sentiment > MAX_SENTIMENT) {
      throw new RangeError("Memory sentiment must be an integer from -100 to 100");
    }
    if (!Number.isInteger(memory.importance) || memory.importance < 1 || memory.importance > 5) {
      throw new RangeError("Memory importance must be an integer from 1 to 5");
    }
    if (!Array.isArray(memory.tags) || memory.tags.some(tag => typeof tag !== "string" || tag.trim() === "")) {
      throw new TypeError("Memory tags must be an array of non-empty strings");
    }
  }
  return state;
}

/** Create an isolated memory ledger for one NPC. Persistence belongs to the game save layer. */
export function createNpcMemoryState(npcId) {
  return { schemaVersion: 1, npcId: requireText(npcId, "npcId"), memories: [] };
}

/**
 * Record an authored world event from an NPC's perspective.
 * eventId makes event delivery idempotent; importance controls retention when the ledger is full.
 */
export function rememberNpcEvent(snapshot, {
  eventId, subjectId, summary, occurredAt, sentiment = 0, importance = 3, tags = []
}) {
  validateMemoryState(snapshot);
  const safeEventId = requireText(eventId, "eventId");
  const safeSubjectId = requireText(subjectId, "subjectId");
  const safeSummary = requireText(summary, "summary");
  const safeOccurredAt = requireText(occurredAt, "occurredAt");
  if (!Number.isInteger(sentiment) || sentiment < MIN_SENTIMENT || sentiment > MAX_SENTIMENT) {
    throw new RangeError("sentiment must be an integer from -100 to 100");
  }
  if (!Number.isInteger(importance) || importance < 1 || importance > 5) {
    throw new RangeError("importance must be an integer from 1 to 5");
  }
  if (!Array.isArray(tags) || tags.some(tag => typeof tag !== "string" || tag.trim() === "")) {
    throw new TypeError("tags must be an array of non-empty strings");
  }

  const next = structuredClone(snapshot);
  if (next.memories.some(memory => memory.eventId === safeEventId)) return next;
  next.memories.push({
    eventId: safeEventId,
    subjectId: safeSubjectId,
    summary: safeSummary,
    occurredAt: safeOccurredAt,
    sentiment,
    importance,
    tags: [...new Set(tags.map(tag => tag.trim()))]
  });

  if (next.memories.length > MAX_MEMORIES_PER_NPC) {
    const lowestPriorityIndex = next.memories.reduce((lowest, memory, index, memories) => {
      const score = memory.importance * 10 + Math.abs(memory.sentiment) / 10;
      const lowestScore = memories[lowest].importance * 10 + Math.abs(memories[lowest].sentiment) / 10;
      return score < lowestScore ? index : lowest;
    }, 0);
    next.memories.splice(lowestPriorityIndex, 1);
  }
  return validateMemoryState(next);
}

/** Retrieve one NPC's memories of a person, newest first, with optional tag filtering. */
export function recallNpcMemories(snapshot, subjectId, { tag, limit = 10 } = {}) {
  validateMemoryState(snapshot);
  const safeSubjectId = requireText(subjectId, "subjectId");
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_MEMORIES_PER_NPC) {
    throw new RangeError("limit must be an integer from 1 to 100");
  }
  const safeTag = tag === undefined ? undefined : requireText(tag, "tag");
  return snapshot.memories
    .filter(memory => memory.subjectId === safeSubjectId && (!safeTag || memory.tags.includes(safeTag)))
    .slice()
    .reverse()
    .slice(0, limit)
    .map(memory => structuredClone(memory));
}

export const npcMemoryRules = Object.freeze({
  maxMemoriesPerNpc: MAX_MEMORIES_PER_NPC,
  minimumSentiment: MIN_SENTIMENT,
  maximumSentiment: MAX_SENTIMENT
});
