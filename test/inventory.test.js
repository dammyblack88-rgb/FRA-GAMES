import test from "node:test";
import assert from "node:assert/strict";
import {
  createPlayerEconomy, createShop, buyFromShop, sellToShop
} from "../src/core/inventory.js";

const setup = () => ({
  economy: createPlayerEconomy({
    playerId: "player-001", walletNaira: 5000,
    items: [{ itemId: "bottled-water", quantity: 2 }],
    createdAt: "2026-11-20T09:00:00.000Z"
  }),
  shop: createShop({
    id: "market-001", name: "Agege Community Market",
    stock: [{ itemId: "bottled-water", quantity: 10 }, { itemId: "bread", quantity: 5 }],
    prices: { "bottled-water": 300, bread: 800 },
    createdAt: "2026-11-20T09:00:00.000Z"
  })
});

test("creates a detached player inventory and finite-stock shop", () => {
  const { economy, shop } = setup();
  assert.equal(economy.walletNaira, 5000);
  assert.equal(economy.items[0].quantity, 2);
  assert.equal(shop.stock.length, 2);
});

test("buying items atomically debits wallet, adds inventory and reduces shop stock", () => {
  const { economy, shop } = setup();
  const result = buyFromShop(economy, shop, "bread", 2, "2026-11-20T09:10:00.000Z", "tx-buy-1");
  assert.equal(result.economy.walletNaira, 3400);
  assert.deepEqual(result.economy.items.find(item => item.itemId === "bread"), { itemId: "bread", quantity: 2 });
  assert.equal(result.shop.stock.find(item => item.itemId === "bread").quantity, 3);
  assert.equal(economy.walletNaira, 5000);
  assert.equal(shop.stock.find(item => item.itemId === "bread").quantity, 5);
});

test("selling items credits wallet, removes inventory and returns stock to shop", () => {
  const { economy, shop } = setup();
  const result = sellToShop(economy, shop, "bottled-water", 1, "2026-11-20T09:15:00.000Z", "tx-sell-1");
  assert.equal(result.economy.walletNaira, 5300);
  assert.equal(result.economy.items.find(item => item.itemId === "bottled-water").quantity, 1);
  assert.equal(result.shop.stock.find(item => item.itemId === "bottled-water").quantity, 11);
});

test("rejects insufficient funds, insufficient stock and insufficient player items", () => {
  const { economy, shop } = setup();
  assert.throws(() => buyFromShop({ ...economy, walletNaira: 10 }, shop, "bread", 1, "now", "tx-a"), /Insufficient player funds/);
  assert.throws(() => buyFromShop(economy, shop, "bread", 6, "now", "tx-b"), /not have enough stock/);
  assert.throws(() => sellToShop(economy, shop, "bread", 1, "now", "tx-c"), /Not enough items/);
});

test("rejects duplicate transaction ids and invalid quantities", () => {
  const { economy, shop } = setup();
  const once = buyFromShop(economy, shop, "bread", 1, "now", "tx-repeat");
  assert.throws(() => buyFromShop(once.economy, once.shop, "bread", 1, "later", "tx-repeat"), /Duplicate transaction id/);
  assert.throws(() => buyFromShop(economy, shop, "bread", 0, "now", "tx-zero"), /quantity/);
});

test("rejects unsafe currency totals and malformed inventory records", () => {
  assert.throws(() => createPlayerEconomy({ playerId: "p", walletNaira: Number.MAX_SAFE_INTEGER + 1, createdAt: "now" }), /walletNaira/);
  assert.throws(() => createPlayerEconomy({ playerId: "p", items: [{ itemId: "x", quantity: 1 }, { itemId: "x", quantity: 2 }], createdAt: "now" }), /duplicate item/);
  const { economy, shop } = setup();
  assert.throws(() => buyFromShop(economy, { ...shop, prices: { bread: Number.MAX_SAFE_INTEGER } }, "bread", 2, "now", "tx-overflow"), /transaction amount/);
});
