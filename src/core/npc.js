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
