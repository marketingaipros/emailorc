import { readFileSync, writeFileSync, existsSync } from "node:fs";

const files = [
  ".open-next/worker.js",
  ".open-next/server-functions/default/handler.mjs",
];

for (const file of files) {
  if (!existsSync(file)) continue;
  const source = readFileSync(file, "utf8");
  const patched = source.replaceAll('process.chdir("");', "/* Cloudflare Workers has no filesystem cwd. */");
  if (patched !== source) {
    writeFileSync(file, patched);
    console.log(`Patched invalid process.chdir in ${file}`);
  }
}
