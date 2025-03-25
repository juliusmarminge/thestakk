import { type } from "arktype";
import { eq } from "drizzle-orm";
import { db } from "~/db/client";
import { Item, ItemTable } from "~/db/schema";
import { createTRPCRouter, publicProcedure } from "~/trpc/init";

export async function* readableStreamToAsyncIterable(
  body: ReadableStream,
): AsyncGenerator<Uint8Array> {
  // Get a lock on the stream.
  const reader = body.getReader();

  try {
    while (true) {
      // Read from the stream.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { done, value } = await reader.read();
      // Exit if we're done.
      if (done) {
        return;
      }

      if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
        yield value;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        yield Buffer.from(value);
      }
    }
  } finally {
    // release the lock for reading from this stream.
    reader.releaseLock();
  }
}

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

  observe: publicProcedure
    .input(
      type({
        table: "string",
      }),
    )
    .subscription(async function* (opts) {
      const url = new URL(process.env.TURSO_CONNECTION_URL!.replace("libsql:", "https:"));
      url.pathname = "/beta/listen";
      url.searchParams.set("table", opts.input.table);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${process.env.TURSO_AUTH_TOKEN}`,
        },
      });

      const decoder = new TextDecoder();

      for await (const chunk of readableStreamToAsyncIterable(response.body!)) {
        const data = decoder.decode(chunk);
        if (data !== ":keep-alive") {
          yield { ack: true };
        }
      }
    }),

  updateItem: publicProcedure.input(Item).mutation(async ({ input }) => {
    const { id, ...rest } = input;
    await db.update(ItemTable).set(rest).where(eq(ItemTable.id, id));
  }),

  deleteItem: publicProcedure.input(type({ id: "number" })).mutation(async ({ input }) => {
    await db.delete(ItemTable).where(eq(ItemTable.id, input.id));
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
