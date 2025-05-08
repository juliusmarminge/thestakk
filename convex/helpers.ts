import type { Id } from "./_generated/dataModel";

export function withoutSystemFields<T extends { _creationTime: number; _id: Id<any> }>(doc: T) {
  const { _id, _creationTime, ...rest } = doc;
  return rest;
}
