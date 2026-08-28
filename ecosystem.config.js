/**
 * Configuración de PM2 para el servidor de producción (Clouding.io).
 * Arranque: pm2 start ecosystem.config.js && pm2 save
 */
module.exports = {
  apps: [
    {
      name: "fincax-web",
      cwd: "/opt/fincax/app",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 3000",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
