# Seiton performance audit

Audit date: 12 November 2026  
Scope: preview builds on branch `rebuild`. Production domains and the production Pages project are not changed.

## Changes in this stage

- The legal pages no longer request Poppins from Google Fonts. They use the local system UI font stack, and the Google Fonts preconnects and stylesheet request have been removed.
- Two unavailable legacy favicon references (`favicon-32.png` and `favicon-180.png`) have been removed from the legal pages. The existing SVG favicon remains.
- The secondary demo catalog now uses the same responsive 480 px / 960 px WebP derivatives as the other product listings.
- The business-demo hero reuses the optimized RT-001 image variants rather than the old standalone 115 KB WebP.
- Deployment output pruning removes unused legacy demo photographs, the unused profile photograph, the demo QR artwork from the main site, and original upload files. Source files remain in GitHub.
- The legal pages continue to use their existing local `site.css` and `site.js`; they are retained because the legal-page HTML explicitly references them.

## External resource behavior

- Google Fonts is no longer an automatic page-load dependency.
- WhatsApp, Instagram, and Google Help URLs are ordinary links; opening them is user initiated.
- The pricing page intentionally calls `https://admin.seiton.biz.id/api/pricing` to obtain current prices. It remains an explicit runtime dependency; no hard-coded fallback values were added.
- The primary site and demo use locally bundled CSS and JavaScript, plus system fonts.

## Build budgets

The preview pipeline checks combined static CSS and JavaScript output for each target:

| Target | Maximum raw CSS | Maximum raw JavaScript |
|---|---:|---:|
| Main website | 100 KB | 40 KB |
| Demo website | 100 KB | 40 KB |

The build also fails if it finds Google Fonts references or remote stylesheet/script tags.
