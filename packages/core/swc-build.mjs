import { transformFile } from "@swc/core";
import fg from "fast-glob";
import fs from "fs-extra";

const buildPath = "lib";

/** @type {(path: string) => Promise<void>} */
const $delete = async (path) => {
    if (await fs.exists(path)) {
        await fs.rm(path, { recursive: true });
    }
};

/** @type {(file: string) => Promise<{ file: string; output: import("@swc/core").Output }>} */
const transfrom = async (file) => {
    const output = await transformFile(file, {
        jsc: {
            parser: {
                syntax: "typescript",
            },
            target: "esnext",
            paths: { "@/*": ["src/*"] },
            baseUrl: import.meta.dirname,
        },
        module: {
            type: "es6",
            resolveFully: true,
        },
        sourceMaps: false,
    });
    return {
        file,
        output,
    };
};

/** @type {(result: { file: string; output: import("@swc/core").Output }) => Promise<void>} */
const save = async (result) => {
    const dist = result.file.replace(/^src/, buildPath).replace(/ts$/, "js");

    await fs.outputFile(dist, result.output.code);
};

console.time("swc build");

await $delete(buildPath);
await Promise.all((await Promise.all((await fg.glob("src/**/*.ts")).map(transfrom))).map(save));

console.timeEnd("swc build");
