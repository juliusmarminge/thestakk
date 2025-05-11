export default {
  providers: [
    {
      domain: `https://${process.env.BETTER_AUTH_DOMAIN}/api/auth`,
      applicationID: process.env.BETTER_AUTH_APPLICATION_ID,
    },
  ],
};
