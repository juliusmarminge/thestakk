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
      },
    };
  },
  async run() {
    const vpc = new sst.aws.Vpc("TheStakkVpc", { bastion: true });
    const cluster = new sst.aws.Cluster("TheStakkCluster", { vpc });

    const tursoUrl = new sst.Secret("TursoUrl");
    const tursoToken = new sst.Secret("TursoToken");

    new sst.x.DevCommand("Studio", {
      link: [tursoUrl, tursoToken],
      dev: {
        command: "pnpm drizzle-kit studio",
      },
    });

    const service = new sst.aws.Service("TheStakkService", {
      capacity: "spot",
      cpu: "1 vCPU",
      memory: "2 GB",
      cluster,
      link: [tursoUrl, tursoToken],
      loadBalancer: {
        ports: [{ listen: "443/https", forward: "3000/http" }],
        domain: {
          name: "lb.thestakk.jumr.dev",
          dns: false,
          cert: "arn:aws:acm:eu-north-1:060795933320:certificate/6fa34d50-3762-4c85-be83-99d38cd512f9",
        },
      },
      dev: {
        command: "pnpm vinxi dev",
      },
    });

    const router =
      $app.stage === "production"
        ? new sst.aws.Router("TheStakkRouter", {
            domain: {
              name: "thestakk.jumr.dev",
              cert: "arn:aws:acm:us-east-1:060795933320:certificate/1412861d-0687-4c42-abcc-75e04d525177",
              dns: false,
            },
          })
        : sst.aws.Router.get("TheStakkRouter", "EZ95MUR96JU1W");
    router.route("/", $app.stage === "production" ? service.url : "https://unused.jumr.dev");
  },
});
