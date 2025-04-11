import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
        include: ['src/**/*.{test,spec}.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json', 'lcov'],
            exclude: [
                'node_modules/',
                '**/*.test.ts',
                'vitest.config.ts',
                'src/vite-env.d.ts'
            ]
        },
    },
}); 