import test from "node:test";
import assert from "node:assert/strict";
import { createAkaraStand, restockAkara, sellAkara } from "../src/core/business.js";

const stand = () => createAkaraStand({
  id: "stand-001",
  ownerLifeId: "life-001",
  name: "Mama's Akara",
  openingCashNaira: 10000,
  unitPriceNaira: 500,
  unitCostNaira: 200,
  initialStock: 10,
  createdAt: "2026-11-20T12:00:00.000Z"
});

test("creates a business with a recorded opening balance", () => {
  const business = stand();
  assert.equal(business.type, "akara-stand");
  assert.equal(business.stockUnits, 10);
  assert.equal(business.ledger[0].type, "opening-balance");
});

test("sale updates stock, cash and ledger without mutating prior state", () => {
  const before = stand();
  const after = sellAkara(before, 3, "2026-11-20T12:05:00.000Z", "sale-001");
  assert.equal(after.stockUnits, 7);
  assert.equal(after.cashNaira, 11500);
  assert.equal(after.revenueNaira, 1500);
  assert.equal(after.unitsSold, 3);
  assert.equal(before.stockUnits, 10);
  assert.equal(before.cashNaira, 10000);
});

test("rejects sales above available stock", () => {
  assert.throws(() => sellAkara(stand(), 11, "2026-11-20T12:05:00.000Z", "sale-002"), /Not enough stock/);
});

test("restock deducts cost and increases inventory", () => {
  const after = restockAkara(stand(), 5, "2026-11-20T12:10:00.000Z", "restock-001");
  assert.equal(after.stockUnits, 15);
  assert.equal(after.cashNaira, 9000);
  assert.equal(after.expensesNaira, 1000);
});

test("rejects restock when business cash is insufficient", () => {
  const poorStand = { ...stand(), cashNaira: 100 };
  assert.throws(() => restockAkara(poorStand, 1, "2026-11-20T12:10:00.000Z", "restock-002"), /Insufficient business cash/);
});
