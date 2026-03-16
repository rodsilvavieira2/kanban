import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    // codeSplitting: false replaces the deprecated inlineDynamicImports option (Vite 8+)
    // This ensures the preload script is emitted as a single file
    rollupOptions: {
      output: {
        // Ensure the output file is named preload.js, matching main/index.ts:
        // path.join(__dirname, "preload.js")
        entryFileNames: 'preload.js',
      },
    },
  },
});
