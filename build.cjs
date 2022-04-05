const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./source/fp4-update.cts"],
    outfile: "./output/fp4-update.cjs",
    platform: "node",
    target: "node16",
    bundle: true,
  })
  .catch(console.error);
