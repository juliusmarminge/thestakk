import { sqliteTable } from "drizzle-orm/sqlite-core";

export const UserTable = sqliteTable("user", (d) => ({
  id: d.text("id").primaryKey(),
  name: d.text("name").notNull(),
  email: d.text("email").notNull().unique(),
  emailVerified: d.integer("emailVerified").notNull(),
  image: d.text("image"),
  createdAt: d.text("createdAt").notNull(),
  updatedAt: d.text("updatedAt").notNull(),
}));

export const SessionTable = sqliteTable("session", (d) => ({
  id: d.text("id").primaryKey(),
  expiresAt: d.text("expiresAt").notNull(),
  token: d.text("token").notNull().unique(),
  createdAt: d.text("createdAt").notNull(),
  updatedAt: d.text("updatedAt").notNull(),
  ipAddress: d.text("ipAddress"),
  userAgent: d.text("userAgent"),
  userId: d
    .text("userId")
    .notNull()
    .references(() => UserTable.id),
}));

export const AccountTable = sqliteTable("account", (d) => ({
  id: d.text("id").primaryKey(),
  accountId: d.text("accountId").notNull(),
  providerId: d.text("providerId").notNull(),
  userId: d
    .text("userId")
    .notNull()
    .references(() => UserTable.id),
  accessToken: d.text("accessToken"),
  refreshToken: d.text("refreshToken"),
  idToken: d.text("idToken"),
  accessTokenExpiresAt: d.text("accessTokenExpiresAt"),
  refreshTokenExpiresAt: d.text("refreshTokenExpiresAt"),
  scope: d.text("scope"),
  password: d.text("password"),
  createdAt: d.text("createdAt").notNull(),
  updatedAt: d.text("updatedAt").notNull(),
}));

export const VerificationTable = sqliteTable("verification", (d) => ({
  id: d.text("id").primaryKey(),
  identifier: d.text("identifier").notNull(),
  value: d.text("value").notNull(),
  expiresAt: d.text("expiresAt").notNull(),
  createdAt: d.text("createdAt"),
  updatedAt: d.text("updatedAt"),
}));

export const PasskeyTable = sqliteTable("passkey", (d) => ({
  id: d.text("id").primaryKey(),
  name: d.text("name"),
  publicKey: d.text("publicKey").notNull(),
  userId: d
    .text("userId")
    .notNull()
    .references(() => UserTable.id),
  credentialID: d.text("credentialID").notNull(),
  counter: d.integer("counter").notNull(),
  deviceType: d.text("deviceType").notNull(),
  backedUp: d.integer("backedUp").notNull(),
  transports: d.text("transports"),
  createdAt: d.text("createdAt"),
}));

export const ItemTable = sqliteTable("items", (d) => ({
  id: d.integer("id").primaryKey(),
  header: d.text("header").notNull(),
  type: d.text("type").notNull(),
  status: d.text("status").notNull(),
  target: d.integer("target").notNull(),
  limit: d.integer("limit").notNull(),
  reviewer: d.text("reviewer").notNull(),
  order: d.integer("order").notNull(),
}));
