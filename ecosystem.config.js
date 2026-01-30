module.exports = {
  apps: [
    {
      name: "nextapp",
      script: "./node_modules/next/dist/bin/next",
      args: "start",
      cwd: "C:/Users/Administrator/talento",
      interpreter: "node",
      watch: false,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
      }
    }
  ]
};
