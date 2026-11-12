# Google Analytics / Tag Manager setup

Date: 12 November 2026  
Container: `GTM-K3LKMTF3`  
Branch: `rebuild`

## Installation

- The current Google Tag Manager container bootstrap is installed in the main Seiton website layout.
- The legacy static legal pages `/ketentuan/` and `/privasi/` include the same bootstrap.
- The fictional demo site intentionally does not load this container, so demo activity is not mixed into the main website's tracking.
- The original snippet pattern supplied by the site owner is retained: the asynchronous `gtm.js?id=GTM-K3LKMTF3` loader and `dataLayer` initialization with `gtag('js', new Date())`.

## What this does and does not confirm

Installing the container only loads Google Tag Manager. Actual Analytics collection depends on the tags, triggers, destinations, and publication state configured inside the GTM account. The repository does not contain the GTM account's private tag configuration and does not prove that a GA4 tag is already configured.

A GA4 destination normally uses a Google tag / GA4 configuration associated with a Measurement ID beginning with `G-`. Configure and publish that destination in the GTM interface.

## Preview data caution

The container loader is present on the main-site preview so its HTTP loading can be tested. If the currently published GTM container has tags with broad page-view triggers, test visits to the `pages.dev` preview may enter the same Analytics property. Configure production-hostname conditions in GTM (for example, host equals `seiton.biz.id`) before publishing analytics tags, or use a dedicated GTM preview/test environment.

## Validation

The preview workflow verifies:
- the container markup appears on every main-site HTML page;
- the demo HTML does not contain the main-site container;
- the GTM script URL responds successfully;
- `window.dataLayer` is initialized and includes the `js` initialization event.

The workflow does not publish the Cloudflare production project or modify the production domain.

## Privacy notice

The existing privacy-policy wording was not edited as part of this technical installation. Before production tracking is activated, review and approve an update describing analytics processing, the relevant Google service, cookie/device identifiers if enabled, purpose, consent or other applicable lawful basis, retention, and user choices.
