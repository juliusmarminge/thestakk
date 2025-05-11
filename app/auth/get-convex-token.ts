import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import type { User } from "better-auth";
import { symmetricDecrypt } from "better-auth/crypto";
import * as jose from "jose";
import { Resource } from "sst";
import { auth } from "~/auth/server";

const CONVEX_AUDIENCE = process.env.CONVEX_OIDC_CLIENT_ID || "VRJrThAJnnuuVWYLXckJuGDpCUWITRCc";
const ID_TOKEN_EXPIRATION = "1h";
const OIDC_SIGNING_ALGORITHM = "RS256";

interface JWKModel {
  id: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
}

export async function getJwkDetails() {
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

  console.log("[get-convex-token] jwkRecord", jwkRecord);

  // The 'privateKey' field from the DB stores the *encrypted* JWK. Decrypt it.
  const decryptedJwkString = await symmetricDecrypt({
    key: auth.options.secret,
    data: JSON.parse(jwkRecord.privateKey), // Remove quotes around hex string
  });
  console.log("[get-convex-token] decryptedJwkString", {
    rawStringFromDb: jwkRecord.privateKey,
    decryptedString: decryptedJwkString,
  });

  // Load decrypted JWK into jose
  const privateKey = await jose.importJWK(JSON.parse(decryptedJwkString), OIDC_SIGNING_ALGORITHM);
  const publicKey = await jose.importJWK(JSON.parse(jwkRecord.publicKey), OIDC_SIGNING_ALGORITHM);

  return {
    privateKey,
    keyId: jwkRecord.id,
    decryptedJwkString,
    publicKeyString: jwkRecord.publicKey,
    secret: auth.options.secret,
    publicKey,
  };
}

export async function mintTokenForConvex(user: User) {
  const { privateKey, keyId } = await getJwkDetails();

  const issuer = `https://${Resource.AppDomain.value}`;
  const nowInSeconds = Math.floor(Date.now() / 1000);

  const payload: jose.JWTPayload = {
    // Standard OIDC claims
    iss: issuer,
    sub: user.id,
    aud: CONVEX_AUDIENCE,
    iat: nowInSeconds,

    // User-specific claims (standard names)
    email: user.email,
    name: user.name,
    picture: user.image,
  };

  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({
      alg: OIDC_SIGNING_ALGORITHM,
      kid: keyId,
      typ: "JWT",
    })
    .setExpirationTime(ID_TOKEN_EXPIRATION)
    .sign(privateKey);

  return token;
}

// export const getConvexToken = createServerFn({ method: "GET" }).handler(async () => {
//   const session = await auth.api.getSession({
//     headers: getWebRequest()?.headers ?? new Headers(),
//   });
//   if (!session) return { error: "Unauthorized" };

//   try {
//     const idToken = await mintTokenForConvex(session.user);
//     return { idToken };
//   } catch (error) {
//     console.error("Error minting token for Convex:", error);
//     const errorMessage = error instanceof Error ? error.message : "Token minting failed";
//     return { error: "Failed to generate token", details: errorMessage };
//   }
// });

const pub = {
  e: "AQAB",
  kty: "RSA",
  n: "vT0YOxj5A6XjsZqNd5Rsa-IOWX1rV0dR--B1egWFZewx1zr4WmpDgmrM6R8j5CNy50xHcI30lDj9t_zpFvr5qXPyrKvpcKCIVIrRCsIGyVEX5FNHIjuSLOTOUFSYuTx5nZW8kCFihTmGP1q5X3lcTw2Y9rSbFG8_V1L9_XwCig0Y3u3UXu0HQ9fkJ4p14HJpqvi8TlQihRlcshY78LlhNHilPvseLb6835H4At5S4yZA2lOD6fn10g2XhIjRFBzFiO_x-PT384SB7eCW5X_C6V7dUL5ae7rz9WrGAgllIEJwn47v7QlPtDMlcftYQVqrybHUGaw-qTckMkAgUg_wCQ",
};

