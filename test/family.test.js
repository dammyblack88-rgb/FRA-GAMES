import test from "node:test";
import assert from "node:assert/strict";
import { createFamilyTree, addFamilyMember, getFamilyDescendants } from "../src/core/family.js";

test("creates a family tree rooted in the player's current life", () => {
  const tree = createFamilyTree({ rootLifeId: "life-1", name: "Dara", joinedAt: "2026-11-20" });
  assert.equal(tree.rootLifeId, "life-1");
  assert.equal(tree.members[0].relation, "self");
});

test("records children and grandchildren across generations", () => {
  let tree = createFamilyTree({ rootLifeId: "life-1", name: "Dara", joinedAt: "day-1" });
  tree = addFamilyMember(tree, { lifeId: "life-2", name: "Tomi", relation: "child", parentLifeIds: ["life-1"], joinedAt: "day-2" });
  tree = addFamilyMember(tree, { lifeId: "life-3", name: "Zara", relation: "child", parentLifeIds: ["life-2"], joinedAt: "day-3" });
  assert.deepEqual(getFamilyDescendants(tree, "life-1").map(member => member.lifeId), ["life-2", "life-3"]);
});

test("supports two-parent family links", () => {
  let tree = createFamilyTree({ rootLifeId: "parent-a", name: "A", joinedAt: "day-1" });
  tree = addFamilyMember(tree, { lifeId: "parent-b", name: "B", relation: "partner", parentLifeIds: [], joinedAt: "day-1" });
  tree = addFamilyMember(tree, { lifeId: "child", name: "C", relation: "child", parentLifeIds: ["parent-a", "parent-b"], joinedAt: "day-2" });
  assert.equal(getFamilyDescendants(tree, "parent-b")[0].lifeId, "child");
});

test("does not mutate the source tree when adding a family member", () => {
  const tree = createFamilyTree({ rootLifeId: "life-1", name: "Dara", joinedAt: "day-1" });
  const next = addFamilyMember(tree, { lifeId: "life-2", name: "Tomi", relation: "child", parentLifeIds: ["life-1"], joinedAt: "day-2" });
  assert.equal(tree.members.length, 1);
  assert.equal(next.members.length, 2);
});

test("rejects unknown parents, duplicate IDs and self-parenting", () => {
  const tree = createFamilyTree({ rootLifeId: "life-1", name: "Dara", joinedAt: "day-1" });
  assert.throws(() => addFamilyMember(tree, { lifeId: "life-2", name: "Tomi", relation: "child", parentLifeIds: ["missing"], joinedAt: "day-2" }), /Unknown parent/);
  assert.throws(() => addFamilyMember(tree, { lifeId: "life-1", name: "Again", relation: "child", joinedAt: "day-2" }), /already exists/);
  assert.throws(() => addFamilyMember(tree, { lifeId: "life-2", name: "Tomi", relation: "child", parentLifeIds: ["life-2"], joinedAt: "day-2" }), /own parent/);
});

test("rejects invalid family relation and unknown descendant query", () => {
  const tree = createFamilyTree({ rootLifeId: "life-1", name: "Dara", joinedAt: "day-1" });
  assert.throws(() => addFamilyMember(tree, { lifeId: "life-2", name: "Tomi", relation: "boss", joinedAt: "day-2" }), /supported non-self relation/);
  assert.throws(() => getFamilyDescendants(tree, "missing"), /Unknown ancestor/);
});
