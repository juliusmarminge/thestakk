import * as Schema from "effect/Schema";
import { Item } from "./schema";
import { Id } from "@rjdellecese/confect/server";

export class GetAllItemsArgs extends Schema.Class<GetAllItemsArgs>(
  "GetAllItemsArgs",
)({
  pageIndex: Schema.Number,
  pageSize: Schema.Number,
}) {}

class ItemResult extends Schema.Struct({
  _id: Id.Id("items"),
  ...Item.fields,
}) {}

export class GetAllItemsResult extends Schema.Class<GetAllItemsResult>(
  "GetAllItemsResult",
)({
  items: Schema.Array(ItemResult),
  pageCount: Schema.Number,
}) {}

export class MoveItemArgs extends Schema.Class<MoveItemArgs>("MoveItemArgs")({
  id: Id.Id("items"),
  order: Schema.Number,
}) {}

export class MoveItemResult extends Schema.Class<MoveItemResult>(
  "MoveItemResult",
)({
  success: Schema.Boolean,
}) {}

export class UpdateItemArgs extends Schema.Struct({
  ...Item.fields,
  _id: Id.Id("items"),
}) {}

export class UpdateItemResult extends Schema.Class<UpdateItemResult>(
  "UpdateItemResult",
)({
  success: Schema.Boolean,
}) {}

export class DeleteOneArgs extends Schema.Class<DeleteOneArgs>("DeleteOneArgs")(
  {
    id: Id.Id("items"),
  },
) {}

export class DeleteOneResult extends Schema.Class<DeleteOneResult>(
  "DeleteOneResult",
)({
  success: Schema.Boolean,
}) {}
