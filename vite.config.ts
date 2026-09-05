import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

export default defineConfig({
    resolve: {
        alias: {
            '@': 'resources/js',
        },
    },
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
            },
        },
        rollupOptions: {
            onwarn(warning) {
                // Suppress unresolved import warnings
                if (warning.code === 'UNRESOLVED_ENTRY' || warning.code === 'UNRESOLVED_IMPORT') {
                    return;
                }
            },
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (
                            id.includes('react') ||
                            id.includes('@inertiajs/react') ||
                            id.includes('react-dom')
                        ) {
                            return 'vendor';
                        }

                        if (
                            id.includes('@radix-ui/react-dialog') ||
                            id.includes('@radix-ui/react-dropdown-menu') ||
                            id.includes('@radix-ui/react-slot')
                        ) {
                            return 'ui';
                        }
                    }
                },
            },
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
});
