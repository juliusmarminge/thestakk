import { type } from "arktype";

export const Item = type({
  id: "number",
  header: "string",
  type: "string",
  status: "string",
  target: "number",
  limit: "number",
  reviewer: "string",
  order: "number",
});
