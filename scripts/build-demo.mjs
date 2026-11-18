// Bundles the standalone demo into ONE self-contained HTML file (dist/cue.html).
// Usage: node scripts/build-demo.mjs
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist");
mkdirSync(out, { recursive: true });

const result = await build({
  entryPoints: [join(root, "demo/main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  outdir: out,
  write: false,
  nodePaths: process.env.NODE_PATH ? process.env.NODE_PATH.split(":") : [],
});

const js = result.outputFiles.find((f) => f.path.endsWith(".js")).text;
const css = result.outputFiles.find((f) => f.path.endsWith(".css")).text;
const html = readFileSync(join(root, "demo/index.html"), "utf8")
  .replace("/*__CSS__*/", () => css)
  .replace("/*__JS__*/", () => js.replace(/<\/script/gi, "<\\/script"));

writeFileSync(join(out, "cue.html"), html);
console.log(`dist/cue.html  ${(html.length / 1024).toFixed(0)} KB`);
