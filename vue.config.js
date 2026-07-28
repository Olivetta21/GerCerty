const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    client: {
      webSocketURL: 'ws://gercert.serv:8080/ws'
    },
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://gercert.serv',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
})
