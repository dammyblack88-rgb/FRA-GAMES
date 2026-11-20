function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}
function requireRecords(value, field) {
  if (!Array.isArray(value)) throw new TypeError(`${field} must be an array`);
  const ids = new Set();
  for (const [index, record] of value.entries()) {
    if (!record || typeof record !== "object" || Array.isArray(record)) throw new TypeError(`${field}[${index}] must be an object`);
    const recordId = requireText(record.id, `${field}[${index}].id`);
    if (ids.has(recordId)) throw new RangeError(`${field} contains duplicate id: ${recordId}`);
    ids.add(recordId);
  }
  return value;
}
function validateGameSave(save) {
  if (!save || typeof save !== "object" || Array.isArray(save)) throw new TypeError("A game save object is required");
  if (save.schemaVersion !== 1) throw new RangeError("Unsupported game save version");
  requireText(save.gameId, "gameId"); requireText(save.savedAt, "savedAt");
  if (!save.player || typeof save.player !== "object") throw new TypeError("player data is required");
  const lives = requireRecords(save.player.lives, "player.lives");
  const activeLifeId = requireText(save.player.activeLifeId, "player.activeLifeId");
  if (!lives.some(life => life.id === activeLifeId)) throw new RangeError("activeLifeId must reference a saved life");
  const lifeIds = new Set(lives.map(life => life.id));
  const businesses = requireRecords(save.businesses ?? [], "businesses");
  for (const business of businesses) if (!lifeIds.has(requireText(business.ownerLifeId, "business.ownerLifeId"))) throw new RangeError(`Business ${business.id} references an unknown owner life`);
  requireRecords(save.npcStates ?? [], "npcStates");
  if (save.economy !== null && save.economy !== undefined) {
    const economy = save.economy;
    if (!economy || economy.schemaVersion !== 1) throw new TypeError("economy state is invalid or unsupported");
    requireText(economy.playerId, "economy.playerId");
    if (!Number.isSafeInteger(economy.walletNaira) || economy.walletNaira < 0) throw new TypeError("economy.walletNaira is invalid");
    if (!Array.isArray(economy.items) || !Array.isArray(economy.ledger)) throw new TypeError("economy items and ledger must be arrays");
    const itemIds = new Set();
    for (const [index, item] of economy.items.entries()) {
      if (!item || typeof item !== "object") throw new TypeError(`economy.items[${index}] must be an object`);
      const itemId = requireText(item.itemId, `economy.items[${index}].itemId`);
      if (itemIds.has(itemId)) throw new RangeError("economy.items contains duplicate item id");
      itemIds.add(itemId);
      if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) throw new TypeError("economy item quantity is invalid");
    }
    requireRecords(economy.ledger, "economy.ledger");
  }
  if (!save.world || typeof save.world !== "object") throw new TypeError("world state is required");
  requireText(save.world.districtId, "world.districtId");
  const clock = save.world.clock;
  if (!clock || clock.schemaVersion !== 1 || !Number.isInteger(clock.minuteOfDay) || clock.minuteOfDay < 0 || clock.minuteOfDay > 1439
      || !Number.isInteger(clock.minutesPerRealSecond) || clock.minutesPerRealSecond < 1 || typeof clock.paused !== "boolean") throw new TypeError("world.clock is invalid or unsupported");
  requireText(clock.worldDate, "world.clock.worldDate");
  if (save.interactionState !== null && save.interactionState !== undefined) {
    const state = save.interactionState;
    if (!state || state.schemaVersion !== 1) throw new TypeError("interactionState is invalid or unsupported");
    requireText(state.districtId, "interactionState.districtId");
    if (state.districtId !== save.world.districtId) throw new RangeError("interactionState district must match saved world district");
    const targets = requireRecords(state.targets, "interactionState.targets"), targetIds = new Set(targets.map(target => target.id));
    if (!Array.isArray(state.consumedTargetIds)) throw new TypeError("interactionState.consumedTargetIds must be an array");
    const consumed = new Set();
    for (const targetId of state.consumedTargetIds) {
      const id = requireText(targetId, "interactionState.consumedTargetIds entry");
      if (!targetIds.has(id) || consumed.has(id)) throw new RangeError("interactionState has an unknown or duplicate consumed target");
      consumed.add(id);
    }
    requireRecords(state.events, "interactionState.events");
  }
  if (!Array.isArray(save.missionStates ?? [])) throw new TypeError("missionStates must be an array");
  const missionIds = new Set();
  for (const [index, mission] of (save.missionStates ?? []).entries()) {
    if (!mission || mission.schemaVersion !== 1) throw new TypeError(`missionStates[${index}] is invalid or unsupported`);
    const missionId = requireText(mission.missionId, `missionStates[${index}].missionId`);
    if (missionIds.has(missionId)) throw new RangeError("missionStates contains duplicate mission id");
    missionIds.add(missionId);
    if (mission.runId !== undefined) requireText(mission.runId, "mission.runId");
    if (!["active", "completed"].includes(mission.status)) throw new TypeError("mission status is invalid");
    requireText(mission.startedAt, "mission.startedAt");
    if (mission.status === "completed") requireText(mission.completedAt, "mission.completedAt");
    else if (mission.completedAt !== null) throw new TypeError("active mission completedAt must be null");
    if (typeof mission.rewardClaimed !== "boolean") throw new TypeError("mission.rewardClaimed must be a boolean");
    if (mission.rewardClaimed && mission.status !== "completed") throw new TypeError("an incomplete mission cannot have a claimed reward");
    if (!Array.isArray(mission.objectives) || mission.objectives.length === 0) throw new TypeError("mission objectives must be a non-empty array");
    requireRecords(mission.objectives, "mission.objectives");
    let allObjectivesCompleted = true;
    for (const objective of mission.objectives) {
      requireText(objective.type, "mission objective type");
      if (!Number.isSafeInteger(objective.target) || objective.target < 1 || !Number.isSafeInteger(objective.progress) || objective.progress < 0
          || objective.progress > objective.target || typeof objective.completed !== "boolean" || objective.completed !== (objective.progress >= objective.target)) throw new TypeError("mission objective progress is invalid");
      if (!objective.completed) allObjectivesCompleted = false;
    }
    if (mission.status === "completed" && !allObjectivesCompleted) throw new TypeError("a completed mission must have every objective completed");
    if (mission.status === "active" && allObjectivesCompleted) throw new TypeError("an active mission cannot have every objective completed");
    requireRecords(mission.eventHistory, "mission.eventHistory");
  }
  const progression = save.progression ?? {};
  if (!progression || typeof progression !== "object" || Array.isArray(progression)) throw new TypeError("progression must be an object");
  if (progression.experience !== undefined && (!Number.isSafeInteger(progression.experience) || progression.experience < 0)) throw new TypeError("progression.experience must be a non-negative safe integer");
  for (const field of ["completedMissionIds", "unlocks"]) {
    if (progression[field] !== undefined) {
      if (!Array.isArray(progression[field]) || progression[field].some(value => typeof value !== "string" || value.trim() === "")) throw new TypeError(`progression.${field} must be an array of non-empty strings`);
      if (new Set(progression[field]).size !== progression[field].length) throw new RangeError(`progression.${field} contains duplicates`);
    }
  }
  return save;
}
export function createGameSave({ gameId, savedAt, player, world, businesses = [], npcStates = [], economy = null, interactionState = null, missionStates = [], progression = { experience: 0, completedMissionIds: [], unlocks: [] } }) {
  const snapshot = { schemaVersion: 1, gameId: requireText(gameId, "gameId"), savedAt: requireText(savedAt, "savedAt"),
    player: structuredClone(player), world: structuredClone(world), businesses: structuredClone(businesses), npcStates: structuredClone(npcStates),
    economy: economy === null ? null : structuredClone(economy), interactionState: interactionState === null ? null : structuredClone(interactionState),
    missionStates: structuredClone(missionStates), progression: structuredClone(progression) };
  validateGameSave(snapshot); return snapshot;
}
export function loadGameSave(savedSnapshot) { validateGameSave(savedSnapshot); return structuredClone(savedSnapshot); }
export const saveRules = Object.freeze({ currentSchemaVersion: 1 });
