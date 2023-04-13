import { globSync } from 'glob';
import { type PluginContext } from 'rollup';
import path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';

export interface TargetOptions {
    basePath: string;
    matchGlobs: string[];
    ignoreGlobs?: string[];
    dest: string;
    flatten?: boolean;
}

export interface RollupCopyGlobOptions {
    targets?: TargetOptions[];
    runOnce?: boolean;
    verbose?: boolean;
    dryRun?: boolean;
    flatten?: boolean;
}

export default function copyGlob(options: RollupCopyGlobOptions = {}) {
    const { targets = [], verbose = false, dryRun = true, flatten = false } = options;

    const cwd = process.cwd();

    return {
        name: 'copyGlob',
        async buildStart(this: PluginContext): Promise<void> {
            await new Promise<void>((resolve) => {
                for (const target of targets) {
                    const absBasePath: string = path.join(cwd, target.basePath);

                    const matchedFiles: string[] = globSync(target.matchGlobs, {
                        cwd: absBasePath,
                        ignore: target.ignoreGlobs,
                        absolute: false,
                        nodir: true
                    });

                    for (const filename of matchedFiles) {
                        const destinationPath = path.join(target.dest, target.flatten ?? flatten ? path.basename(filename) : filename);

                        if (verbose) {
                            console.log(chalk.bold.green(`copyGlob matched ${chalk.white(filename)} --> ${chalk.blue(destinationPath)}`));
                        }

                        if (!dryRun) {
                            this.emitFile({
                                type: 'asset',
                                fileName: destinationPath,
                                source: fs.readFileSync(path.join(absBasePath, filename))
                            });
                        }
                    }
                }

                resolve();
            });
        }
    };
}
