const MINUTES_PER_DAY = 24 * 60;

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function requireInteger(value, field, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new RangeError(`${field} must be a whole number greater than or equal to ${minimum}`);
  }
}

function parseWorldDate(value) {
  requireText(value, "worldDate");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError("worldDate must use YYYY-MM-DD format");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new RangeError("worldDate must be a real calendar date");
  }
  return date;
}

export function createWorldClock({
  id,
  worldDate,
  minuteOfDay = 8 * 60,
  minutesPerRealSecond = 1,
  paused = false
}) {
  requireText(id, "id");
  parseWorldDate(worldDate);
  requireInteger(minuteOfDay, "minuteOfDay");
  if (minuteOfDay >= MINUTES_PER_DAY) {
    throw new RangeError("minuteOfDay must be from 0 to 1439");
  }
  requireInteger(minutesPerRealSecond, "minutesPerRealSecond", 1);
  if (typeof paused !== "boolean") throw new TypeError("paused must be a boolean");

  return {
    schemaVersion: 1,
    id: id.trim(),
    worldDate,
    minuteOfDay,
    minutesPerRealSecond,
    paused
  };
}

/** Advance simulation time deterministically; real elapsed time is supplied by the caller. */
export function advanceWorldClock(clock, elapsedRealSeconds) {
  if (!clock || clock.schemaVersion !== 1) throw new TypeError("A supported world clock is required");
  parseWorldDate(clock.worldDate);
  requireInteger(clock.minuteOfDay, "clock.minuteOfDay");
  if (clock.minuteOfDay >= MINUTES_PER_DAY) throw new RangeError("clock.minuteOfDay is invalid");
  requireInteger(clock.minutesPerRealSecond, "clock.minutesPerRealSecond", 1);
  requireInteger(elapsedRealSeconds, "elapsedRealSeconds");

  if (clock.paused || elapsedRealSeconds === 0) return structuredClone(clock);

  const totalMinutes = clock.minuteOfDay + elapsedRealSeconds * clock.minutesPerRealSecond;
  if (!Number.isSafeInteger(totalMinutes)) throw new RangeError("Time advance exceeds safe limits");

  const daysToAdvance = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const nextDate = parseWorldDate(clock.worldDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + daysToAdvance);

  return {
    ...structuredClone(clock),
    worldDate: nextDate.toISOString().slice(0, 10),
    minuteOfDay: totalMinutes % MINUTES_PER_DAY
  };
}

export function createDistrict({ id, name, region, locations, roads }) {
  requireText(id, "id");
  requireText(name, "name");
  requireText(region, "region");
  if (!Array.isArray(locations) || locations.length === 0) {
    throw new TypeError("A district must contain at least one location");
  }
  if (!Array.isArray(roads)) throw new TypeError("roads must be an array");

  const locationIds = new Set();
  const safeLocations = locations.map((location, index) => {
    if (!location || typeof location !== "object") throw new TypeError(`locations[${index}] must be an object`);
    const locationId = requireText(location.id, `locations[${index}].id`);
    requireText(location.name, `locations[${index}].name`);
    requireText(location.type, `locations[${index}].type`);
    if (locationIds.has(locationId)) throw new RangeError(`Duplicate location id: ${locationId}`);
    locationIds.add(locationId);
    return { id: locationId, name: location.name.trim(), type: location.type.trim() };
  });

  const roadIds = new Set();
  const safeRoads = roads.map((road, index) => {
    if (!road || typeof road !== "object") throw new TypeError(`roads[${index}] must be an object`);
    const roadId = requireText(road.id, `roads[${index}].id`);
    const from = requireText(road.from, `roads[${index}].from`);
    const to = requireText(road.to, `roads[${index}].to`);
    requireInteger(road.travelCost, `roads[${index}].travelCost`, 1);
    if (from === to) throw new RangeError("A road cannot connect a location to itself");
    if (!locationIds.has(from) || !locationIds.has(to)) {
      throw new RangeError(`Road ${roadId} references an unknown location`);
    }
    if (roadIds.has(roadId)) throw new RangeError(`Duplicate road id: ${roadId}`);
    roadIds.add(roadId);
    if (road.oneWay !== undefined && typeof road.oneWay !== "boolean") {
      throw new TypeError(`roads[${index}].oneWay must be a boolean`);
    }
    return {
      id: roadId,
      from,
      to,
      travelCost: road.travelCost,
      oneWay: road.oneWay ?? false
    };
  });

  return {
    schemaVersion: 1,
    id: id.trim(),
    name: name.trim(),
    region: region.trim(),
    locations: safeLocations,
    roads: safeRoads
  };
}

export function getRoadNeighbors(district, locationId) {
  if (!district || district.schemaVersion !== 1) throw new TypeError("A supported district is required");
  requireText(locationId, "locationId");
  if (!district.locations.some(location => location.id === locationId)) {
    throw new RangeError("locationId does not belong to this district");
  }

  const neighbors = [];
  for (const road of district.roads) {
    if (road.from === locationId) neighbors.push({ locationId: road.to, roadId: road.id, travelCost: road.travelCost });
    if (!road.oneWay && road.to === locationId) neighbors.push({ locationId: road.from, roadId: road.id, travelCost: road.travelCost });
  }
  return neighbors;
}

/** Dijkstra path over the district's logical road graph; returns null when disconnected. */
export function findRoadPath(district, startLocationId, destinationLocationId) {
  const start = requireText(startLocationId, "startLocationId");
  const destination = requireText(destinationLocationId, "destinationLocationId");
  if (!district || district.schemaVersion !== 1) throw new TypeError("A supported district is required");
  const ids = new Set(district.locations.map(location => location.id));
  if (!ids.has(start) || !ids.has(destination)) throw new RangeError("Path endpoints must belong to this district");
  if (start === destination) return { locationIds: [start], roadIds: [], totalTravelCost: 0 };

  const distances = new Map([[start, 0]]);
  const previous = new Map();
  const visited = new Set();

  while (true) {
    let current = null;
    let best = Infinity;
    for (const [id, distance] of distances) {
      if (!visited.has(id) && distance < best) {
        current = id;
        best = distance;
      }
    }
    if (current === null) return null;
    if (current === destination) break;
    visited.add(current);

    for (const neighbor of getRoadNeighbors(district, current)) {
      if (visited.has(neighbor.locationId)) continue;
      const candidate = best + neighbor.travelCost;
      if (candidate < (distances.get(neighbor.locationId) ?? Infinity)) {
        distances.set(neighbor.locationId, candidate);
        previous.set(neighbor.locationId, { from: current, roadId: neighbor.roadId });
      }
    }
  }

  const locationIds = [destination];
  const roadIds = [];
  let cursor = destination;
  while (cursor !== start) {
    const step = previous.get(cursor);
    if (!step) return null;
    roadIds.unshift(step.roadId);
    cursor = step.from;
    locationIds.unshift(cursor);
  }
  return { locationIds, roadIds, totalTravelCost: distances.get(destination) };
}

export const worldRules = Object.freeze({ minutesPerDay: MINUTES_PER_DAY });
