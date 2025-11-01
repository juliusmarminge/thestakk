import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  items: defineTable({
    header: v.string(),
    type: v.string(),
    status: v.string(),
    target: v.int64(),
    limit: v.int64(),
    reviewer: v.string(),
    order: v.float64(),
  }),
});
export default schema;
