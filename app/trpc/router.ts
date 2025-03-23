import { type } from "arktype";
import { countItems, db, getItems } from "~/db/client";
import { createTRPCRouter, publicProcedure } from "./init";

export const trpcRouter = createTRPCRouter({
  test: publicProcedure.query(() => {
    return "Hello, World!";
  }),
  getItems: publicProcedure
    .input(
      type({
        pageIndex: type("number"),
        pageSize: type("number"),
      }),
    )
    .query((opts) => {
      const itemsCount = countItems();
      const items = getItems(opts.input.pageIndex, opts.input.pageSize);

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
      db.prepare("UPDATE items SET `order` = ? WHERE `id` = ?").run(input.order, input.id);
      return { ok: true };
    }),
});

export type TRPCRouter = typeof trpcRouter;
