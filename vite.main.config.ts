// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['better-sqlite3', 'uuid'],
    },
  },
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    // browserField was removed in Vite 8; use mainFields to prefer Node.js-compatible exports.
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
});
