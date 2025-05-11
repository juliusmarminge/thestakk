import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  items: defineTable({
    header: v.string(),
    type: v.string(),
    status: v.string(),
    target: v.int64(),
    limit: v.int64(),
    reviewer: v.string(),
    order: v.float64(),
  }),

  //
  // Start BetterAuth
  //
  user: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    updatedAt: v.string(),
  }).index("byEmail", ["email"]),
  session: defineTable({
    expiresAt: v.string(),
    token: v.string(),
    updatedAt: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    userId: v.id("user"),
  })
    .index("byToken", ["token"])
    .index("byUserId", ["userId"]),
  account: defineTable({
    accountId: v.string(),
    providerId: v.string(),
    userId: v.id("user"),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.string()),
    refreshTokenExpiresAt: v.optional(v.string()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
    updatedAt: v.string(),
  }).index("byUserId", ["userId"]),
  verification: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.string(),
    updatedAt: v.optional(v.string()),
  }),
  jwks: defineTable({
    publicKey: v.string(),
    privateKey: v.string(),
  }),
  oauthApplication: defineTable({
    clientId: v.string(),
    clientSecret: v.string(),
    name: v.string(),
    redirectURLs: v.string(),
    metadata: v.optional(v.string()),
    type: v.string(),
    disabled: v.boolean(),
    userId: v.optional(v.id("user")),
    updatedAt: v.string(),
  }).index("byClientId", ["clientId"]),
  oauthAccessToken: defineTable({
    accessToken: v.string(),
    refreshToken: v.string(),
    accessTokenExpiresAt: v.string(),
    refreshTokenExpiresAt: v.string(),
    clientId: v.id("oauthApplication"),
    userId: v.id("user"),
    scopes: v.string(),
    updatedAt: v.string(),
  }),
  oauthConsent: defineTable({
    userId: v.id("user"),
    clientId: v.id("oauthApplication"),
    scopes: v.string(),
    consentGiven: v.boolean(),
    updatedAt: v.string(),
  }),
  passkey: defineTable({
    name: v.optional(v.string()),
    publicKey: v.string(),
    userId: v.id("user"),
    credentialID: v.string(),
    counter: v.float64(),
    deviceType: v.string(),
    backedUp: v.boolean(),
    transports: v.optional(v.string()),
  }).index("byUserId", ["userId"]),
  //
  // End BetterAuth
  //
});
export default schema;
