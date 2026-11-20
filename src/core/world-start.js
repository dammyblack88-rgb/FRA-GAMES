import { getWorldRegion, validateWorldRegistry } from "./world-regions.js";
import { createPlayerStart } from "./player-start.js";

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

/**
 * Resolve a character's selected region against the real content registry and
 * an existing district content pack. Planned regions cannot start a playable life.
 */
export function resolveWorldStartLocation({ registry, regionId, district }) {
  validateWorldRegistry(registry);
  const region = getWorldRegion(registry, regionId);
  if (!region) throw new RangeError("Selected world region is not registered");
  if (!["prototype", "available"].includes(region.status)) {
    throw new RangeError("Selected world region does not have playable content yet");
  }
  if (!district || typeof district !== "object" || Array.isArray(district)) {
    throw new TypeError("A loaded district content pack is required");
  }
  if (region.contentPackId !== district.id) {
    throw new RangeError("Selected region is not connected to this district content pack");
  }
  if (district.region !== region.name) {
    throw new RangeError("District region label does not match the world registry");
  }
  if (!Array.isArray(district.locations) || !district.locations.some(location => location.id === "home-compound")) {
    throw new RangeError("Playable starting district must contain a home-compound location");
  }
  return {
    region: {
      id: region.id,
      country: region.countryName,
      stateOrProvince: region.city,
      city: region.city
    },
    districtId: district.id,
    districtName: district.name
  };
}

/** Create a player start only when the selected region and district are registered and compatible. */
export function createRegisteredPlayerStart({
  character,
  createdAt,
  gameId = "shared-world",
  registry,
  regionId,
  district
}) {
  const resolved = resolveWorldStartLocation({ registry, regionId, district });
  return createPlayerStart({
    character,
    createdAt,
    gameId,
    startingRegion: resolved.region,
    startingDistrictId: resolved.districtId
  });
}
