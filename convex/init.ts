import { faker } from "@faker-js/faker";
import { ItemStatus, ItemType } from "~/lib/data-models";
import { internalMutation } from "./_generated/server";

export const items = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("items").collect();
    if (allItems.length > 0) return;

    const itemTypes = ItemType.select("unit").map((unit) => unit.serializedValue.replace(/"/g, ""));
    const itemStatuses = ItemStatus.select("unit").map((unit) =>
      unit.serializedValue.replace(/"/g, ""),
    );

    for (let i = 0; i < 100; i++) {
      await ctx.db.insert("items", {
        header: faker.company.name(),
        order: faker.number.int({ min: 1, max: 1000 }),
        type: faker.helpers.arrayElement(itemTypes),
        status: faker.helpers.arrayElement(itemStatuses),
        target: faker.number.bigInt({ min: 1, max: 30 }),
        limit: faker.number.bigInt({ min: 1, max: 40 }),
        reviewer: faker.person.fullName(),
      });
    }
  },
});
