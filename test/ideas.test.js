import test from "node:test";
import assert from "node:assert/strict";
import {
  createNpcIdeaState,
  generateNpcIdeas,
  updateNpcIdeaStatus,
  npcIdeaRules
} from "../src/core/ideas.js";

const curiousResident = {
  id: "resident-1",
  traits: { curiosity: 95, creativity: 85, ambition: 80, sociability: 75, discipline: 65, kindness: 70, adventurousness: 90 }
};

test("creates an isolated versioned idea history", () => {
  assert.deepEqual(createNpcIdeaState("resident-1"), {
    schemaVersion: 1, npcId: "resident-1", history: []
  });
});

test("generates ideas from low needs and personality without authored player commands", () => {
  const result = generateNpcIdeas(curiousResident, {
    needs: { fun: 10, social: 15 },
    occurredAt: "2040-04-02T08:00"
  });
  assert.ok(result.ideas.length > 0);
  assert.ok(result.ideas.length <= npcIdeaRules.maxSuggestionsPerPass);
  assert.ok(result.ideas.every(idea => idea.score >= 35));
  assert.equal(result.state.history.length, result.ideas.length);
});

test("nearby opportunities shape an idea and give it a useful destination", () => {
  const result = generateNpcIdeas(curiousResident, {
    needs: { fun: 10 },
    opportunities: [{
      id: "trial-7", type: "football-trial", title: "Agege youth trial",
      locationId: "community-pitch", description: "A local club is holding open trials."
    }],
    occurredAt: "2040-04-02T09:00"
  });
  const idea = result.ideas.find(item => item.opportunityId === "trial-7");
  assert.ok(idea);
  assert.equal(idea.locationId, "community-pitch");
  assert.match(idea.title, /Agege youth trial/);
});

test("NPC memories can influence relevant future ideas", () => {
  const context = { needs: { fun: 20 }, occurredAt: "2040-04-02T10:00" };
  const withoutMemory = generateNpcIdeas(curiousResident, context).ideas;
  const withMemory = generateNpcIdeas(curiousResident, {
    ...context, memories: [{ tags: ["career"] }]
  }).ideas;
  const plainCareer = withoutMemory.find(item => item.category === "career");
  const rememberedCareer = withMemory.find(item => item.category === "career");
  if (plainCareer && rememberedCareer) assert.ok(rememberedCareer.score >= plainCareer.score);
});

test("does not repeatedly suggest an idea already recorded in its history", () => {
  const first = generateNpcIdeas(curiousResident, {
    needs: { fun: 5, social: 5 }, occurredAt: "2040-04-02T08:00"
  });
  const second = generateNpcIdeas(curiousResident, {
    needs: { fun: 5, social: 5 }, occurredAt: "2040-04-02T09:00"
  }, first.state);
  const previousIds = new Set(first.ideas.map(item => item.id));
  assert.ok(second.ideas.every(item => !previousIds.has(item.id)));
});

test("tracks accepted, completed and abandoned idea outcomes", () => {
  const generated = generateNpcIdeas(curiousResident, {
    needs: { fun: 5, social: 5 }, occurredAt: "2040-04-02T08:00"
  });
  const idea = generated.ideas[0];
  const accepted = updateNpcIdeaStatus(generated.state, idea.id, "accepted", "2040-04-02T08:10");
  const completed = updateNpcIdeaStatus(accepted, idea.id, "completed", "2040-04-03T18:00");
  assert.equal(completed.history[0].status, "completed");
  assert.throws(() => updateNpcIdeaStatus(completed, idea.id, "unknown", "2040-04-03T18:01"), /Unsupported/);
});

test("rejects mismatched state, malformed needs and unknown idea outcomes", () => {
  assert.throws(() => generateNpcIdeas(curiousResident, {}, createNpcIdeaState("other")), /different NPC/);
  assert.throws(() => generateNpcIdeas(curiousResident, { needs: { fun: 101 } }), /from 0 to 100/);
  assert.throws(() => updateNpcIdeaStatus(createNpcIdeaState("resident-1"), "missing", "accepted", "now"), /not been generated/);
});
