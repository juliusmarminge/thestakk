import { type } from "arktype";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export * from "./auth-schema";

export const ItemType = type.enumerated(
  "Table of Contents",
  "Executive Summary",
  "Technical Approach",
  "Design",
  "Capabilities",
  "Focus Documents",
  "Narrative",
  "Cover Page",
);

export const ItemStatus = type.enumerated("Triage", "Next up", "In Progress", "Done");

export const Item = type({
  id: "number",
  header: "string",
  type: ItemType,
  status: ItemStatus,
  target: "number",
  limit: "number",
  reviewer: "string",
  order: "number",
});

export const ItemTable = sqliteTable("items", (d) => ({
  id: d.integer("id").primaryKey(),
  header: d.text("header").notNull(),
  type: d.text("type").$type<typeof ItemType.infer>().notNull(),
  status: d.text("status").$type<typeof ItemStatus.infer>().notNull(),
  target: d.integer("target").notNull(),
  limit: d.integer("limit").notNull(),
  reviewer: d.text("reviewer").notNull(),
  order: d.integer("order").notNull(),
}));
