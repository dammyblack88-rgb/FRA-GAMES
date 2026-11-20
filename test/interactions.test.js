import test from "node:test";
import assert from "node:assert/strict";
import { createDistrict } from "../src/core/world.js";
import { createMission, startMission } from "../src/core/missions.js";
import { createPlayerEconomy, createShop } from "../src/core/inventory.js";
import {
  createInteractionRegistry, performWorldInteraction, applyWorldEventToMission
} from "../src/core/interactions.js";

const district = () => createDistrict({
  id: "district-one", name: "Neighbourhood One", region: "Lagos",
  locations: [
    { id: "home", name: "Home", type: "residential" },
    { id: "market", name: "Market", type: "market" },
    { id: "bus", name: "Bus Stop", type: "transport" },
    { id: "clinic", name: "Clinic", type: "service" }
  ],
  roads: [
    { id: "home-market", from: "home", to: "market", travelCost: 2 },
    { id: "market-bus", from: "market", to: "bus", travelCost: 1 },
    { id: "home-clinic", from: "home", to: "clinic", travelCost: 3 }
  ]
});

const registry = () => createInteractionRegistry({
  district: district(),
  targets: [
    { id: "mama-kemi", type: "npc", name: "Mama Kemi", locationId: "market" },
    { id: "dropped-bread", type: "item", name: "Dropped Bread", locationId: "market", itemId: "bread", quantity: 1 },
    { id: "market-shop", type: "shop", name: "Community Shop", locationId: "market", shopId: "shop-1" },
    { id: "community-bus", type: "bus-stop", name: "Community Bus Stop", locationId: "bus", destinations: ["market", "home"] },
    { id: "clinic-service", type: "service", name: "Clinic", locationId: "clinic", service: "first-aid" }
  ]
});

const player = { id: "player-1", locationId: "market" };
const economy = () => createPlayerEconomy({ playerId: "player-1", walletNaira: 2000, createdAt: "2026-11-20T10:00:00.000Z" });
const shop = () => createShop({
  id: "shop-1", name: "Community Shop",
  stock: [{ itemId: "bread", quantity: 4 }],
  prices: { bread: 500 }, createdAt: "2026-11-20T10:00:00.000Z"
});
const at = "2026-11-20T10:05:00.000Z";
const presentNpc = [{ npcId: "mama-kemi", locationId: "market", activity: "selling", scheduled: true }];

test("creates a validated registry and rejects duplicate or unknown targets", () => {
  assert.equal(registry().targets.length, 5);
  assert.throws(() => createInteractionRegistry({ district: district(), targets: [
    { id: "same", type: "npc", name: "A", locationId: "market" },
    { id: "same", type: "npc", name: "B", locationId: "market" }
  ] }), /Duplicate interaction target/);
  assert.throws(() => createInteractionRegistry({ district: district(), targets: [
    { id: "bad", type: "npc", name: "A", locationId: "airport" }
  ] }), /unknown district location/);
});

test("NPC conversation emits a unique world event and requires local presence", () => {
  const result = performWorldInteraction({
    registry: registry(), player, targetId: "mama-kemi", action: "talk", npcPopulation: presentNpc,
    occurredAt: at, eventId: "event-talk-1"
  });
  assert.equal(result.event.type, "npc-talked-to");
  assert.equal(result.event.payload.npcId, "mama-kemi");
  assert.throws(() => performWorldInteraction({
    registry: registry(), player: { ...player, locationId: "home" },
    targetId: "mama-kemi", action: "talk", npcPopulation: presentNpc, occurredAt: at, eventId: "event-talk-2"
  }), /must be at the target location/);
});

test("item pickup updates inventory once and consumes the pickup target", () => {
  const initialRegistry = registry();
  const result = performWorldInteraction({
    registry: initialRegistry, player, economy: economy(),
    targetId: "dropped-bread", action: "pickup", occurredAt: at, eventId: "event-pickup-1"
  });
  assert.deepEqual(result.economy.items, [{ itemId: "bread", quantity: 1 }]);
  assert.throws(() => performWorldInteraction({
    registry: result.registry, player, economy: result.economy,
    targetId: "dropped-bread", action: "pickup", occurredAt: at, eventId: "event-pickup-2"
  }), /already been consumed/);
  assert.equal(initialRegistry.consumedTargetIds.length, 0);
});

