function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}

function requireWhole(value, field, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) throw new RangeError(`${field} must be a whole number >= ${minimum}`);
}

function clone(value) {
  return structuredClone(value);
}

export function createMission({ id, title, description, objectives, reward, availableFrom = null }) {
  requireText(id, "id");
  requireText(title, "title");
  requireText(description, "description");
  if (!Array.isArray(objectives) || objectives.length === 0) throw new TypeError("A mission needs at least one objective");
  const objectiveIds = new Set();
  const safeObjectives = objectives.map((objective, index) => {
    if (!objective || typeof objective !== "object") throw new TypeError(`objectives[${index}] must be an object`);
    const objectiveId = requireText(objective.id, `objectives[${index}].id`);
    if (objectiveIds.has(objectiveId)) throw new RangeError(`Duplicate objective id: ${objectiveId}`);
    objectiveIds.add(objectiveId);
    requireText(objective.type, `objectives[${index}].type`);
    requireText(objective.description, `objectives[${index}].description`);
    requireWhole(objective.target, `objectives[${index}].target`, 1);
    return { id: objectiveId, type: objective.type.trim(), description: objective.description.trim(), target: objective.target };
  });
  if (!reward || typeof reward !== "object") throw new TypeError("Mission reward is required");
  requireWhole(reward.cashNaira, "reward.cashNaira");
  requireWhole(reward.experience, "reward.experience");
  return {
    schemaVersion: 1,
    id: id.trim(),
    title: title.trim(),
    description: description.trim(),
    availableFrom,
    objectives: safeObjectives,
    reward: { cashNaira: reward.cashNaira, experience: reward.experience }
  };
}

export function startMission(definition, startedAt) {
  requireText(startedAt, "startedAt");
  if (!definition || definition.schemaVersion !== 1) throw new TypeError("A supported mission definition is required");
  return {
    schemaVersion: 1,
    missionId: definition.id,
    status: "active",
    startedAt,
    completedAt: null,
    rewardClaimed: false,
    objectives: definition.objectives.map(objective => ({
      id: objective.id,
      type: objective.type,
      target: objective.target,
      progress: 0,
      completed: false
    })),
    eventHistory: [{ id: `${definition.id}:started`, type: "mission-started", occurredAt: startedAt }]
  };
}

export function recordMissionProgress(state, objectiveType, amount, occurredAt, eventId) {
  if (!state || state.schemaVersion !== 1 || state.status !== "active") throw new TypeError("An active mission is required");
  requireText(objectiveType, "objectiveType");
  requireWhole(amount, "amount", 1);
  requireText(occurredAt, "occurredAt");
  requireText(eventId, "eventId");
  if (state.eventHistory.some(event => event.id === eventId)) throw new RangeError("Duplicate mission event id");
  const matching = state.objectives.filter(objective => objective.type === objectiveType && !objective.completed);
  if (matching.length === 0) return clone(state);

  let remaining = amount;
  const objectives = state.objectives.map(objective => {
    if (objective.type !== objectiveType || objective.completed || remaining === 0) return objective;
    const added = Math.min(remaining, objective.target - objective.progress);
    remaining -= added;
    const progress = objective.progress + added;
    return { ...objective, progress, completed: progress >= objective.target };
  });
  const allComplete = objectives.every(objective => objective.completed);
  return {
    ...clone(state),
    objectives,
    status: allComplete ? "completed" : "active",
    completedAt: allComplete ? occurredAt : null,
    eventHistory: [
      ...state.eventHistory,
      { id: eventId, type: "mission-progress", objectiveType, amount, occurredAt },
      ...(allComplete ? [{ id: `${state.missionId}:completed`, type: "mission-completed", occurredAt }] : [])
    ]
  };
}

export function claimMissionReward(state, definition, walletNaira, experience) {
  if (!state || state.schemaVersion !== 1 || state.status !== "completed") throw new TypeError("A completed mission is required");
  if (!definition || definition.schemaVersion !== 1 || definition.id !== state.missionId) throw new TypeError("Matching mission definition is required");
  requireWhole(walletNaira, "walletNaira");
  requireWhole(experience, "experience");
  if (state.rewardClaimed) throw new RangeError("Mission reward has already been claimed");
  const nextWallet = walletNaira + definition.reward.cashNaira;
  const nextExperience = experience + definition.reward.experience;
  requireWhole(nextWallet, "resulting wallet");
  requireWhole(nextExperience, "resulting experience");
  return {
    state: { ...clone(state), rewardClaimed: true },
    walletNaira: nextWallet,
    experience: nextExperience,
    transaction: {
      id: `${state.missionId}:reward`,
      type: "mission-reward",
      cashNaira: definition.reward.cashNaira,
      experience: definition.reward.experience,
      occurredAt: state.completedAt
    }
  };
}
