const RELATIONSHIP_DIMENSIONS = Object.freeze(["trust", "respect", "affection", "familiarity"]);
const MIN_SCORE = 0;
const MAX_SCORE = 100;

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}
function clampScore(value) {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, value));
}
function relationshipKey(targetId) {
  return targetId;
}
function validateState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state) || state.schemaVersion !== 1) {
    throw new TypeError("A supported relationship state is required");
  }
  requireText(state.ownerId, "ownerId");
  if (!Array.isArray(state.relationships) || !Array.isArray(state.events)) {
    throw new TypeError("relationships and events must be arrays");
  }
  const targets = new Set();
  for (const [index, relation] of state.relationships.entries()) {
    if (!relation || typeof relation !== "object" || Array.isArray(relation)) throw new TypeError(`relationships[${index}] must be an object`);
    const targetId = requireText(relation.targetId, `relationships[${index}].targetId`);
    if (targetId === state.ownerId || targets.has(targetId)) throw new RangeError("Relationship targets must be unique and cannot be the owner");
    targets.add(targetId);
    for (const dimension of RELATIONSHIP_DIMENSIONS) {
      if (!Number.isInteger(relation[dimension]) || relation[dimension] < MIN_SCORE || relation[dimension] > MAX_SCORE) {
        throw new RangeError(`Relationship ${dimension} must be an integer from 0 to 100`);
      }
    }
  }
  const eventIds = new Set();
  for (const [index, event] of state.events.entries()) {
    if (!event || typeof event !== "object" || Array.isArray(event)) throw new TypeError(`events[${index}] must be an object`);
    const eventId = requireText(event.eventId, `events[${index}].eventId`);
    if (eventIds.has(eventId)) throw new RangeError("Relationship event IDs must be unique");
    eventIds.add(eventId);
    requireText(event.targetId, "event.targetId");
    requireText(event.dimension, "event.dimension");
    requireText(event.occurredAt, "event.occurredAt");
    if (!RELATIONSHIP_DIMENSIONS.includes(event.dimension)) throw new RangeError("Unsupported relationship dimension");
    if (!Number.isInteger(event.delta) || event.delta < -100 || event.delta > 100) throw new RangeError("Relationship delta must be an integer from -100 to 100");
    if (!targets.has(event.targetId)) throw new RangeError("Relationship event references an unknown target");
  }
  return state;
}

export function createRelationshipState(ownerId) {
  return { schemaVersion: 1, ownerId: requireText(ownerId, "ownerId"), relationships: [], events: [] };
}

/** Apply an authored consequence to one player-to-character relationship; event IDs make retries safe. */
export function applyRelationshipEvent(snapshot, { eventId, targetId, dimension, delta, occurredAt }) {
  validateState(snapshot);
  const safeEventId = requireText(eventId, "eventId");
  const safeTargetId = requireText(targetId, "targetId");
  const safeDimension = requireText(dimension, "dimension");
  const safeOccurredAt = requireText(occurredAt, "occurredAt");
  if (!RELATIONSHIP_DIMENSIONS.includes(safeDimension)) throw new RangeError("Unsupported relationship dimension");
  if (safeTargetId === snapshot.ownerId) throw new RangeError("A player cannot form a relationship with themselves");
  if (!Number.isInteger(delta) || delta < -100 || delta > 100) throw new RangeError("delta must be an integer from -100 to 100");

  const next = structuredClone(snapshot);
  if (next.events.some(event => event.eventId === safeEventId)) return next;
  let relation = next.relationships.find(item => item.targetId === safeTargetId);
  if (!relation) {
    relation = { targetId: safeTargetId, trust: 0, respect: 0, affection: 0, familiarity: 0 };
    next.relationships.push(relation);
  }
  relation[safeDimension] = clampScore(relation[safeDimension] + delta);
  next.events.push({
    eventId: safeEventId, targetId: safeTargetId, dimension: safeDimension,
    delta, occurredAt: safeOccurredAt
  });
  return validateState(next);
}

export function getRelationship(snapshot, targetId) {
  validateState(snapshot);
  const safeTargetId = requireText(targetId, "targetId");
  const relation = snapshot.relationships.find(item => item.targetId === safeTargetId);
  return relation ? structuredClone(relation) : null;
}

export const relationshipRules = Object.freeze({
  dimensions: RELATIONSHIP_DIMENSIONS,
  minimumScore: MIN_SCORE,
  maximumScore: MAX_SCORE
});
