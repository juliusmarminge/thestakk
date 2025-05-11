import { customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { SessionIdArg } from "convex-helpers/server/sessions";
import type { Id } from "./_generated/dataModel";

import { internal } from "./_generated/api";
import {
  type MutationCtx,
  type QueryCtx,
  mutation as baseMutation,
  query as baseQuery,
} from "./_generated/server";

export function withoutSystemFields<T extends { _creationTime: number; _id: Id<any> }>(doc: T) {
  const { _id, _creationTime, ...rest } = doc;
  return rest;
}

async function getUser(ctx: MutationCtx | QueryCtx, sessionId: string) {
  const session = await ctx.db
    .query("session")
    .withIndex("byToken", (q) => q.eq("token", sessionId))
    .unique();
  if (!session) return null;

  const user = await ctx.db
    .query("user")
    .withIndex("by_id", (q) => q.eq("_id", session.userId))
    .unique();
  if (!user) return null;

  return user;
}

export const authedMutation = customMutation(baseMutation, {
  args: {},
  input: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    // const user = await getUser(ctx, args.sessionId);
    // if (!user) throw new Error("Unauthorized");

    console.log("USER", user);

    return { ctx: { ...ctx, user }, args };
  },
});

export const authedQuery = customQuery(baseQuery, {
  args: {},
  input: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    // const user = await getUser(ctx, args.sessionId);
    // if (!user) throw new Error("Unauthorized");

    console.log("USER", user);

    return { ctx: { ...ctx, user }, args };
  },
});
