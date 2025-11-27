import { defineSchema, defineTable } from "@rjdellecese/confect/server";
import * as Schema from "effect/Schema";

export class ItemType extends Schema.Literal(
  "Table of Contents",
  "Executive Summary",
  "Technical Approach",
  "Design",
  "Capabilities",
  "Focus Documents",
  "Narrative",
  "Cover Page",
) {}

export class ItemStatus extends Schema.Literal("Triage", "Next up", "In Progress", "Done") {}

export const Item = Schema.Struct({
  header: Schema.String,
  type: ItemType,
  status: ItemStatus,
  target: Schema.Int,
  limit: Schema.Int,
  reviewer: Schema.String,
  order: Schema.Number,
});

export const confectSchema = defineSchema({
  items: defineTable(Item),
});

export default confectSchema.convexSchemaDefinition;
