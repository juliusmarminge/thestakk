import { ShardedCounter } from "@convex-dev/sharded-counter";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { Array } from "effect";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { withoutSystemFields } from "./helpers";
import schema from "./schema";

const itemCounter = new ShardedCounter(components.shardedCounter, {
  shards: { items: 100 },
}).for("items");

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("items").collect();
    if (allItems.length > 0) {
      return;
    }

    await ctx.db.insert("items", {
      header: "Executive Summary",
      type: "Executive Summary",
      status: "Triage",
      target: 1n,
      limit: 1n,
      reviewer: "John Doe",
      order: 1,
    });
  },
});

export const getAll = query({
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

export const moveItem = mutation({
  args: {
    id: v.id("items"),
    order: v.number(),
    sessionToken: v.string(),
  },
  handler: async (ctx, { sessionToken, ...args }) => {
    const session = await ctx.runQuery(internal.betterAuth.getSession, { sessionToken });
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(args.id, {
      order: args.order,
    });
  },
});

export const update = mutation({
  args: {
    _id: v.id("items"),
    _creationTime: v.number(),
    sessionToken: v.string(),
    ...schema.tables.items.validator.fields,
  },
  handler: async (ctx, { sessionToken, ...args }) => {
    const session = await ctx.runQuery(internal.betterAuth.getSession, { sessionToken });
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(args._id, withoutSystemFields(args));
  },
});

export const deleteOne = mutation({
  args: {
    id: v.id("items"),
    sessionToken: v.string(),
  },
  handler: async (ctx, { sessionToken, id }) => {
    const session = await ctx.runQuery(internal.betterAuth.getSession, { sessionToken });
    if (!session) throw new Error("Session not found");

    await ctx.db.delete(id);
  },
});
