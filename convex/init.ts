import { faker } from "@faker-js/faker";

import { internalMutation } from "./_generated/server";
import { ItemStatus, ItemType } from "./schema";

export const items = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("items").collect();
    if (allItems.length > 0) return;

    for (let i = 0; i < 100; i++) {
      await ctx.db.insert("items", {
        header: faker.company.name(),
        order: faker.number.int({ min: 1, max: 1000 }),
        type: faker.helpers.arrayElement(ItemType.literals),
        status: faker.helpers.arrayElement(ItemStatus.literals),
        target: faker.number.bigInt({ min: 1, max: 30 }).toString(),
        limit: faker.number.bigInt({ min: 1, max: 40 }).toString(),
        reviewer: faker.person.fullName(),
      });
    }
  },
});
