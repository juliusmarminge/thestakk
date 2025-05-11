/// <reference types="vinxi/types/server" />

import { getRouterManifest } from "@tanstack/react-start/router-manifest";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { Resource } from "sst";
import { createRouter } from "~/router";

function redirectTo(url: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
    },
  });
}

export default createStartHandler({
  createRouter,
  getRouterManifest,
})((event) => {
  const url = new URL(event.request.url);
  const authBase = `https://${Resource.AppDomain.value}/api/auth`;
  console.log("[ssr] url", url.href);
  if (url.pathname === "/.well-known/jwks.json") {
    return redirectTo(`${authBase}/jwks`);
  }
  if (url.pathname === "/.well-known/openid-configuration") {
    return redirectTo(`${authBase}/.well-known/openid-configuration`);
  }

  return defaultStreamHandler(event);
});
