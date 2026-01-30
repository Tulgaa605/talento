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
        // NEXTAUTH_URL and NEXTAUTH_SECRET should be set in .env file
        // NEXTAUTH_URL should match your server URL (e.g., http://192.168.0.117:3000)
      }
    }
  ]
};
