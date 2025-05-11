import { createStartAPIHandler, defaultAPIFileRouteHandler } from "@tanstack/react-start/api";

export default createStartAPIHandler((event) => {
  const url = new URL(event.request.url);
  console.log("[api] url", url.href);
  return defaultAPIFileRouteHandler(event);
});
