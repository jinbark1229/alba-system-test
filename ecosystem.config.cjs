module.exports = {
  apps: [
    {
      name: 'alba-system',
      script: 'npx',
      args: 'serve dist -l 3000 --single',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
