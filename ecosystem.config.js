module.exports = {
  apps: [
    {
      name: "nextapp",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: process.cwd(),
      interpreter: "node",
      watch: false,         // PM2 watch-г унтраасан
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000
      }
    }
  ]
};
