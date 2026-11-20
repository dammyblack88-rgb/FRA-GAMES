const FAMILY_RELATIONS = Object.freeze(["self", "parent", "child", "sibling", "partner", "guardian", "dependent"]);
function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}
function validateFamilyTree(tree) {
  if (!tree || typeof tree !== "object" || Array.isArray(tree) || tree.schemaVersion !== 1) throw new TypeError("A supported family tree is required");
  requireText(tree.rootLifeId, "rootLifeId");
  if (!Array.isArray(tree.members)) throw new TypeError("members must be an array");
  const ids = new Set();
  for (const [index, member] of tree.members.entries()) {
    if (!member || typeof member !== "object" || Array.isArray(member)) throw new TypeError(`members[${index}] must be an object`);
    const id = requireText(member.lifeId, `members[${index}].lifeId`);
    if (ids.has(id)) throw new RangeError("Family member life IDs must be unique");
    ids.add(id);
    requireText(member.name, "member.name");
    requireText(member.relation, "member.relation");
    requireText(member.joinedAt, "member.joinedAt");
    if (!FAMILY_RELATIONS.includes(member.relation)) throw new RangeError("Unsupported family relation");
    if (!Array.isArray(member.parentLifeIds) || member.parentLifeIds.length > 2) throw new TypeError("parentLifeIds must contain zero, one or two IDs");
    if (new Set(member.parentLifeIds).size !== member.parentLifeIds.length) throw new RangeError("A parent cannot be listed twice");
    if (member.parentLifeIds.includes(id)) throw new RangeError("A family member cannot be their own parent");
  }
  if (!ids.has(tree.rootLifeId)) throw new RangeError("rootLifeId must identify a family member");
  for (const member of tree.members) {
    for (const parentId of member.parentLifeIds) {
      if (!ids.has(parentId)) throw new RangeError(`Unknown parent life: ${parentId}`);
    }
  }
  return tree;
}

/** Create a lineage record rooted in an existing player life. */
export function createFamilyTree({ rootLifeId, name, joinedAt }) {
  const root = {
    lifeId: requireText(rootLifeId, "rootLifeId"),
    name: requireText(name, "name"),
    relation: "self",
    parentLifeIds: [],
    joinedAt: requireText(joinedAt, "joinedAt")
  };
  return { schemaVersion: 1, rootLifeId: root.lifeId, members: [root] };
}

/** Add a relative or household member; parent references must already exist to keep lineage acyclic. */
export function addFamilyMember(snapshot, { lifeId, name, relation, parentLifeIds = [], joinedAt }) {
  validateFamilyTree(snapshot);
  const safeId = requireText(lifeId, "lifeId");
  const safeRelation = requireText(relation, "relation");
  if (safeRelation === "self" || !FAMILY_RELATIONS.includes(safeRelation)) throw new RangeError("New family member must have a supported non-self relation");
  if (!Array.isArray(parentLifeIds) || parentLifeIds.length > 2) throw new TypeError("parentLifeIds must be an array with at most two IDs");
  const parents = parentLifeIds.map((id, index) => requireText(id, `parentLifeIds[${index}]`));
  if (parents.includes(safeId)) throw new RangeError("A family member cannot be their own parent");
  if (new Set(parents).size !== parents.length) throw new RangeError("A parent cannot be listed twice");
  const next = structuredClone(snapshot);
  if (next.members.some(member => member.lifeId === safeId)) throw new RangeError("Family member life ID already exists");
  for (const parentId of parents) {
    if (!next.members.some(member => member.lifeId === parentId)) throw new RangeError(`Unknown parent life: ${parentId}`);
  }
  next.members.push({
    lifeId: safeId,
    name: requireText(name, "name"),
    relation: safeRelation,
    parentLifeIds: parents,
    joinedAt: requireText(joinedAt, "joinedAt")
  });
  return validateFamilyTree(next);
}

/** Return descendants in generation order, without exposing mutable tree records. */
export function getFamilyDescendants(snapshot, ancestorLifeId) {
  validateFamilyTree(snapshot);
  const ancestorId = requireText(ancestorLifeId, "ancestorLifeId");
  if (!snapshot.members.some(member => member.lifeId === ancestorId)) throw new RangeError("Unknown ancestor life");
  const descendants = [];
  const known = new Set([ancestorId]);
  let frontier = [ancestorId];
  while (frontier.length) {
    const nextGeneration = snapshot.members.filter(member =>
      !known.has(member.lifeId) && member.parentLifeIds.some(parentId => frontier.includes(parentId))
    );
    for (const member of nextGeneration) {
      known.add(member.lifeId);
      descendants.push(structuredClone(member));
    }
    frontier = nextGeneration.map(member => member.lifeId);
  }
  return descendants;
}

export const familyRules = Object.freeze({ relations: FAMILY_RELATIONS, maximumParents: 2 });
