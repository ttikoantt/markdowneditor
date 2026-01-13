import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        target: 'es2022',
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    editor: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/pm'],
                    markdown: ['unified', 'remark-parse', 'remark-stringify', 'remark-gfm'],
                },
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
