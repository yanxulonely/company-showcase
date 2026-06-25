module.exports = {
  apps: [{
    name: 'company-api',
    script: 'index.js',
    cwd: '/opt/company-showcase/server',
    instances: 1,
    autorestart: true,
    max_memory_restart: '400M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
