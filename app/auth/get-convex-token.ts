import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import type { User } from "better-auth";
import { symmetricDecrypt } from "better-auth/crypto";
import { SignJWT, importJWK } from "jose";
import { Resource } from "sst";
import { auth } from "./server";

interface JWKModel {
  id: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
}

async function getJwkDetails() {
  const adapter = (await auth.$context).adapter;
  const [jwkRecord] = await adapter.findMany<JWKModel>({
    model: "jwks",
    sortBy: {
      field: "createdAt",
      direction: "desc",
    },
    limit: 1,
  });

  if (!jwkRecord) {
    console.error("No JWK found in the database for OIDC signing.");
    throw new Error("OIDC signing key not configured.");
  }

  // The 'privateKey' field from the DB stores the *encrypted* JWK. Decrypt it.
  const decryptedJwkString = JSON.parse(
    await symmetricDecrypt({
      key: Resource.AuthSecret.value,
      data: JSON.parse(jwkRecord.privateKey),
    }),
  );

  // Load decrypted JWK into jose
  const privateKey = await importJWK(
    decryptedJwkString,
    Resource.AppConfig.convexIdToken.algorithm,
  );

  return {
    privateKey,
    keyId: jwkRecord.id,
  };
}

async function mintTokenForConvex(user: User) {
  const { privateKey, keyId } = await getJwkDetails();

  return await new SignJWT({
    sub: user.id,
  })
    .setProtectedHeader({ alg: Resource.AppConfig.convexIdToken.algorithm, kid: keyId })
    .setIssuedAt()
    .setIssuer(`https://${Resource.AppConfig.domain}/api/auth`)
    .setAudience(Resource.AppConfig.convexIdToken.audience)
    .setExpirationTime("1h")
    .sign(privateKey);
}

export const getConvexToken = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({
    headers: getWebRequest()?.headers ?? new Headers(),
  });
  if (!session) return { error: "Unauthorized" };

  try {
    const idToken = await mintTokenForConvex(session.user);
    return { idToken };
  } catch (error) {
    console.error("Error minting token for Convex:", error);
    const errorMessage = error instanceof Error ? error.message : "Token minting failed";
    return { error: "Failed to generate token", details: errorMessage };
  }
});
