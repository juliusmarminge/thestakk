import { ShardedCounter } from "@convex-dev/sharded-counter";
import * as Effect from "effect/Effect";
import * as Array from "effect/Array";
import { components } from "./_generated/api";
import {
  ConfectMutationCtx,
  ConfectQueryCtx,
  mutation,
  query,
} from "./confect";
import {
  DeleteOneArgs,
  DeleteOneResult,
  GetAllItemsArgs,
  GetAllItemsResult,
  MoveItemArgs,
  MoveItemResult,
  UpdateItemArgs,
  UpdateItemResult,
} from "./items.schemas";

const itemCounter = new ShardedCounter(components.shardedCounter, {
  shards: { items: 100 },
}).for("items");

export const getAll = query({
  args: GetAllItemsArgs,
  returns: GetAllItemsResult,
  handler: Effect.fn(function* (args) {
    const { db, ctx } = yield* ConfectQueryCtx;
    const [itemsCount, items] = yield* Effect.all([
      Effect.promise(() => itemCounter.count(ctx)),
      db
        .query("items")
        .order("desc")
        .take((args.pageIndex + 1) * args.pageSize)
        .pipe(Effect.map(Array.takeRight(args.pageSize))),
    ]);
    const pageCount = Math.ceil(itemsCount / args.pageSize);
    return { items, pageCount };
  }),
});

export const moveItem = mutation({
  args: MoveItemArgs,
  returns: MoveItemResult,
  handler: Effect.fn(function* (args) {
    const { db } = yield* ConfectMutationCtx;
    yield* db.patch(args.id, {
      order: args.order,
    });
    return { success: true };
  }),
});

export const update = mutation({
  args: UpdateItemArgs,
  returns: UpdateItemResult,
  handler: Effect.fn(function* ({ _id, ...update }) {
    const { db } = yield* ConfectMutationCtx;
    yield* db.patch(_id, update);
    return { success: true };
  }),
});

export const deleteOne = mutation({
  args: DeleteOneArgs,
  returns: DeleteOneResult,
  handler: Effect.fn(function* (args) {
    const { db } = yield* ConfectMutationCtx;
    yield* db.delete(args.id);
    return { success: true };
  }),
});
