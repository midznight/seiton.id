import { defineConfig } from "astro/config";

const isDemo = process.env.SITE_TARGET === "demo";

export default defineConfig({
  site: isDemo ? "https://demo.seiton.biz.id" : "https://seiton.biz.id",
  srcDir: isDemo ? "./src/demo" : "./src",
  publicDir: "./public",
  outDir: isDemo ? "./dist-demo" : "./dist",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory"
  }
});