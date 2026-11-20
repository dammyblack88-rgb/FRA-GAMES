const CONTENT_TYPES = ["mission", "character", "business", "home", "district", "story", "tournament"];
const CONTENT_STATES = ["draft", "submitted", "changes-requested", "approved", "published", "rejected", "archived"];
const CONTENT_RATINGS = ["everyone", "teen", "mature"];

function text(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}

function id(value, field) {
  const result = text(value, field);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{1,99}$/.test(result)) throw new RangeError(`${field} has an invalid format`);
  return result;
}

function copy(value) {
  return structuredClone(value);
}

function validateAsset(asset, index) {
  if (!asset || typeof asset !== "object" || Array.isArray(asset)) throw new TypeError(`assets[${index}] must be an object`);
  const assetId = id(asset.id, `assets[${index}].id`);
  const rightsStatus = asset.rightsStatus;
  if (!["original", "licensed", "public-domain"].includes(rightsStatus)) {
    throw new RangeError(`assets[${index}].rightsStatus must identify original, licensed or public-domain rights`);
  }
  if (rightsStatus !== "original") text(asset.rightsEvidence, `assets[${index}].rightsEvidence`);
  return { id: assetId, rightsStatus, rightsEvidence: asset.rightsEvidence ?? null };
}

export function createCreatorContentDraft({
  id: contentId,
  ownerPlayerId,
  type,
  title,
  description,
  regionId,
  contentRating = "everyone",
  assets = [],
  payload = {},
  createdAt
}) {
  const safeType = type;
  if (!CONTENT_TYPES.includes(safeType)) throw new RangeError("content type is not supported");
  if (!CONTENT_RATINGS.includes(contentRating)) throw new RangeError("contentRating is not supported");
  if (!Array.isArray(assets) || assets.length > 100) throw new RangeError("assets must be an array containing at most 100 items");
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new TypeError("payload must be an object");
  const safeAssets = assets.map(validateAsset);
  if (new Set(safeAssets.map(asset => asset.id)).size !== safeAssets.length) throw new RangeError("asset ids must be unique");
  return {
    schemaVersion: 1,
    id: id(contentId, "id"),
    ownerPlayerId: id(ownerPlayerId, "ownerPlayerId"),
    type: safeType,
    title: text(title, "title").slice(0, 80),
    description: text(description, "description").slice(0, 1000),
    regionId: id(regionId, "regionId"),
    contentRating,
    assets: safeAssets,
    payload: copy(payload),
    state: "draft",
    version: 1,
    validation: { passed: false, issues: ["not-validated"] },
    moderation: { reviewerId: null, decision: null, note: null, reviewedAt: null },
    publishedAt: null,
    createdAt: text(createdAt, "createdAt"),
    updatedAt: text(createdAt, "createdAt")
  };
}

export function validateCreatorContent(draft) {
  validateDraft(draft);
  const issues = [];
  if (draft.title.length < 3) issues.push("title-too-short");
  if (draft.description.length < 10) issues.push("description-too-short");
  if (!draft.regionId) issues.push("region-required");
  if (draft.assets.some(asset => asset.rightsStatus !== "original" && !asset.rightsEvidence)) {
    issues.push("asset-rights-evidence-missing");
  }
  if (Object.keys(draft.payload).length === 0) issues.push("content-payload-empty");
  return { passed: issues.length === 0, issues };
}

export function submitCreatorContent(draft, occurredAt) {
  validateDraft(draft);
  if (draft.state !== "draft" && draft.state !== "changes-requested") throw new RangeError("Only drafts or requested changes can be submitted");
  const validation = validateCreatorContent(draft);
  if (!validation.passed) throw new RangeError(`Content cannot be submitted: ${validation.issues.join(", ")}`);
  return {
    ...copy(draft),
    state: "submitted",
    validation,
    moderation: { reviewerId: null, decision: null, note: null, reviewedAt: null },
    updatedAt: text(occurredAt, "occurredAt")
  };
}

export function reviewCreatorContent(draft, { reviewerId, decision, note = "", occurredAt }) {
  validateDraft(draft);
  if (draft.state !== "submitted") throw new RangeError("Only submitted content can be reviewed");
  if (!["approve", "request-changes", "reject"].includes(decision)) throw new RangeError("moderation decision is not supported");
  const reviewer = id(reviewerId, "reviewerId");
  const reviewedAt = text(occurredAt, "occurredAt");
  const safeNote = String(note).trim().slice(0, 1000);
  const state = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "changes-requested";
  return {
    ...copy(draft),
    state,
    moderation: { reviewerId: reviewer, decision, note: safeNote, reviewedAt },
    updatedAt: reviewedAt
  };
}

export function publishCreatorContent(draft, { publisherId, occurredAt, audience = "catalogue" }) {
  validateDraft(draft);
  if (draft.state !== "approved") throw new RangeError("Only approved content can be published");
  if (!["catalogue", "limited-test"].includes(audience)) throw new RangeError("audience is not supported");
  return {
    ...copy(draft),
    state: "published",
    publishedAt: text(occurredAt, "occurredAt"),
    publishedBy: id(publisherId, "publisherId"),
    audience,
    updatedAt: text(occurredAt, "occurredAt")
  };
}

export function archiveCreatorContent(draft, { actorId, occurredAt }) {
  validateDraft(draft);
  if (draft.state !== "published" && draft.state !== "rejected") throw new RangeError("Only published or rejected content can be archived");
  return {
    ...copy(draft),
    state: "archived",
    archivedBy: id(actorId, "actorId"),
    updatedAt: text(occurredAt, "occurredAt")
  };
}

function validateDraft(draft) {
  if (!draft || draft.schemaVersion !== 1 || !CONTENT_STATES.includes(draft.state)) {
    throw new TypeError("A supported creator content record is required");
  }
  id(draft.id, "draft.id");
  id(draft.ownerPlayerId, "draft.ownerPlayerId");
  if (!CONTENT_TYPES.includes(draft.type)) throw new RangeError("draft.type is invalid");
  if (!Array.isArray(draft.assets) || !draft.validation || !draft.moderation) {
    throw new TypeError("Creator content record is incomplete");
  }
}

export const creatorContentRules = Object.freeze({
  types: [...CONTENT_TYPES],
  states: [...CONTENT_STATES],
  ratings: [...CONTENT_RATINGS],
  maximumAssets: 100
});
