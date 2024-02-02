import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    base: './',
    plugins: [],
    assetsInclude: ['**/*.gltf'],
    resolve: {
        alias: {
            '~': fileURLToPath(new URL('./', import.meta.url)),
            '@': fileURLToPath(new URL('./node_modules/', import.meta.url)),
            '@app': fileURLToPath(new URL('./src/app/', import.meta.url)),
            '@shared': fileURLToPath(new URL('./src/shared/', import.meta.url)),
            '@assets': fileURLToPath(new URL('./src/assets/', import.meta.url))
        },
        extensions: ['.js', '.json', '.tsx', '.ts']
    },
    css: {
        preprocessorOptions: {
            scss: {
                // additionalData: `@import "@assets/styles/linkin.scss";`
            }
        }
    },
    build: {
        rollupOptions: {
            plugins: [
                copy({
                    targets: [
                        {
                            src: ['./src/assets'],
                            dest: 'dist/src',
                            expandDirectories: true,
                            onlyFiles: true
                        }
                    ],
                    flatten: false,
                    hook: 'writeBundle'
                })
            ]
        },
        outDir: 'dist' // Specify the output directory for the built files
        // sourcemap: true // Whether to generate sourcemaps
        // minify: 'terser' // Minify using terser, or 'esbuild' for ESBuild minification
    }
})
