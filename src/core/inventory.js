function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}

function requireWhole(value, field, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) throw new RangeError(`${field} must be a whole number >= ${minimum}`);
}

function safeTotal(a, b, field) {
  const total = a + b;
  requireWhole(total, field);
  return total;
}

function validateItems(items, field = "items") {
  if (!Array.isArray(items)) throw new TypeError(`${field} must be an array`);
  const ids = new Set();
  for (const [index, entry] of items.entries()) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new TypeError(`${field}[${index}] must be an object`);
    requireText(entry.itemId, `${field}[${index}].itemId`);
    requireWhole(entry.quantity, `${field}[${index}].quantity`, 1);
    if (ids.has(entry.itemId)) throw new RangeError(`${field} contains duplicate item: ${entry.itemId}`);
    ids.add(entry.itemId);
  }
  return items;
}

function validateLedger(ledger) {
  if (!Array.isArray(ledger)) throw new TypeError("ledger must be an array");
  const ids = new Set();
  for (const [index, entry] of ledger.entries()) {
    if (!entry || typeof entry !== "object") throw new TypeError(`ledger[${index}] must be an object`);
    const id = requireText(entry.id, `ledger[${index}].id`);
    if (ids.has(id)) throw new RangeError(`Duplicate transaction id: ${id}`);
    ids.add(id);
  }
  return ledger;
}

/** Create a player-owned wallet and item inventory. Currency is stored as whole naira. */
export function createPlayerEconomy({ playerId, walletNaira = 0, items = [], createdAt }) {
  requireText(playerId, "playerId");
  requireText(createdAt, "createdAt");
  requireWhole(walletNaira, "walletNaira");
  validateItems(items);
  return {
    schemaVersion: 1,
    playerId: playerId.trim(),
    walletNaira,
    items: structuredClone(items),
    ledger: [{ id: `${playerId}:opening`, type: "opening-balance", amountNaira: walletNaira, occurredAt: createdAt }]
  };
}

/** Shop stock is explicit and finite; no purchase can silently create stock. */
export function createShop({ id, name, stock, prices, createdAt }) {
  requireText(id, "id");
  requireText(name, "name");
  requireText(createdAt, "createdAt");
  validateItems(stock, "stock");
  if (!prices || typeof prices !== "object" || Array.isArray(prices)) throw new TypeError("prices must be an item-price object");
  const safePrices = {};
  for (const [itemId, price] of Object.entries(prices)) {
    requireText(itemId, "price itemId");
    requireWhole(price, `prices.${itemId}`, 1);
    safePrices[itemId] = price;
  }
  for (const item of stock) if (!Object.hasOwn(safePrices, item.itemId)) throw new RangeError(`Missing price for stocked item: ${item.itemId}`);
  return { schemaVersion: 1, id: id.trim(), name: name.trim(), stock: structuredClone(stock), prices: safePrices, updatedAt: createdAt };
}

function assertEconomy(economy) {
  if (!economy || economy.schemaVersion !== 1) throw new TypeError("A supported player economy is required");
  requireText(economy.playerId, "playerId");
  requireWhole(economy.walletNaira, "walletNaira");
  validateItems(economy.items);
  validateLedger(economy.ledger);
}

function assertShop(shop) {
  if (!shop || shop.schemaVersion !== 1) throw new TypeError("A supported shop is required");
  validateItems(shop.stock, "shop.stock");
  validateLedger(shop.ledger ?? []);
}

function transact(economy, shop, itemId, quantity, occurredAt, transactionId, direction) {
  assertEconomy(economy);
  assertShop(shop);
  requireText(itemId, "itemId");
  requireWhole(quantity, "quantity", 1);
  requireText(occurredAt, "occurredAt");
  requireText(transactionId, "transactionId");
  if (economy.ledger.some(entry => entry.id === transactionId) || (shop.ledger ?? []).some(entry => entry.id === transactionId)) {
    throw new RangeError("Duplicate transaction id");
  }
  const price = shop.prices[itemId];
  if (!Number.isSafeInteger(price) || price < 1) throw new RangeError("Item is not available for trade");
  const stockIndex = shop.stock.findIndex(entry => entry.itemId === itemId);
  const playerIndex = economy.items.findIndex(entry => entry.itemId === itemId);
  const stockQuantity = stockIndex < 0 ? 0 : shop.stock[stockIndex].quantity;
  const playerQuantity = playerIndex < 0 ? 0 : economy.items[playerIndex].quantity;
  const amount = price * quantity;
  requireWhole(amount, "transaction amount", 1);

  let nextWallet;
  let nextItems;
  let nextStock;
  let ledgerEntry;
  if (direction === "buy") {
    if (stockQuantity < quantity) throw new RangeError("Shop does not have enough stock");
    if (economy.walletNaira < amount) throw new RangeError("Insufficient player funds");
    nextWallet = economy.walletNaira - amount;
    nextItems = structuredClone(economy.items);
    if (playerIndex < 0) nextItems.push({ itemId, quantity });
    else nextItems[playerIndex].quantity = safeTotal(playerQuantity, quantity, "inventory quantity");
    nextStock = structuredClone(shop.stock);
    if (stockQuantity === quantity) nextStock.splice(stockIndex, 1);
    else nextStock[stockIndex].quantity -= quantity;
    ledgerEntry = { id: transactionId, type: "purchase", itemId, quantity, amountNaira: amount, occurredAt };
  } else {
    if (playerQuantity < quantity) throw new RangeError("Not enough items in player inventory");
    nextWallet = safeTotal(economy.walletNaira, amount, "walletNaira");
    nextItems = structuredClone(economy.items);
    if (playerQuantity === quantity) nextItems.splice(playerIndex, 1);
    else nextItems[playerIndex].quantity -= quantity;
    nextStock = structuredClone(shop.stock);
    if (stockIndex < 0) nextStock.push({ itemId, quantity });
    else nextStock[stockIndex].quantity = safeTotal(stockQuantity, quantity, "shop stock");
    ledgerEntry = { id: transactionId, type: "sale", itemId, quantity, amountNaira: amount, occurredAt };
  }
  return {
    economy: { ...structuredClone(economy), walletNaira: nextWallet, items: nextItems, ledger: [...economy.ledger, ledgerEntry] },
    shop: { ...structuredClone(shop), stock: nextStock, updatedAt: occurredAt, ledger: [...(shop.ledger ?? []), { ...ledgerEntry, type: direction === "buy" ? "shop-sale" : "shop-purchase" }] }
  };
}

export function buyFromShop(economy, shop, itemId, quantity, occurredAt, transactionId) {
  return transact(economy, shop, itemId, quantity, occurredAt, transactionId, "buy");
}

export function sellToShop(economy, shop, itemId, quantity, occurredAt, transactionId) {
  return transact(economy, shop, itemId, quantity, occurredAt, transactionId, "sell");
}
