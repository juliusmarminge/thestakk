import { type } from "arktype";

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

/**
 * A number or a string coerced as a number
 */
const EnvBigInt = type.string.pipe((s) => BigInt(s)).or("bigint");

export const Item = type({
  _id: "string",
  _creationTime: "number",
  header: "string",
  type: ItemType,
  status: ItemStatus,
  target: EnvBigInt,
  limit: EnvBigInt,
  reviewer: "string",
  order: "number",
});
