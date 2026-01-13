import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

function tiptapPmResolver(): Plugin {
  return {
    name: 'tiptap-pm-resolver',
    enforce: 'pre',
    resolveId(id) {
      if (id === '@tiptap/pm') {
        return { id: '@tiptap/pm/state', external: false };
      }
      return null;
    },
  };
}

// https://vite.dev/config/
// For GitHub Pages, use: vite build --base=/markdowneditor/
export default defineConfig({
  plugins: [react(), tiptapPmResolver()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      '@tiptap/react',
      '@tiptap/core',
      '@tiptap/starter-kit',
      '@tiptap/extension-link',
      '@tiptap/extension-image',
      '@tiptap/extension-task-list',
      '@tiptap/extension-task-item',
      '@tiptap/extension-table',
      '@tiptap/extension-table-row',
      '@tiptap/extension-table-header',
      '@tiptap/extension-table-cell',
      '@tiptap/extension-placeholder',
      '@tiptap/extension-code-block-lowlight',
    ],
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
  },
});
