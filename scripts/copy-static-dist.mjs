import { access, cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const publicDir = new URL("../.output/public/", import.meta.url);
const indexFile = new URL("index.html", publicDir);
const distDir = fileURLToPath(new URL("../dist/", import.meta.url));

await access(indexFile);
await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(fileURLToPath(publicDir), distDir, { recursive: true });

console.log("Static site copied to dist/");
