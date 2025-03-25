import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { TRPCRouter } from "~/trpc/router";

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<TRPCRouter>();

export type RouterOutputs = inferRouterOutputs<TRPCRouter>;
