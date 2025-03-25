import { reset, seed } from "drizzle-seed";
import { db } from "~/db/client.ts";
import * as schema from "~/db/schema.ts";

await reset(db as any, { ItemTable: schema.ItemTable });

await seed(db as any, { ItemTable: schema.ItemTable }).refine((funcs) => ({
  ItemTable: {
    count: 100,
    columns: {
      id: funcs.intPrimaryKey(),
      header: funcs.companyName(),
      order: funcs.intPrimaryKey(),
      type: funcs.valuesFromArray({
        values: schema.ItemType.select("unit").map((unit) =>
          unit.serializedValue.replace(/"/g, ""),
        ),
      }),
      status: funcs.valuesFromArray({
        values: schema.ItemStatus.select("unit").map((unit) =>
          unit.serializedValue.replace(/"/g, ""),
        ),
      }),
      target: funcs.int({ minValue: 1, maxValue: 30 }),
      limit: funcs.int({ minValue: 1, maxValue: 40 }),
      reviewer: funcs.fullName(),
    },
  },
}));
