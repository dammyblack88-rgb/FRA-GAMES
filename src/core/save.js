function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function requireRecords(value, field) {
  if (!Array.isArray(value)) throw new TypeError(`${field} must be an array`);
  const ids = new Set();
  for (const [index, record] of value.entries()) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new TypeError(`${field}[${index}] must be an object`);
    }
    const recordId = requireText(record.id, `${field}[${index}].id`);
    if (ids.has(recordId)) throw new RangeError(`${field} contains duplicate id: ${recordId}`);
    ids.add(recordId);
  }
  return value;
}

function validateGameSave(save) {
  if (!save || typeof save !== "object" || Array.isArray(save)) {
    throw new TypeError("A game save object is required");
  }
  if (save.schemaVersion !== 1) throw new RangeError("Unsupported game save version");
  requireText(save.gameId, "gameId");
  requireText(save.savedAt, "savedAt");
  if (!save.player || typeof save.player !== "object") throw new TypeError("player data is required");
  const lives = requireRecords(save.player.lives, "player.lives");
  const activeLifeId = requireText(save.player.activeLifeId, "player.activeLifeId");
  if (!lives.some(life => life.id === activeLifeId)) {
    throw new RangeError("activeLifeId must reference a saved life");
  }
  const lifeIds = new Set(lives.map(life => life.id));
  const businesses = requireRecords(save.businesses ?? [], "businesses");
  for (const business of businesses) {
    if (!lifeIds.has(requireText(business.ownerLifeId, "business.ownerLifeId"))) {
      throw new RangeError(`Business ${business.id} references an unknown owner life`);
    }
  }
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
  if (!clock || clock.schemaVersion !== 1 || !Number.isInteger(clock.minuteOfDay)
      || clock.minuteOfDay < 0 || clock.minuteOfDay > 1439
      || !Number.isInteger(clock.minutesPerRealSecond) || clock.minutesPerRealSecond < 1
      || typeof clock.paused !== "boolean") {
    throw new TypeError("world.clock is invalid or unsupported");
  }
  requireText(clock.worldDate, "world.clock.worldDate");
  return save;
}

/** Create a detached, versioned snapshot; callers retain ownership of their live state. */
export function createGameSave({ gameId, savedAt, player, world, businesses = [], npcStates = [], economy = null, progression = {} }) {
  const snapshot = {
    schemaVersion: 1,
    gameId: requireText(gameId, "gameId"),
    savedAt: requireText(savedAt, "savedAt"),
    player: structuredClone(player),
    world: structuredClone(world),
    businesses: structuredClone(businesses),
    npcStates: structuredClone(npcStates),
    economy: economy === null ? null : structuredClone(economy),
    progression: structuredClone(progression)
  };
  validateGameSave(snapshot);
  return snapshot;
}

/** Load a supported snapshot without mutating the stored source. */
export function loadGameSave(savedSnapshot) {
  validateGameSave(savedSnapshot);
  return structuredClone(savedSnapshot);
}

export const saveRules = Object.freeze({ currentSchemaVersion: 1 });
