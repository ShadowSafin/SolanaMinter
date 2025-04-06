import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import polyfillNode from "rollup-plugin-polyfill-node";

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    polyfillNode({
      include: [
        'node_modules/@solana/**',
        'node_modules/@metaplex/**',
        'node_modules/@irys/**',
        'node_modules/buffer/',
        'node_modules/stream/',
        'node_modules/events/',
        'node_modules/crypto-browserify/**'
      ]
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "buffer": "buffer",
      "stream": "stream-browserify",
      "http": "stream-http",
      "https": "https-browserify",
      "url": "url",
      "events": "events",
      "util": "util",
      "crypto": "crypto-browserify",
      "zlib": "browserify-zlib",
      "process": "process/browser",
      "assert": "assert"
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        {
          name: 'fix-node-globals-polyfill',
          setup(build) {
            build.onResolve({ filter: /_virtual-process-polyfill_\.js/ }, ({ path }) => ({ path }))
          },
        },
      ],
    },
    include: [
      'buffer',
      'stream-browserify',
      'stream-http',
      'url',
      'events',
      'util',
      'crypto-browserify',
      '@irys/sdk'
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
      requireReturnsDefault: 'auto'
    },
    rollupOptions: {
      plugins: [
        polyfillNode()
      ],
      external: ['fsevents'],
      output: {
        format: 'es',
        intro: 'var global = globalThis; var exports = {};'
      }
    }
  },
  define: {
    'process.env': {},
    'process.browser': true,
    global: 'globalThis',
    'global.crypto': 'crypto'
  }
}));