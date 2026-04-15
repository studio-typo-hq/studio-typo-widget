import * as esbuild from "esbuild";

// IIFE build (drop-in via <script> tag)
await esbuild.build({
  entryPoints: ["src/studio-typo.js"],
  bundle: true,
  minify: true,
  format: "iife",
  outfile: "dist/studio-typo.js",
  target: "es2020",
});

// ESM build (import from npm/bundler)
await esbuild.build({
  entryPoints: ["src/studio-typo.js"],
  bundle: true,
  minify: true,
  format: "esm",
  outfile: "dist/studio-typo.esm.js",
  target: "es2020",
});

console.log("Built dist/studio-typo.js (IIFE) and dist/studio-typo.esm.js (ESM)");
