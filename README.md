
# @andrewdicks/rollup-plugin-copy-files

Copy files and folders (and optionally transform and rename them) during rollup bundling.

## Installation
```bash
# yarn
yarn add @andrewdicks/rollup-plugin-copy-files-plus -D

# npm
npm install @andrewdicks/rollup-plugin-copy-files-plus -D
```
## Usage

```ts
// rollup.config.js
import { RollupOptions } from "rollup";
import typescript from '@rollup/plugin-typescript';
import copyPlus from '@andrewdicks/rollup-plugin-copy-files';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.mjs',
    format: 'esm'
  },
  plugins: [
    copyPlus({
      targets: [
        {
          basePath: '../../../some/relative/path',
          matchGlobs: [],
          ignoreGlobs: [],
          dest: './inside/dist/folder',
          flatten: false
        }
      ],
      dryRun: false
    })
  ]
}
```

# Goals
* ✅ Strongly-typed source code and published declarations
* ️✴️ Safeguards around escaping the rollup destination
* ✅ Able to copy from parent folders using relative paths without escaping the rollup destination
* To support:
  * ✅ Structured copy
  * ✅ Flattened copy
  * 🔲 File renaming
  * 🔲 File content transformation (simple replacement, and also complex transformation)

### Key
* 🔲️ Not Started
* ✴️ In Progress
* ✅ Done
* ❌ Cancelled