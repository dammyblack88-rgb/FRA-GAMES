const REGION_STATUSES = ["planned", "prototype", "available", "retired"];
const TRAVEL_MODES = ["road", "rail", "air", "sea", "transition"];

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function requireList(value, field, maximum = 50) {
  if (!Array.isArray(value)) throw new TypeError(`${field} must be an array`);
  if (value.length > maximum) throw new RangeError(`${field} cannot contain more than ${maximum} items`);
  return value;
}

function clone(value) {
  return structuredClone(value);
}

export function createWorldRegistry({ id = "global-world", version = 1, regions = [], connections = [] } = {}) {
  requireText(id, "id");
  if (!Number.isSafeInteger(version) || version < 1) throw new RangeError("version must be a positive whole number");
  const registry = { schemaVersion: 1, id: id.trim(), version, regions: [], connections: [] };
  let next = registry;
  for (const region of requireList(regions, "regions")) next = addWorldRegion(next, region);
  for (const connection of requireList(connections, "connections")) next = connectWorldRegions(next, connection);
  return next;
}

export function addWorldRegion(registry, input) {
  validateWorldRegistry(registry);
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("region must be an object");
  const region = {
    id: requireText(input.id, "region.id"),
    name: requireText(input.name, "region.name"),
    countryCode: requireText(input.countryCode, "region.countryCode").toUpperCase(),
    countryName: requireText(input.countryName, "region.countryName"),
    city: requireText(input.city, "region.city"),
    status: input.status ?? "planned",
    contentPackId: input.contentPackId == null ? null : requireText(input.contentPackId, "region.contentPackId"),
    description: input.description == null ? "" : String(input.description).trim()
  };
  if (!/^[A-Z]{2,3}$/.test(region.countryCode)) throw new RangeError("countryCode must be a 2- or 3-letter ISO-style code");
  if (!REGION_STATUSES.includes(region.status)) throw new RangeError("region.status is not supported");
  if (registry.regions.some(item => item.id === region.id)) throw new RangeError(`Duplicate region id: ${region.id}`);
  return { ...clone(registry), regions: [...clone(registry.regions), region], version: registry.version + 1 };
}

export function connectWorldRegions(registry, input) {
  validateWorldRegistry(registry);
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("connection must be an object");
  const connection = {
    id: requireText(input.id, "connection.id"),
    fromRegionId: requireText(input.fromRegionId, "connection.fromRegionId"),
    toRegionId: requireText(input.toRegionId, "connection.toRegionId"),
    mode: input.mode ?? "transition",
    estimatedTravelMinutes: input.estimatedTravelMinutes
  };
  if (connection.fromRegionId === connection.toRegionId) throw new RangeError("A region cannot connect to itself");
  if (!registry.regions.some(region => region.id === connection.fromRegionId)
    || !registry.regions.some(region => region.id === connection.toRegionId)) {
    throw new RangeError("Connection endpoints must reference registered regions");
  }
  if (!TRAVEL_MODES.includes(connection.mode)) throw new RangeError("connection.mode is not supported");
  if (!Number.isSafeInteger(connection.estimatedTravelMinutes) || connection.estimatedTravelMinutes < 1) {
    throw new RangeError("estimatedTravelMinutes must be a positive whole number");
  }
  if (registry.connections.some(item => item.id === connection.id)) {
    throw new RangeError(`Duplicate connection id: ${connection.id}`);
  }
  return { ...clone(registry), connections: [...clone(registry.connections), connection], version: registry.version + 1 };
}

export function getWorldRegion(registry, regionId) {
  validateWorldRegistry(registry);
  const id = requireText(regionId, "regionId");
  const region = registry.regions.find(item => item.id === id);
  return region ? clone(region) : null;
}

export function listAvailableWorldRegions(registry) {
  validateWorldRegistry(registry);
  return clone(registry.regions.filter(region => region.status === "available"));
}

export function getWorldConnections(registry, regionId) {
  validateWorldRegistry(registry);
  const id = requireText(regionId, "regionId");
  if (!registry.regions.some(region => region.id === id)) throw new RangeError("regionId is not registered");
  return clone(registry.connections.filter(connection => connection.fromRegionId === id || connection.toRegionId === id));
}

export function validateWorldRegistry(registry) {
  if (!registry || registry.schemaVersion !== 1 || !Array.isArray(registry.regions) || !Array.isArray(registry.connections)) {
    throw new TypeError("A supported world registry is required");
  }
  requireText(registry.id, "registry.id");
  if (!Number.isSafeInteger(registry.version) || registry.version < 1) throw new RangeError("registry.version is invalid");
  const regionIds = new Set();
  for (const region of registry.regions) {
    requireText(region.id, "region.id");
    if (regionIds.has(region.id)) throw new RangeError(`Duplicate region id: ${region.id}`);
    regionIds.add(region.id);
    if (!REGION_STATUSES.includes(region.status)) throw new RangeError("region.status is not supported");
  }
  const connectionIds = new Set();
  for (const connection of registry.connections) {
    requireText(connection.id, "connection.id");
    if (connectionIds.has(connection.id)) throw new RangeError(`Duplicate connection id: ${connection.id}`);
    connectionIds.add(connection.id);
    if (!regionIds.has(connection.fromRegionId) || !regionIds.has(connection.toRegionId)) {
      throw new RangeError("Connection references an unknown region");
    }
  }
  return true;
}

export const worldRegistryRules = Object.freeze({
  regionStatuses: [...REGION_STATUSES],
  travelModes: [...TRAVEL_MODES]
});
