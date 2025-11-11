module.exports = {
    apps: [
      {
        name: "nextapp",
        script: "node_modules/next/dist/bin/next",
        args: "start -H 0.0.0.0 -p 3000",
        cwd: process.cwd(),
        interpreter: "node",
        watch: false,
        instances: 1,
        exec_mode: "fork",
        env_production: {
          NODE_ENV: "production",
          HOSTNAME: "0.0.0.0",
          PORT: 3000
        },
        env_development: {
          NODE_ENV: "development",
          HOSTNAME: "0.0.0.0"
        }
      }
    ]
  };
  