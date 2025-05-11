export default {
  providers: [
    // {
    //   type: "customJwt",
    //   issuer: process.env.BETTER_AUTH_DOMAIN,
    //   jwks: `${process.env.BETTER_AUTH_DOMAIN}/.well-known/jwks.json`,
    //   applicationID: "convex",
    //   algorithm: "ES256",
    // },
    {
      domain: process.env.BETTER_AUTH_DOMAIN,
      applicationID: "VRJrThAJnnuuVWYLXckJuGDpCUWITRCc",
    },
  ],
};
