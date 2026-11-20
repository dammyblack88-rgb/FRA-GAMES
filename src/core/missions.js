function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}
function requireWhole(value, field, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) throw new RangeError(`${field} must be a whole number >= ${minimum}`);
}
function clone(value) { return structuredClone(value); }

export function createMission({ id, title, description, objectives, reward, availableFrom = null }) {
  requireText(id, "id"); requireText(title, "title"); requireText(description, "description");
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
  requireWhole(reward.cashNaira, "reward.cashNaira"); requireWhole(reward.experience, "reward.experience");
  return { schemaVersion: 1, id: id.trim(), title: title.trim(), description: description.trim(), availableFrom,
    objectives: safeObjectives, reward: { cashNaira: reward.cashNaira, experience: reward.experience } };
}

/** Start a distinct mission run; callers may supply a stable unique run ID. */
export function startMission(definition, startedAt, runId = `${definition?.id}:${startedAt}`) {
  requireText(startedAt, "startedAt"); requireText(runId, "runId");
  if (!definition || definition.schemaVersion !== 1) throw new TypeError("A supported mission definition is required");
  return { schemaVersion: 1, missionId: definition.id, runId: runId.trim(), status: "active", startedAt,
    completedAt: null, rewardClaimed: false,
    objectives: definition.objectives.map(objective => ({ id: objective.id, type: objective.type, target: objective.target, progress: 0, completed: false })),
    eventHistory: [{ id: `${runId}:started`, type: "mission-started", occurredAt: startedAt }] };
}

export function recordMissionProgress(state, objectiveType, amount, occurredAt, eventId) {
  if (!state || state.schemaVersion !== 1 || state.status !== "active") throw new TypeError("An active mission is required");
  requireText(objectiveType, "objectiveType"); requireWhole(amount, "amount", 1);
  requireText(occurredAt, "occurredAt"); requireText(eventId, "eventId");
  if (state.eventHistory.some(event => event.id === eventId)) throw new RangeError("Duplicate mission event id");
  let remaining = amount;
  const objectives = state.objectives.map(objective => {
    if (objective.type !== objectiveType || objective.completed || remaining === 0) return objective;
    const added = Math.min(remaining, objective.target - objective.progress); remaining -= added;
    const progress = objective.progress + added;
    return { ...objective, progress, completed: progress >= objective.target };
  });
  if (!objectives.some(objective => objective.type === objectiveType && !objective.completed)) return clone(state);
  const allComplete = objectives.every(objective => objective.completed);
  const runId = state.runId ?? state.missionId;
  return { ...clone(state), objectives, status: allComplete ? "completed" : "active",
    completedAt: allComplete ? occurredAt : null,
    eventHistory: [...state.eventHistory, { id: eventId, type: "mission-progress", objectiveType, amount, occurredAt },
      ...(allComplete ? [{ id: `${runId}:completed`, type: "mission-completed", occurredAt }] : [])] };
}

/** Low-level reward calculation retained for callers that manage their own wallet. */
export function claimMissionReward(state, definition, walletNaira, experience) {
  if (!state || state.schemaVersion !== 1 || state.status !== "completed") throw new TypeError("A completed mission is required");
  if (!definition || definition.schemaVersion !== 1 || definition.id !== state.missionId) throw new TypeError("Matching mission definition is required");
  requireWhole(walletNaira, "walletNaira"); requireWhole(experience, "experience");
  if (state.rewardClaimed) throw new RangeError("Mission reward has already been claimed");
  const nextWallet = walletNaira + definition.reward.cashNaira, nextExperience = experience + definition.reward.experience;
  requireWhole(nextWallet, "resulting wallet"); requireWhole(nextExperience, "resulting experience");
  const runId = state.runId ?? state.missionId;
  return { state: { ...clone(state), rewardClaimed: true }, walletNaira: nextWallet, experience: nextExperience,
    transaction: { id: `${runId}:reward`, type: "mission-reward", cashNaira: definition.reward.cashNaira,
      experience: definition.reward.experience, occurredAt: state.completedAt } };
}

/** Atomically applies a mission reward to the player's wallet ledger and progression snapshot. */
export function claimMissionRewardToEconomy(state, definition, economy, progression = {}) {
  if (!economy || economy.schemaVersion !== 1) throw new TypeError("A supported player economy is required");
  requireText(economy.playerId, "economy.playerId"); requireWhole(economy.walletNaira, "economy.walletNaira");
  if (!Array.isArray(economy.items) || !Array.isArray(economy.ledger)) throw new TypeError("economy items and ledger must be arrays");
  if (!progression || typeof progression !== "object" || Array.isArray(progression)) throw new TypeError("progression must be an object");
  requireWhole(progression.experience ?? 0, "progression.experience");
  const result = claimMissionReward(state, definition, economy.walletNaira, progression.experience ?? 0);
  const transactionId = result.transaction.id;
  if (economy.ledger.some(entry => entry?.id === transactionId)) throw new RangeError("Mission reward transaction already exists in the player ledger");
  const completedMissionIds = progression.completedMissionIds ?? [];
  if (!Array.isArray(completedMissionIds) || completedMissionIds.some(id => typeof id !== "string")) throw new TypeError("progression.completedMissionIds must be an array of strings");
  const transaction = { id: transactionId, type: "mission-reward", missionId: state.missionId,
    amountNaira: definition.reward.cashNaira, experience: definition.reward.experience, occurredAt: state.completedAt };
  return { state: result.state, economy: { ...clone(economy), walletNaira: result.walletNaira, ledger: [...economy.ledger, transaction] },
    progression: { ...clone(progression), experience: result.experience,
      completedMissionIds: [...new Set([...completedMissionIds, state.missionId])] }, transaction };
}