test("bus stop travel moves player only to an authored destination", () => {
  const result = performWorldInteraction({
    registry: registry(), player: { id: "player-1", locationId: "bus" },
    targetId: "community-bus", action: "travel", destinationId: "home",
    occurredAt: at, eventId: "event-bus-1"
  });
  assert.equal(result.player.locationId, "home");
  assert.equal(result.event.type, "bus-travelled");
  assert.throws(() => performWorldInteraction({
    registry: registry(), player: { id: "player-1", locationId: "bus" },
    targetId: "community-bus", action: "travel", destinationId: "airport",
    occurredAt: at, eventId: "event-bus-2"
  }), /not served/);
});

test("shop interactions execute the inventory transaction and preserve shop state", () => {
  const result = performWorldInteraction({
    registry: registry(), player, economy: economy(), shop: shop(),
    targetId: "market-shop", action: "buy", itemId: "bread", quantity: 2,
    occurredAt: at, eventId: "event-buy-1"
  });
  assert.equal(result.economy.walletNaira, 1000);
  assert.equal(result.economy.items[0].quantity, 2);
  assert.equal(result.shop.stock[0].quantity, 2);
  assert.equal(result.event.type, "item-purchased");
});

test("service interaction emits event and unsupported actions are rejected", () => {
  const result = performWorldInteraction({
    registry: registry(), player: { id: "player-1", locationId: "clinic" },
    targetId: "clinic-service", action: "use", occurredAt: at, eventId: "event-clinic-1"
  });
  assert.equal(result.event.type, "service-used");
  assert.equal(result.event.payload.service, "first-aid");
  assert.throws(() => performWorldInteraction({
    registry: registry(), player, targetId: "mama-kemi", action: "steal",
    occurredAt: at, eventId: "event-invalid"
  }), /not supported/);
});

test("world interactions advance matching mission objectives exactly once", () => {
  const definition = createMission({
    id: "meet-neighbour", title: "Meet a Neighbour", description: "Say hello at the market.",
    objectives: [{ id: "say-hello", type: "talk-to-npc", description: "Talk to one resident", target: 1 }],
    reward: { cashNaira: 100, experience: 25 }
  });
  const mission = startMission(definition, at);
  const interaction = performWorldInteraction({
    registry: registry(), player, targetId: "mama-kemi", action: "talk", npcPopulation: presentNpc,
    occurredAt: at, eventId: "event-mission-talk"
  });
  const progressed = applyWorldEventToMission(mission, interaction.event);
  assert.equal(progressed.status, "completed");
  assert.equal(progressed.objectives[0].progress, 1);
  assert.throws(() => applyWorldEventToMission(progressed, interaction.event), /Duplicate mission event/);
});

test("world event IDs cannot be replayed against the same interaction registry", () => {
  const once = performWorldInteraction({
    registry: registry(), player, targetId: "mama-kemi", action: "talk", npcPopulation: presentNpc,
    occurredAt: at, eventId: "event-once"
  });
  assert.throws(() => performWorldInteraction({
    registry: once.registry, player, targetId: "mama-kemi", action: "talk", npcPopulation: presentNpc,
    occurredAt: at, eventId: "event-once"
  }), /Duplicate world event id/);
});

test("targeted mission objective ignores unrelated NPCs and counts only the named resident", () => {
  const definition = createMission({
    id: "meet-mama-kemi", title: "Meet Mama Kemi", description: "Find one specific resident",
    objectives: [{ id: "greet-mama", type: "talk-to-npc", targetId: "mama-kemi", description: "Greet Mama Kemi", target: 1 }],
    reward: { cashNaira: 0, experience: 5 }
  });
  const mission = startMission(definition, at, "meet-mama-run");
  const otherNpcEvent = { id: "talk-to-other", type: "npc-talked-to", targetId: "other-npc", payload: { npcId: "other-npc" }, occurredAt: at };
  const unchanged = applyWorldEventToMission(mission, otherNpcEvent);
  assert.equal(unchanged.objectives[0].progress, 0);
  const mamaEvent = { id: "talk-to-mama", type: "npc-talked-to", targetId: "mama-kemi", payload: { npcId: "mama-kemi" }, occurredAt: at };
  const completed = applyWorldEventToMission(unchanged, mamaEvent);
  assert.equal(completed.status, "completed");
  assert.equal(completed.objectives[0].progress, 1);
});
