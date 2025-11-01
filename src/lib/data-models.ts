import * as Schema from "effect/Schema";
import { Id } from "../../convex/_generated/dataModel";

export const ItemType = Schema.Literal(
  "Table of Contents",
  "Executive Summary",
  "Technical Approach",
  "Design",
  "Capabilities",
  "Focus Documents",
  "Narrative",
  "Cover Page",
);

export const ItemStatus = Schema.Literal(
  "Triage",
  "Next up",
  "In Progress",
  "Done",
);

export class Item extends Schema.Class<Item>("Item")({
  _id: Schema.String as unknown as Schema.Schema<Id<"items">, Id<"items">>,
  _creationTime: Schema.Number,
  header: Schema.String,
  type: ItemType,
  status: ItemStatus,
  target: Schema.BigInt,
  limit: Schema.BigInt,
  reviewer: Schema.String,
  order: Schema.Number,
}) {}
