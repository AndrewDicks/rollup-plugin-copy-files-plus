import copyGlob, { RollupCopyGlobOptions } from '../src';
import { rollup, RollupOptions, RollupOutput } from 'rollup';
import { fileURLToPath } from 'url';
import * as path from 'path';
import { jest } from '@jest/globals';

process.chdir(`${path.dirname(fileURLToPath(import.meta.url))}/../assets/testFixtures/simple`);

async function build(pluginOptions: RollupCopyGlobOptions | null = null): Promise<RollupOutput> {
    const plugins = [];

    if (pluginOptions !== null) {
        plugins.push(copyGlob(pluginOptions));
    } else {
        plugins.push(copyGlob());
    }

    const rollupOptions: RollupOptions = {
        input: 'src/index.js',
        output: {
            dir: 'dist',
            format: 'es'
        },
        plugins: plugins
    };

    const bundleResult = await rollup(rollupOptions);

    return bundleResult.generate({ dir: 'dist' });
}

describe('Glob Copy Tests', function () {
    test('Test dryRun: undefined creates no files', async () => {
        const buildResult = await build({
            targets: [
                {
                    basePath: 'assets',
                    matchGlobs: ['**/*.html'],
                    dest: 'dist'
                }
            ]
        });

        expect(
            buildResult.output
                .filter((o) => o.type === 'asset')
                .map((o) => o.fileName)
                .sort()
        ).toEqual([]);
    });

    test('Test dryRun: true creates no files', async () => {
        const buildResult = await build({
            dryRun: true,
            targets: [
                {
                    basePath: 'assets',
                    matchGlobs: ['**/*.html'],
                    dest: 'dist'
                }
            ]
        });

        expect(
            buildResult.output
                .filter((o) => o.type === 'asset')
                .map((o) => o.fileName)
                .sort()
        ).toEqual([]);
    });

    test('Test dryRun: false creates files', async () => {
        const buildResult = await build({
            dryRun: false,
            targets: [
                {
                    basePath: 'assets',
                    matchGlobs: ['**/*.html'],
                    dest: 'dist'
                }
            ]
        });

        expect(
            buildResult.output
                .filter((o) => o.type === 'asset')
                .map((o) => o.fileName)
                .sort()
        ).toEqual(['dist/subpath/test4.html']);
    });

    test('Test ignore glob', async () => {
        const buildResult = await build({
            dryRun: false,
            targets: [
                {
                    basePath: 'assets',
                    matchGlobs: ['**/*'],
                    ignoreGlobs: ['**/*.html'],
                    dest: 'dist'
                }
            ]
        });

        expect(
            buildResult.output
                .filter((o) => o.type === 'asset')
                .map((o) => o.fileName)
                .sort()
        ).toEqual(['dist/subpath/test3.txt', 'dist/test1.txt', 'dist/test2.txt']);
    });

    test('Test parent path matching', async () => {
        const buildResult = await build({
            dryRun: false,
            targets: [
                {
                    basePath: '../flatten/assets',
                    matchGlobs: ['**/*.html'],
                    dest: 'dist'
                }
            ]
        });

        expect(
            buildResult.output
                .filter((o) => o.type === 'asset')
                .map((o) => o.fileName)
                .sort()
        ).toEqual(['dist/subpath/parentPathTest4.html']);
    });

    test('Test flattening per-target', async () => {
        const buildResult = await build({
            dryRun: false,
            targets: [
                {
                    basePath: '../flatten',
                    matchGlobs: ['**/*.txt'],
                    ignoreGlobs: ['**/*.html'],
                    dest: 'dist',
                    flatten: true
                },
                {
                    basePath: '../flatten',
                    matchGlobs: ['**/*.html'],
                    ignoreGlobs: ['**/*.txt'],
                    dest: 'dist',
                    flatten: false
                }
            ]
        });

        expect(
            buildResult.output
                .filter((o) => o.type === 'asset')
                .map((o) => o.fileName)
                .sort()
        ).toEqual(['dist/assets/subpath/parentPathTest4.html', 'dist/parentPathTest1.txt', 'dist/parentPathTest2.txt', 'dist/parentPathTest3.txt']);
    });

    test('Test flattening top-level', async () => {
        const buildResult = await build({
            dryRun: false,
            flatten: true,
            targets: [
                {
                    basePath: '../flatten',
                    matchGlobs: ['**/*.txt'],
                    ignoreGlobs: ['**/*.html'],
                    dest: 'dist'
                }
            ]
        });

        expect(
            buildResult.output
                .filter((o) => o.type === 'asset')
                .map((o) => o.fileName)
                .sort()
        ).toEqual(['dist/parentPathTest1.txt', 'dist/parentPathTest2.txt', 'dist/parentPathTest3.txt']);
    });

    test('Test flattening - Verbose mode enabled', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {
            return;
        });

        await build({
            dryRun: false,
            verbose: true,
            targets: [
                {
                    basePath: '../flatten',
                    matchGlobs: ['**/*.txt'],
                    ignoreGlobs: ['**/*.html'],
                    dest: 'dist',
                    flatten: true
                }
            ]
        });

        expect(logSpy).toHaveBeenCalledTimes(9);

        logSpy.mockReset();
    });

    test('Test flattening - dryRun & verbose mode enabled', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {
            return;
        });

        await build({
            dryRun: true,
            verbose: true,
            targets: [
                {
                    basePath: '../flatten',
                    matchGlobs: ['**/*.html'],
                    ignoreGlobs: ['**/*.txt'],
                    dest: 'dist',
                    flatten: true
                },
                {
                    basePath: '../flatten',
                    matchGlobs: ['**/*.txt'],
                    ignoreGlobs: ['**/*.html'],
                    dest: 'dist',
                    flatten: false
                }
            ]
        });

        expect(logSpy).toHaveBeenCalledTimes(16);

        logSpy.mockReset();
    });

    test('Test undefined/undefined flatten', async () => {
        await build({
            flatten: undefined,
            targets: [
                {
                    basePath: 'assets',
                    matchGlobs: ['**/*.html'],
                    dest: 'dist',
                    flatten: undefined
                }
            ]
        });

        expect(true).toBe(true);
    });

    test('Test false/undefined flatten', async () => {
        await build({
            flatten: false,
            targets: [
                {
                    basePath: 'assets',
                    matchGlobs: ['**/*.html'],
                    dest: 'dist',
                    flatten: undefined
                }
            ]
        });

        expect(true).toBe(true);
    });

    test('Test rollup warning on naming conflict', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
            return;
        });

        await build({
            dryRun: false,
            targets: [
                {
                    basePath: '../nameConflict',
                    matchGlobs: ['**/*.txt'],
                    ignoreGlobs: ['**/*.html'],
                    dest: 'dist',
                    flatten: true
                }
            ]
        });

        expect(warnSpy).toHaveBeenCalledTimes(1);
        warnSpy.mockReset();
    });

    test('Test defaults', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
            return;
        });

        await build();

        expect(warnSpy).toHaveBeenCalledTimes(0);

        warnSpy.mockReset();
    });
});
