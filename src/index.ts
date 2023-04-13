import { globSync } from 'glob';
import { EmittedFile, type PluginContext } from 'rollup';
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

type MatchedFile = EmittedFile & {
    sourceFile: string;
};

export default function copyGlob(options: RollupCopyGlobOptions = {}) {
    const { targets = [], verbose = false, dryRun = true, flatten = false } = options;

    const cwd = process.cwd();

    return {
        name: 'copyGlob',
        async buildStart(this: PluginContext): Promise<void> {
            await new Promise<void>((resolve) => {
                let targetCounter = 0;
                for (const target of targets) {
                    const filesToEmit: MatchedFile[] = [];

                    const absBasePath: string = path.join(cwd, target.basePath);

                    if (verbose) {
                        console.log(chalk.bold.green(`copyPlus scanning target[${targetCounter}] path: ${chalk.white(absBasePath)}`));
                        console.log(chalk.green(`\tcopyPlus target.matchGlobs:\t${chalk.white(target.matchGlobs)}`));
                        console.log(chalk.green(`\tcopyPlus target.ignoreGlobs:\t${chalk.white(target.ignoreGlobs)}`));
                        console.log(chalk.green(`\tcopyPlus target.dest:\t\t${chalk.white(target.dest)}`));
                        console.log(chalk.green(`\tcopyPlus target.flatten:\t${chalk.white(target.flatten)}`));
                    }

                    const matchedFiles: string[] = globSync(target.matchGlobs, {
                        cwd: absBasePath,
                        ignore: target.ignoreGlobs,
                        absolute: false,
                        nodir: true
                    });

                    for (const matchedFilename of matchedFiles) {
                        const destinationPath = path.join(target.dest, target.flatten ?? flatten ? path.basename(matchedFilename) : matchedFilename);

                        filesToEmit.push({
                            type: 'asset',
                            fileName: destinationPath,
                            source: fs.readFileSync(path.join(absBasePath, matchedFilename)),
                            sourceFile: matchedFilename
                        });
                    }

                    // For pretty formatting, get the longest source file name
                    let longestSourceFilename = filesToEmit.map((x) => x.sourceFile.length).reduce((a, b) => Math.max(a, b));

                    // Cap the padding width at 50 chars
                    longestSourceFilename = Math.min(longestSourceFilename, 50);

                    // Now emit the files
                    for (const file of filesToEmit.sort((a, b) => (a.sourceFile < b.sourceFile ? -1 : 1))) {
                        const printableSourceFilename = file.sourceFile.padEnd(longestSourceFilename).slice(0 - longestSourceFilename);

                        if (verbose) {
                            console.log(chalk.bold.green(`${dryRun ? chalk.yellow('[DRY RUN MODE] ') : ''}copyPlus matched ${chalk.white(printableSourceFilename)} --> ${chalk.blue(file.fileName)}`));
                        }

                        if (!dryRun) {
                            this.emitFile(file);
                        }
                    }

                    if (verbose) {
                        console.log(chalk.bold.green(`copyPlus target[${targetCounter}] matched ${filesToEmit.length} file${filesToEmit.length > 1 ? 's' : ''}\n`));
                    }

                    targetCounter++;
                }

                resolve();
            });
        }
    };
}
