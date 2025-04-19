import { defineConfig } from "@rspack/cli";
import path from "node:path";
import nodemodules from "webpack-node-externals";

export default defineConfig({
    entry: "./src/index.ts",
    context: import.meta.dirname,
    output: {
        clean: true,
        module: true,
        path: path.join(import.meta.dirname, "dist"),
        filename: "index.js",
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                loader: "builtin:swc-loader",
                options: {
                    jsc: {
                        parser: {
                            syntax: "typescript",
                        },
                    },
                },
                type: "javascript/auto",
            },
        ],
        parser: {
            javascript: {
                importMeta: false
            }
        }
    },
    resolve: {
        alias: { "@app": path.join(import.meta.dirname, "src") },
        extensions: [".ts"],
    },
    target: "es2022",
    externals: [
        nodemodules({ importType: "module" }),
        ({ request }, cb) => /^node:.*$/.test(request) ? cb(null, "module " + request) : cb(),
    ],
});
