const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://duck-tycoon-api-p3mlfcmlha-ul.a.run.app',
      changeOrigin: true,
    })
  );
  app.use(
    '/school/api',
    createProxyMiddleware({
      target: 'https://duck-tycoon-api-p3mlfcmlha-ul.a.run.app',
      changeOrigin: true,
    })
  );
};