// const pub = {
//   kty: "RSA",
//   n: "4vQpPbkhkJ6JYOxj2BOaQybZNIlrLvhMFii4E_dIFsy6HugRBpsFTlFnOOXZ-pa30qKS75y58qwXWBtz2bPzjFdr8EuWU-gv5lkiHX8xQkhBPBnxUNtUO_mipoDiPap8POHYz1VAsZRwj2OS3sGUkOP1BkhqEqrNy70R00solDeiqqji7Bf5FIOEecKn4fvH1Kgng9RW1WUOM6QdUjq18R127kkbN2KJ0NI7Kgt7d3fL3IeLmMokUH7_2QMuDYdMHEDKTjCIt6AaiKkTV5L2xqIjJwCiEtNXcSew6rYqYG7fN0Uun66Rm2Hfa1p4OFkxGXK9BeoxRSR_820F_MNyRw",
//   e: "AQAB",
// };

const priv = {
  kty: "RSA",
  n: "4vQpPbkhkJ6JYOxj2BOaQybZNIlrLvhMFii4E_dIFsy6HugRBpsFTlFnOOXZ-pa30qKS75y58qwXWBtz2bPzjFdr8EuWU-gv5lkiHX8xQkhBPBnxUNtUO_mipoDiPap8POHYz1VAsZRwj2OS3sGUkOP1BkhqEqrNy70R00solDeiqqji7Bf5FIOEecKn4fvH1Kgng9RW1WUOM6QdUjq18R127kkbN2KJ0NI7Kgt7d3fL3IeLmMokUH7_2QMuDYdMHEDKTjCIt6AaiKkTV5L2xqIjJwCiEtNXcSew6rYqYG7fN0Uun66Rm2Hfa1p4OFkxGXK9BeoxRSR_820F_MNyRw",
  e: "AQAB",
  d: "RbuAinL-IancixfG68bGILjohxBsCvAGrM5RFO1nTH4V99YVGSL7g99WKHDTQ4AYthL2s8HDjpEa0RsKQwtcGzRnOVt4MorGYO_lIAwLLhL2XEmaUF47qPvgYml6WjkuWCSKkdXffVCfLyeIooH3LHemOwp38QljFyUeO3491yAW1KTE49nxYBndcCNhx5IkrCpwIyP9aZMoW4GiDw8aJmxOLGj6XtDQ4i3yMuJ2dIdYLm99o_tSZiDeXtLsBZOksBkfnULtpa7CTI7xpoafVr9EShJuHBXR-9MEpq268lRM5Mb_F4ahHk1b4opAyPItXLpa4LG_3GaFmMAOMpwSJQ",
  p: "-jC92UTvNrjvBOXMeYR1epe4FcB1QteVPftnB80P60yvIU8wPO-qRzKKb9fek4oJwbQ5IhhAOFKiWScpDTTkTwYizOI5w0pCQdcj4Qcx2Ba0rbsbGBp49Haryfct-N7wAtsZZBt8PlEIt6WhOCsI2hqHVpZ-AixOlgEwVInyuFU",
  q: "6DlKBJDuqCe7gicBU0dfbywNnhC-FVnXizqvn4N2Jyf7Uq6WFw3AXMT7UB6E_dufA8WXm4qvNHUsFVxouM0Y6cc9hBtwE17hjKbMydfnwtX1Npngqt8s53eyU-uWdl9m4XuEVYQn12ne-pP-e3o8JBSbBPZXFE1N-kd_FrNwjCs",
  dp: "ezn8mAHa7JIDr97balKyZjJKCfSkDMsQB9pGcdIvcA5yB67wLGNC9BRRmSqyxuprScvRhBh7sQIKUmz2TDnr5Xw5Mb6PAsAViEZFtrULeMoeLZ-FhcasIoQ8spobO4PapR1zERp0hGD3MTTUBk0z6_C7DgvLfpiCEGH_gvP6540",
  dq: "W_Gy2LP5iiKRHysKX0q3AnFSwu6mFBYKPVnzBxkpwr8VxtrRGjebnh9v0X0D8u7turSVHkR-sipiVeLMo76wyn7UYGXsrf63FtVD5_bQEFheSkwKpBzQzqSZuphgbmW_ei9JagJ1M9j7LANEkucGwNJXvlM6jxM8eIeuTfKl8Rk",
  qi: "hPenCD4dsMjCl9F4fKSFFUh-WCTJPfI1sw46s4bRDjlN8gh-cKmApPozWIMVgxVyFlle6yl3MLGiiXcKIxZLBO40LTQusNDwLYoqp2rOkXh4cS_0-d2tidMK9Bj-xB8muq1IzljbCG5Klvf7iZ_Eh0N5wscJvHncloHw-mdTjUQ",
};
