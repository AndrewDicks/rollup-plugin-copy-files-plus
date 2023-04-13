import { RollupOptions } from "rollup";
import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";
import path from "path";

const rollupBundles:RollupOptions[] = [
    {
        input: 'src/index.ts',
        output: {
            file: path.join('dist', 'index.mjs'),
            format: 'esm',
            sourcemap: false
        },
        
        plugins: [
            typescript({compilerOptions: { declarationDir: "./types", declaration: true}})
        ],
        external: ['glob', 'fs', 'chalk', 'path']
    },
    {
        input: './dist/types/src/index.d.ts',
        output: [{ file: "dist/index.d.ts", format: "es" }],
        plugins: [
            dts()
        ]
    }
];


export default rollupBundles;