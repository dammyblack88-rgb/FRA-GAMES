import test from "node:test";
import assert from "node:assert/strict";
import {
  archiveCreatorContent, createCreatorContentDraft, publishCreatorContent,
  reviewCreatorContent, submitCreatorContent, validateCreatorContent
} from "../src/core/creator-content.js";

const base = {
  id: "content-001", ownerPlayerId: "player-001", type: "mission",
  title: "Help the Neighbour", description: "A short community mission with a helpful objective.",
  regionId: "lagos-ng", contentRating: "everyone",
  assets: [{ id: "asset-001", rightsStatus: "original" }],
  payload: { objectives: [{ type: "talk", targetId: "npc-mama-kemi" }] },
  createdAt: "2026-11-20T08:00:00.000Z"
};

test("creator work begins as a private draft and is not published automatically", () => {
  const draft = createCreatorContentDraft(base);
  assert.equal(draft.state, "draft");
  assert.equal(draft.publishedAt, null);
  assert.equal(draft.validation.passed, false);
});

test("validates a draft and requires evidence for licensed assets", () => {
  assert.throws(() => createCreatorContentDraft({
    ...base, assets: [{ id: "asset-lic", rightsStatus: "licensed" }]
  }), /rightsEvidence/);
  const draft = createCreatorContentDraft({
    ...base, assets: [{ id: "asset-lic", rightsStatus: "licensed", rightsEvidence: "licence-record-001" }]
  });
  assert.equal(validateCreatorContent(draft).passed, true);
});

test("content must pass validation and moderation before publishing", () => {
  const draft = createCreatorContentDraft(base);
  assert.throws(() => publishCreatorContent(draft, { publisherId: "moderator-01", occurredAt: "2026-11-20T09:00:00Z" }), /Only approved/);
  const submitted = submitCreatorContent(draft, "2026-11-20T08:10:00.000Z");
  assert.equal(submitted.state, "submitted");
  const approved = reviewCreatorContent(submitted, {
    reviewerId: "moderator-01", decision: "approve", occurredAt: "2026-11-20T08:20:00.000Z"
  });
  const published = publishCreatorContent(approved, {
    publisherId: "moderator-01", occurredAt: "2026-11-20T08:30:00.000Z", audience: "limited-test"
  });
  assert.equal(published.state, "published");
  assert.equal(published.audience, "limited-test");
  assert.equal(draft.state, "draft");
});

test("moderation can request changes or reject a submission", () => {
  const submitted = submitCreatorContent(createCreatorContentDraft(base), "2026-11-20T08:10:00.000Z");
  const needsChanges = reviewCreatorContent(submitted, {
    reviewerId: "moderator-01", decision: "request-changes", note: "Please adjust the reward.", occurredAt: "2026-11-20T08:20:00.000Z"
  });
  assert.equal(needsChanges.state, "changes-requested");
  const resubmitted = submitCreatorContent(needsChanges, "2026-11-20T08:40:00.000Z");
  assert.equal(resubmitted.state, "submitted");
  const rejected = reviewCreatorContent(resubmitted, {
    reviewerId: "moderator-01", decision: "reject", note: "Rights are unclear.", occurredAt: "2026-11-20T08:50:00.000Z"
  });
  assert.equal(rejected.state, "rejected");
  assert.throws(() => publishCreatorContent(rejected, { publisherId: "moderator-01", occurredAt: "2026-11-20T09:00:00Z" }), /Only approved/);
});

test("archiving is limited to published or rejected content", () => {
  const draft = createCreatorContentDraft(base);
  assert.throws(() => archiveCreatorContent(draft, { actorId: "owner-01", occurredAt: "2026-11-20T09:00:00Z" }), /Only published or rejected/);
  const submitted = submitCreatorContent(draft, "2026-11-20T08:10:00Z");
  const rejected = reviewCreatorContent(submitted, {
    reviewerId: "moderator-01", decision: "reject", occurredAt: "2026-11-20T08:20:00Z"
  });
  assert.equal(archiveCreatorContent(rejected, { actorId: "moderator-01", occurredAt: "2026-11-20T08:30:00Z" }).state, "archived");
});
