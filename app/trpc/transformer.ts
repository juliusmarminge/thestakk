import { parse, stringify } from "devalue";

export const transformer = {
  serialize: stringify,
  deserialize: parse,
};
