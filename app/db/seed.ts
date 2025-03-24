import { seed } from "drizzle-seed";
import { db } from "~/db/client.ts";
import * as schema from "~/db/schema.ts";

await seed(db as any, { ItemTable: schema.ItemTable }).refine((funcs) => ({
  ItemTable: {
    count: 100,
    columns: {
      id: funcs.intPrimaryKey(),
      header: funcs.companyName(),
      order: funcs.intPrimaryKey(),
      type: funcs.valuesFromArray({
        values: ["Cover page", "Table of contents", "Narrative", "Technical content"],
      }),
      status: funcs.valuesFromArray({
        values: ["Triage", "Next up", "In Process", "Done"],
      }),
      target: funcs.int({ minValue: 1, maxValue: 30 }),
      limit: funcs.int({ minValue: 1, maxValue: 40 }),
      reviewer: funcs.fullName(),
    },
  },
}));
