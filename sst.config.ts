/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "the-stack",
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
    const vpc = new sst.aws.Vpc("MyVpc", { bastion: true });
    const cluster = new sst.aws.Cluster("MyCluster", { vpc });

    const tursoUrl = new sst.Secret("TursoUrl");
    const tursoToken = new sst.Secret("TursoToken");

    new sst.x.DevCommand("Studio", {
      link: [tursoUrl, tursoToken],
      dev: {
        command: "pnpm drizzle-kit studio",
      },
    });

    const service = new sst.aws.Service("MyService", {
      cluster,
      link: [tursoUrl, tursoToken],
      loadBalancer: {
        ports: [{ listen: "80/http", forward: "3000/http" }],
      },
      dev: {
        command: "pnpm vinxi dev",
      },
      environment: {
        TURSO_CONNECTION_URL: tursoUrl.value,
        TURSO_AUTH_TOKEN: tursoToken.value,
      },
    });

    const router =
      $app.stage === "production"
        ? new sst.aws.Router("MyRouter", {})
        : sst.aws.Router.get("MyRouter", "E39O4F0DRS8XXG");
    router.route("/", $app.stage === "production" ? service.url : "https://unused.jumr.dev");
  },
});
