import site from "../data/site.json";

const trimTrailingSlash = (value) => {
  const text = String(value || "");
  return text.endsWith("/") ? text.slice(0, -1) : text;
};
const pagesPreview = process.env.CF_PAGES === "1" && process.env.CF_PAGES_BRANCH !== "main";
const pagesProduction = process.env.CF_PAGES === "1" && process.env.CF_PAGES_BRANCH === "main";

export const isPreviewBuild = pagesPreview;
export const isProductionBuild = pagesProduction;

export const siteUrls = {
  main: pagesPreview
    ? trimTrailingSlash(process.env.SEITON_MAIN_PREVIEW_URL || "https://rebuild.seiton-main-preview.pages.dev")
    : site.brand.website,
  demo: pagesPreview
    ? trimTrailingSlash(process.env.SEITON_DEMO_PREVIEW_URL || "https://rebuild.seiton-demo-preview.pages.dev")
    : site.brand.demo
};
