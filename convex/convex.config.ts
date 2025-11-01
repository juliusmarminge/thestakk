import betterAuth from "@convex-dev/better-auth/convex.config";
import shardedCounter from "@convex-dev/sharded-counter/convex.config";

import { defineApp } from "convex/server";

const app = defineApp();
app.use(shardedCounter);
app.use(betterAuth);

export default app;
