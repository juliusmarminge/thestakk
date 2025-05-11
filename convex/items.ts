import { ShardedCounter } from "@convex-dev/sharded-counter";
import { v } from "convex/values";
import { Array } from "effect";
import { components } from "./_generated/api";
import { authedMutation, authedQuery, withoutSystemFields } from "./helpers";
import schema from "./schema";

const itemCounter = new ShardedCounter(components.shardedCounter, {
  shards: { items: 100 },
}).for("items");

export const getAll = authedQuery({
  args: {
    pageIndex: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args) => {
    const [itemsCount, items] = await Promise.all([
      itemCounter.count(ctx),
      ctx.db
        .query("items")
        .order("desc")
        .take((args.pageIndex + 1) * args.pageSize)
        .then(Array.takeRight(args.pageSize)),
    ]);
    const pageCount = Math.ceil(itemsCount / args.pageSize);
    return { items, pageCount };
  },
});

export const moveItem = authedMutation({
  args: {
    id: v.id("items"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      order: args.order,
    });
  },
});

export const update = authedMutation({
  args: {
    _id: v.id("items"),
    _creationTime: v.number(),
    ...schema.tables.items.validator.fields,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args._id, withoutSystemFields(args));
  },
});

export const deleteOne = authedMutation({
  args: {
    id: v.id("items"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
