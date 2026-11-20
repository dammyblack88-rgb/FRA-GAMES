const MINUTES_PER_DAY = 24 * 60;

function assertMinute(value, field) {
  if (!Number.isInteger(value) || value < 0 || value >= MINUTES_PER_DAY) {
    throw new RangeError(`${field} must be a whole minute from 0 to 1439`);
  }
}

function splitInterval(startMinute, endMinute) {
  if (startMinute < endMinute) return [[startMinute, endMinute]];
  return [[startMinute, MINUTES_PER_DAY], [0, endMinute]];
}

export function validateNpcSchedule(schedule) {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    throw new TypeError("NPC schedule must contain at least one activity");
  }

  const segments = [];
  for (const [index, item] of schedule.entries()) {
    if (!item || typeof item !== "object") {
      throw new TypeError(`Schedule item ${index} must be an object`);
    }
    assertMinute(item.startMinute, `schedule[${index}].startMinute`);
    assertMinute(item.endMinute, `schedule[${index}].endMinute`);
    if (item.startMinute === item.endMinute) {
      throw new RangeError("An NPC activity cannot have a zero-length interval");
    }
    if (typeof item.activity !== "string" || item.activity.trim() === "") {
      throw new TypeError(`schedule[${index}].activity is required`);
    }
    if (typeof item.locationId !== "string" || item.locationId.trim() === "") {
      throw new TypeError(`schedule[${index}].locationId is required`);
    }
    for (const [start, end] of splitInterval(item.startMinute, item.endMinute)) {
      segments.push({ start, end, index });
    }
  }

  segments.sort((a, b) => a.start - b.start);
  let furthestEnd = -1;
  for (const segment of segments) {
    if (segment.start < furthestEnd) {
      throw new RangeError("NPC schedule contains overlapping activities");
    }
    furthestEnd = Math.max(furthestEnd, segment.end);
  }
  return true;
}

export function resolveNpcActivity(npc, minuteOfDay) {
  if (!npc || typeof npc !== "object") throw new TypeError("NPC profile is required");
  if (typeof npc.id !== "string" || npc.id.trim() === "") throw new TypeError("NPC id is required");
  assertMinute(minuteOfDay, "minuteOfDay");
  validateNpcSchedule(npc.schedule);

  const current = npc.schedule.find(item => {
    if (item.startMinute < item.endMinute) {
      return minuteOfDay >= item.startMinute && minuteOfDay < item.endMinute;
    }
    return minuteOfDay >= item.startMinute || minuteOfDay < item.endMinute;
  });

  if (!current) {
    return {
      npcId: npc.id,
      activity: npc.defaultActivity ?? "rest",
      locationId: npc.defaultLocationId ?? null,
      scheduled: false
    };
  }

  return {
    npcId: npc.id,
    activity: current.activity,
    locationId: current.locationId,
    scheduled: true
  };
}

export const npcTimeRules = Object.freeze({
  minutesPerDay: MINUTES_PER_DAY
});


/**
 * Resolve a lightweight population snapshot against one shared world minute.
 * This updates no actor objects and is suitable for NPCs outside the loaded camera area.
 */
export function simulateNpcPopulation(npcs, district, minuteOfDay) {
  assertMinute(minuteOfDay, "minuteOfDay");
  if (!Array.isArray(npcs)) throw new TypeError("npcs must be an array");
  if (!district || district.schemaVersion !== 1 || !Array.isArray(district.locations)) {
    throw new TypeError("A supported district is required");
  }
  const locationIds = new Set(district.locations.map(location => location.id));
  const npcIds = new Set();

  return npcs.map((npc, index) => {
    if (!npc || typeof npc !== "object" || Array.isArray(npc)) {
      throw new TypeError(`npcs[${index}] must be an object`);
    }
    if (typeof npc.id !== "string" || npc.id.trim() === "") {
      throw new TypeError(`npcs[${index}].id is required`);
    }
    if (npcIds.has(npc.id)) throw new RangeError(`Duplicate NPC id: ${npc.id}`);
    npcIds.add(npc.id);
    validateNpcSchedule(npc.schedule);

    const possibleLocations = [
      npc.defaultLocationId,
      ...npc.schedule.map(activity => activity.locationId)
    ].filter(Boolean);
    for (const locationId of possibleLocations) {
      if (!locationIds.has(locationId)) {
        throw new RangeError(`NPC ${npc.id} references unknown district location: ${locationId}`);
      }
    }
    const resolved = resolveNpcActivity(npc, minuteOfDay);
    return {
      ...resolved,
      role: npc.role ?? "resident",
      persistent: npc.persistent !== false
    };
  });
}
