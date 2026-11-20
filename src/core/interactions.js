import { buyFromShop, sellToShop } from "./inventory.js";

function text(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}

function record(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${field} must be an object`);
}

function uniqueId(value, field) {
  const id = text(value, field);
  return id;
}

/**
 * Create a validated, immutable-by-convention interaction registry.
 * Targets are authored content; runtime changes are returned as new state.
 */
export function createInteractionRegistry({ district, targets }) {
  record(district, "district");
  if (district.schemaVersion !== 1 || !Array.isArray(district.locations)) throw new TypeError("A supported district is required");
  if (!Array.isArray(targets)) throw new TypeError("targets must be an array");
  const locations = new Set(district.locations.map(location => location.id));
  const ids = new Set();
  const safeTargets = targets.map((target, index) => {
    record(target, `targets[${index}]`);
    const id = uniqueId(target.id, `targets[${index}].id`);
    const type = text(target.type, `targets[${index}].type`);
    const locationId = text(target.locationId, `targets[${index}].locationId`);
    if (ids.has(id)) throw new RangeError(`Duplicate interaction target: ${id}`);
    if (!locations.has(locationId)) throw new RangeError(`Target ${id} references an unknown district location`);
    ids.add(id);
    if (!["npc", "item", "shop", "bus-stop", "service"].includes(type)) throw new RangeError(`Unsupported interaction target type: ${type}`);
    const safe = { id, type, locationId, name: text(target.name, `targets[${index}].name`) };
    if (type === "item") {
      safe.itemId = text(target.itemId, `targets[${index}].itemId`);
      if (!Number.isSafeInteger(target.quantity) || target.quantity < 1) throw new RangeError("Pickup quantity must be a positive whole number");
      safe.quantity = target.quantity;
    }
    if (type === "bus-stop") {
      if (!Array.isArray(target.destinations) || target.destinations.length === 0) throw new TypeError("A bus stop needs at least one destination");
      safe.destinations = [...new Set(target.destinations.map(destination => text(destination, "bus destination")))];
      if (safe.destinations.some(destination => !locations.has(destination))) throw new RangeError("A bus destination must belong to the district");
    }
    if (type === "service") safe.service = text(target.service, "service");
    if (type === "shop") safe.shopId = text(target.shopId, "shopId");
    return safe;
  });
  return { schemaVersion: 1, districtId: district.id, targets: safeTargets, consumedTargetIds: [] };
}

/**
 * Resolve one local interaction. The player must be at the target's location.
 * Returns a new state plus a deterministic world event for missions/auditing.
 */
export function performWorldInteraction({
  registry, player, targetId, action, occurredAt, eventId,
  economy = null, shop = null, itemId = null, quantity = 1, destinationId = null, npcPopulation = null
}) {
  record(registry, "registry");
  if (registry.schemaVersion !== 1 || !Array.isArray(registry.targets)) throw new TypeError("A supported interaction registry is required");
  record(player, "player");
  const playerId = text(player.id, "player.id");
  const locationId = text(player.locationId, "player.locationId");
  const id = text(targetId, "targetId");
  const actionName = text(action, "action");
  const timestamp = text(occurredAt, "occurredAt");
  const eventKey = text(eventId, "eventId");
  const target = registry.targets.find(entry => entry.id === id);
  if (!target) throw new RangeError("Interaction target does not exist");
  if (registry.consumedTargetIds.includes(id)) throw new RangeError("Interaction target has already been consumed");
  if (target.locationId !== locationId) throw new RangeError("Player must be at the target location");
  if (target.type === "npc" && actionName === "talk") {
    if (!Array.isArray(npcPopulation)) throw new TypeError("Current NPC population snapshot is required to talk to a resident");
    const resident = npcPopulation.find(npc => npc.npcId === target.id);
    if (!resident || resident.locationId !== locationId) throw new RangeError("Resident is not currently present at this location");
  }
  if (registry.events?.some(event => event.id === eventKey)) throw new RangeError("Duplicate world event id");

  let nextPlayer = structuredClone(player);
  let nextRegistry = structuredClone(registry);
  let nextEconomy = economy === null ? null : structuredClone(economy);
  let nextShop = shop === null ? null : structuredClone(shop);
  let type;
  let payload = {};

  if (target.type === "npc" && actionName === "talk") {
    type = "npc-talked-to";
    payload = { npcId: target.id };
  } else if (target.type === "item" && actionName === "pickup") {
    if (!nextEconomy || nextEconomy.schemaVersion !== 1 || nextEconomy.playerId !== playerId) throw new TypeError("Matching player economy is required for item pickup");
    const inventoryIndex = nextEconomy.items.findIndex(item => item.itemId === target.itemId);
    if (inventoryIndex < 0) nextEconomy.items.push({ itemId: target.itemId, quantity: target.quantity });
    else {
      const total = nextEconomy.items[inventoryIndex].quantity + target.quantity;
      if (!Number.isSafeInteger(total)) throw new RangeError("Inventory quantity exceeds safe limits");
      nextEconomy.items[inventoryIndex].quantity = total;
    }
    nextRegistry.consumedTargetIds.push(id);
    type = "item-picked-up";
    payload = { itemId: target.itemId, quantity: target.quantity };
  } else if (target.type === "bus-stop" && actionName === "travel") {
    const destination = text(destinationId, "destinationId");
    if (!target.destinations.includes(destination)) throw new RangeError("Destination is not served by this bus stop");
    nextPlayer.locationId = destination;
    type = "bus-travelled";
    payload = { fromLocationId: locationId, toLocationId: destination, busStopId: target.id };
  } else if (target.type === "service" && actionName === "use") {
    type = "service-used";
    payload = { service: target.service, serviceId: target.id };
  } else if (target.type === "shop" && (actionName === "buy" || actionName === "sell")) {
    if (!nextEconomy || !nextShop || nextShop.id !== target.shopId) throw new TypeError("Matching player economy and shop state are required");
    const tradeItemId = text(itemId, "itemId");
    const trade = actionName === "buy"
      ? buyFromShop(nextEconomy, nextShop, tradeItemId, quantity, timestamp, eventKey)
      : sellToShop(nextEconomy, nextShop, tradeItemId, quantity, timestamp, eventKey);
    nextEconomy = trade.economy;
    nextShop = trade.shop;
    type = actionName === "buy" ? "item-purchased" : "item-sold";
    payload = { itemId: tradeItemId, quantity, shopId: target.shopId };
  } else {
    throw new RangeError(`Action ${actionName} is not supported for target type ${target.type}`);
  }

  const event = { id: eventKey, type, actorId: playerId, targetId: target.id, locationId, occurredAt: timestamp, payload };
  nextRegistry.events = [...(nextRegistry.events ?? []), event];
  return { player: nextPlayer, registry: nextRegistry, economy: nextEconomy, shop: nextShop, event };
}

/** Apply a world event only to objectives whose optional authored target constraints match. */
export function applyWorldEventToMission(missionState, worldEvent, occurredAt = worldEvent?.occurredAt) {
  record(worldEvent, "worldEvent");
  const mapping = {
    "npc-talked-to": "talk-to-npc",
    "item-picked-up": "pick-up-item",
    "bus-travelled": "travel-by-bus",
    "service-used": "use-service",
    "item-purchased": "buy-item",
    "item-sold": "sell-item"
  };
  const objectiveType = mapping[worldEvent.type];
  if (!objectiveType) return structuredClone(missionState);
  if (!missionState || missionState.schemaVersion !== 1) throw new TypeError("A supported mission state is required");
  if (!Array.isArray(missionState.eventHistory)) throw new TypeError("Mission event history is required");
  if (typeof worldEvent.id !== "string" || worldEvent.id.trim() === "") throw new TypeError("World event id is required");
  if (missionState.eventHistory.some(event => event.id === worldEvent.id)) throw new RangeError("Duplicate mission event id");
  if (missionState.status !== "active") throw new TypeError("An active mission is required");

  const payload = worldEvent.payload ?? {};
  const context = {
    targetId: worldEvent.targetId,
    itemId: payload.itemId,
    shopId: payload.shopId,
    busStopId: payload.busStopId,
    serviceId: payload.serviceId
  };
  const matchesContext = objective => ["targetId", "itemId", "shopId", "busStopId", "serviceId"]
    .every(field => objective[field] === undefined || objective[field] === context[field]);
  const matching = missionState.objectives.some(objective =>
    objective.type === objectiveType && !objective.completed && matchesContext(objective));
  if (!matching) {
    const ignored = structuredClone(missionState);
    ignored.eventHistory.push({ id: worldEvent.id, type: "world-interaction-ignored", objectiveType, occurredAt });
    return ignored;
  }

  const next = structuredClone(missionState);
  let remaining = 1;
  next.objectives = next.objectives.map(objective => {
    if (objective.type !== objectiveType || objective.completed || remaining === 0 || !matchesContext(objective)) return objective;
    remaining -= 1;
    const progress = objective.progress + 1;
    return { ...objective, progress, completed: progress >= objective.target };
  });
  next.eventHistory.push({ id: worldEvent.id, type: "world-interaction", objectiveType, occurredAt });
  if (next.objectives.every(objective => objective.completed)) {
    const completionEventId = `${next.runId ?? next.missionId}:completed`;
    if (next.eventHistory.some(event => event.id === completionEventId)) throw new RangeError("Mission completion event id already exists");
    next.status = "completed";
    next.completedAt = occurredAt;
    next.eventHistory.push({ id: completionEventId, type: "mission-completed", occurredAt });
  }
  return next;
}
