import { type } from "arktype";
import { eq } from "drizzle-orm";
import { db } from "~/db/client";
import { ItemTable } from "~/db/schema";
import { createTRPCRouter, publicProcedure } from "~/trpc/init";

export const trpcRouter = createTRPCRouter({
  getItems: publicProcedure
    .input(
      type({
        pageIndex: type("number"),
        pageSize: type("number"),
      }),
    )
    .query(async (opts) => {
      const [itemsCount, items] = await Promise.all([
        db.$count(ItemTable),
        db
          .select()
          .from(ItemTable)
          .orderBy(ItemTable.order)
          .limit(opts.input.pageSize)
          .offset(opts.input.pageIndex * opts.input.pageSize),
      ]);

      return {
        items,
        pageCount: Math.ceil(itemsCount / opts.input.pageSize),
      };
    }),

  moveItem: publicProcedure
    .input(
      type({
        id: "number",
        order: "number",
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(ItemTable)
        .set({
          order: input.order,
        })
        .where(eq(ItemTable.id, input.id));
    }),
});

export type TRPCRouter = typeof trpcRouter;
