/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "thestakk",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-north-1",
        },
        "@pulumiverse/vercel": "1.14.3",
      },
    };
  },
  async run() {
    const convexDeployment = new sst.Secret("ConvexDeployment");
    const convexUrl = new sst.Secret("ConvexUrl");
    const authSecret = new sst.Secret("AuthSecret");

    const rootDomain = "jumr.dev";
    const appDomain = new sst.Linkable("AppDomain", {
      properties: {
        value:
          $app.stage === "production"
            ? `thestakk.${rootDomain}`
            : `thestakk-${$app.stage}.${rootDomain}`,
      },
    });

    new sst.x.DevCommand("Convex", {
      dev: {
        command: "pnpm convex dev --local --run init:items",
      },
    });

    /**
     * Serverless AWS Lambda Deployment
     */
    new sst.aws.TanStackStart("TheStakkApp", {
      link: [convexDeployment, convexUrl, authSecret, appDomain],
      domain: {
        name: appDomain.properties.value,
        dns: sst.vercel.dns({
          domain: rootDomain,
        }),
      },
      dev: {
        command: "pnpm vinxi dev",
      },
      environment: {
        VITE_CONVEX_URL: convexUrl.value,
        VITE_SITE_URL: appDomain.properties.value,
      },
    });

    /**
     * Containerized Deployment
     */
    // const vpc = new sst.aws.Vpc("TheStakkVpc", { bastion: true });
    // const cluster = new sst.aws.Cluster("TheStakkCluster", { vpc });
    // const service = new sst.aws.Service("TheStakkService", {
    //   capacity: "spot",
    //   cpu: "1 vCPU",
    //   memory: "2 GB",
    //   cluster,
    //   link: [convexDeployment, convexUrl, authSecret],
    //   loadBalancer: {
    //     ports: [{ listen: "443/https", forward: "3000/http" }],
    //     domain: {
    //       name: `lb.${appDomain}`,
    //       dns: sst.vercel.dns({
    //         domain: rootDomain,
    //       }),
    //     },
    //   },
    //   dev: {
    //     command: "pnpm vinxi dev",
    //   },
    // });
    // Only need a single router since dev doesn't use deployed service
    // const router =
    //   $app.stage === "production"
    //     ? new sst.aws.Router("TheStakkRouter", {
    //         domain: {
    //           name: appDomain,
    //           dns: sst.vercel.dns({
    //             domain: rootDomain,
    //           }),
    //         },
    //       })
    //     : sst.aws.Router.get("TheStakkRouter", "CLOUDFRONT_DISTRIBUTION_ID");
    // router.route("/", $app.stage === "production" ? service.url : `https://unused.${rootDomain}`);
  },
});
