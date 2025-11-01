import {
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import type { Id } from "./_generated/dataModel";

import {
  mutation as baseMutation,
  query as baseQuery,
} from "./_generated/server";
import { authComponent } from "./auth";

export function withoutSystemFields<
  T extends { _creationTime: number; _id: Id<any> },
>(doc: T) {
  const { _id, _creationTime, ...rest } = doc;
  return rest;
}

export const authedMutation = customMutation(baseMutation, {
  args: {},
  input: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    console.log("USER", user);
    // if (!user) throw new Error("Unauthorized");

    return { ctx: { ...ctx, user }, args };
  },
});

export const authedQuery = customQuery(baseQuery, {
  args: {},
  input: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    console.log("USER", user);
    // if (!user) throw new Error("Unauthorized");

    return { ctx: { ...ctx, user }, args };
  },
});
