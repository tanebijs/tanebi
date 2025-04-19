import { transformFile } from "@swc/core";
import fg from "fast-glob";
import fs from "fs-extra";

/** @type {(path: string) => Promise<void>} */
const $delete = async (path) => {
    if (await fs.exists("dist")) {
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
    const dist = result.file.replace(/^src/, "dist").replace(/ts$/, "js");

    await fs.outputFile(dist, result.output.code);
};

console.time("swc build");

await $delete("dist");
await Promise.all((await Promise.all((await fg.glob("src/**/*.ts")).map(transfrom))).map(save));

console.timeEnd("swc build");
