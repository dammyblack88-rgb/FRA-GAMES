const CURRENT_SCHEMA_VERSION = 1;

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function requireNonNegativeInteger(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${field} must be a non-negative safe integer`);
  }
}

function validateIdentity(identity) {
  if (!identity || typeof identity !== "object" || Array.isArray(identity)) {
    throw new TypeError("A world identity object is required");
  }
  if (identity.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    throw new RangeError("Unsupported world identity version");
  }
  requireText(identity.playerId, "playerId");
  requireText(identity.handle, "handle");
  requireText(identity.createdAt, "createdAt");
  requireText(identity.homeRegion, "homeRegion");
  if (!Array.isArray(identity.experiences) || !Array.isArray(identity.milestones)) {
    throw new TypeError("experiences and milestones must be arrays");
  }

  const experienceIds = new Set();
  for (const [index, experience] of identity.experiences.entries()) {
    if (!experience || typeof experience !== "object" || Array.isArray(experience)) {
      throw new TypeError(`experiences[${index}] must be an object`);
    }
    const gameId = requireText(experience.gameId, `experiences[${index}].gameId`);
    if (experienceIds.has(gameId)) throw new RangeError(`Duplicate game experience: ${gameId}`);
    experienceIds.add(gameId);
    requireText(experience.firstPlayedAt, `experiences[${index}].firstPlayedAt`);
    requireNonNegativeInteger(experience.playTimeSeconds, `experiences[${index}].playTimeSeconds`);
    requireNonNegativeInteger(experience.milestoneCount, `experiences[${index}].milestoneCount`);
  }

  const milestoneIds = new Set();
  for (const [index, milestone] of identity.milestones.entries()) {
    if (!milestone || typeof milestone !== "object" || Array.isArray(milestone)) {
      throw new TypeError(`milestones[${index}] must be an object`);
    }
    const eventId = requireText(milestone.eventId, `milestones[${index}].eventId`);
    if (milestoneIds.has(eventId)) throw new RangeError(`Duplicate milestone event: ${eventId}`);
    milestoneIds.add(eventId);
    requireText(milestone.gameId, `milestones[${index}].gameId`);
    requireText(milestone.type, `milestones[${index}].type`);
    requireText(milestone.title, `milestones[${index}].title`);
    requireText(milestone.occurredAt, `milestones[${index}].occurredAt`);
    if (!experienceIds.has(milestone.gameId)) {
      throw new RangeError(`Milestone references an unregistered game: ${milestone.gameId}`);
    }
    if (milestone.metadata !== undefined && (!milestone.metadata || typeof milestone.metadata !== "object" || Array.isArray(milestone.metadata))) {
      throw new TypeError("milestone.metadata must be an object when supplied");
    }
  }
  return identity;
}

/** Create the portable player identity shared by every compatible NEXT WORLD experience. */
export function createWorldIdentity({ playerId, handle, createdAt, homeRegion = "Lagos, Nigeria" }) {
  const identity = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    playerId: requireText(playerId, "playerId"),
    handle: requireText(handle, "handle"),
    createdAt: requireText(createdAt, "createdAt"),
    homeRegion: requireText(homeRegion, "homeRegion"),
    experiences: [],
    milestones: []
  };
  return validateIdentity(identity);
}

/** Register a compatible game experience once; repeated registration preserves its original first-played date. */
export function registerWorldExperience(identitySnapshot, { gameId, playedAt }) {
  validateIdentity(identitySnapshot);
  const safeGameId = requireText(gameId, "gameId");
  const safePlayedAt = requireText(playedAt, "playedAt");
  const next = structuredClone(identitySnapshot);
  if (!next.experiences.some(item => item.gameId === safeGameId)) {
    next.experiences.push({
      gameId: safeGameId,
      firstPlayedAt: safePlayedAt,
      playTimeSeconds: 0,
      milestoneCount: 0
    });
  }
  return validateIdentity(next);
}

/** Record a cross-experience legacy event. eventId makes retries safe and prevents duplicate history. */
export function recordWorldMilestone(identitySnapshot, {
  eventId, gameId, type, title, occurredAt, metadata = {}
}) {
  validateIdentity(identitySnapshot);
  const safeEventId = requireText(eventId, "eventId");
  const safeGameId = requireText(gameId, "gameId");
  const next = structuredClone(identitySnapshot);
  if (!next.experiences.some(item => item.gameId === safeGameId)) {
    throw new RangeError(`Register game experience before recording milestones: ${safeGameId}`);
  }
  if (next.milestones.some(item => item.eventId === safeEventId)) return next;

  next.milestones.push({
    eventId: safeEventId,
    gameId: safeGameId,
    type: requireText(type, "type"),
    title: requireText(title, "title"),
    occurredAt: requireText(occurredAt, "occurredAt"),
    metadata: structuredClone(metadata)
  });
  const experience = next.experiences.find(item => item.gameId === safeGameId);
  experience.milestoneCount += 1;
  return validateIdentity(next);
}

/** Return a detached, read-only-friendly summary for profile screens and compatible games. */
export function getWorldIdentitySummary(identitySnapshot) {
  const identity = validateIdentity(identitySnapshot);
  return {
    playerId: identity.playerId,
    handle: identity.handle,
    homeRegion: identity.homeRegion,
    gamesPlayed: identity.experiences.length,
    totalMilestones: identity.milestones.length,
    experiences: structuredClone(identity.experiences),
    recentMilestones: structuredClone(identity.milestones.slice(-5).reverse())
  };
}

export const worldIdentityRules = Object.freeze({ currentSchemaVersion: CURRENT_SCHEMA_VERSION });
