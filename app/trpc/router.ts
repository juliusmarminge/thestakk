import { createTRPCRouter, publicProcedure } from "./init";

export const trpcRouter = createTRPCRouter({
  test: publicProcedure.query(() => {
    return "Hello, World!";
  }),
});

export type TRPCRouter = typeof trpcRouter;
