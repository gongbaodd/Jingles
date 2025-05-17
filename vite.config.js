// vite.config.js
export default {
  plugins: [
    {
      name: 'force-full-reload',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.json')) {
          server.ws.send({
            type: 'full-reload',
          });
        }
      },
    },
  ],
};