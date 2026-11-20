function assertMoney(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${field} must be a non-negative whole number of naira`);
  }
}

function assertUnits(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${field} must be a non-negative whole number`);
  }
}

export function createAkaraStand({ id, ownerLifeId, name, openingCashNaira, unitPriceNaira, unitCostNaira, initialStock, createdAt }) {
  for (const [value, field] of [
    [id, "id"], [ownerLifeId, "ownerLifeId"], [name, "name"], [createdAt, "createdAt"]
  ]) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new TypeError(`${field} must be a non-empty string`);
    }
  }
  assertMoney(openingCashNaira, "openingCashNaira");
  assertMoney(unitPriceNaira, "unitPriceNaira");
  assertMoney(unitCostNaira, "unitCostNaira");
  assertUnits(initialStock, "initialStock");
  if (unitPriceNaira <= unitCostNaira) {
    throw new RangeError("Selling price must be greater than unit cost");
  }

  return {
    schemaVersion: 1,
    id,
    ownerLifeId,
    name: name.trim(),
    type: "akara-stand",
    status: "open",
    cashNaira: openingCashNaira,
    unitPriceNaira,
    unitCostNaira,
    stockUnits: initialStock,
    unitsSold: 0,
    revenueNaira: 0,
    expensesNaira: 0,
    createdAt,
    updatedAt: createdAt,
    ledger: [{
      id: `${id}:opening`,
      type: "opening-balance",
      amountNaira: openingCashNaira,
      occurredAt: createdAt
    }]
  };
}

export function sellAkara(business, units, occurredAt, transactionId) {
  if (!business || business.type !== "akara-stand" || business.status !== "open") {
    throw new TypeError("An open akara stand is required");
  }
  assertUnits(units, "units");
  if (units === 0) throw new RangeError("units must be greater than zero");
  if (units > business.stockUnits) throw new RangeError("Not enough stock to complete this sale");
  if (typeof occurredAt !== "string" || occurredAt.trim() === "") throw new TypeError("occurredAt is required");
  if (typeof transactionId !== "string" || transactionId.trim() === "") throw new TypeError("transactionId is required");

  const revenue = units * business.unitPriceNaira;
  const costOfGoods = units * business.unitCostNaira;
  if (!Number.isSafeInteger(revenue) || !Number.isSafeInteger(costOfGoods)) {
    throw new RangeError("Transaction exceeds safe currency limits");
  }

  return {
    ...structuredClone(business),
    cashNaira: business.cashNaira + revenue,
    stockUnits: business.stockUnits - units,
    unitsSold: business.unitsSold + units,
    revenueNaira: business.revenueNaira + revenue,
    updatedAt: occurredAt,
    ledger: [
      ...business.ledger,
      {
        id: transactionId,
        type: "sale",
        units,
        amountNaira: revenue,
        costNaira: costOfGoods,
        occurredAt
      }
    ]
  };
}

export function restockAkara(business, units, occurredAt, transactionId) {
  if (!business || business.type !== "akara-stand" || business.status !== "open") {
    throw new TypeError("An open akara stand is required");
  }
  assertUnits(units, "units");
  if (units === 0) throw new RangeError("units must be greater than zero");
  if (typeof occurredAt !== "string" || occurredAt.trim() === "") throw new TypeError("occurredAt is required");
  if (typeof transactionId !== "string" || transactionId.trim() === "") throw new TypeError("transactionId is required");

  const cost = units * business.unitCostNaira;
  if (!Number.isSafeInteger(cost) || cost > business.cashNaira) {
    throw new RangeError("Insufficient business cash to restock");
  }

  return {
    ...structuredClone(business),
    cashNaira: business.cashNaira - cost,
    stockUnits: business.stockUnits + units,
    expensesNaira: business.expensesNaira + cost,
    updatedAt: occurredAt,
    ledger: [
      ...business.ledger,
      {
        id: transactionId,
        type: "restock",
        units,
        amountNaira: cost,
        occurredAt
      }
    ]
  };
}
