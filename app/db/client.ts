import * as path from "node:path";
import * as sqlite from "node:sqlite";
import { Item } from "./schema";

export const db = new sqlite.DatabaseSync(
  path.join(import.meta.dirname, "db.sqlite"),
);

export function countItems() {
  const { count } = db.prepare("SELECT COUNT(*) as count FROM items").get() as {
    count: number;
  };

  return count;
}

export function getItems(pageIndex: number, pageSize: number) {
  const items = db
    .prepare("SELECT * FROM items ORDER BY `order` LIMIT ? OFFSET ?")
    .all(pageSize, pageIndex * pageSize);

  return Item.array().assert(items);
}
