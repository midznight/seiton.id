# Google Analytics / Tag Manager setup

Date: 12 November 2026  
Container: `GTM-K3LKMTF3`  
Branch: `rebuild`

## Installation

- The GTM bootstrap is included in production builds of the main Seiton website and its static legal pages.
- Cloudflare preview builds and all demo outputs suppress the loader, preventing test traffic from entering the live Analytics property.
- The original snippet pattern supplied by the site owner is retained: the asynchronous `gtm.js?id=GTM-K3LKMTF3` loader and `dataLayer` initialization with `gtag('js', new Date())`.

## What this does and does not confirm

An initial browser test confirmed the container responds with HTTP 200 and sends a GA4 `page_view` request to Measurement ID `G-9Z02GKBZQX`. This confirms that a GA4 destination is configured and firing in the published container. Analytics reports and account ownership were not inspected.

## Preview data caution

An initial integration test ran before the production gate was added and emitted several test `page_view` events from `127.0.0.1`. Those few test hits may be visible in the GA4 property. Current preview builds no longer load GTM, and only production main-site builds include the container.

## Validation

The preview workflow verifies:
- the container markup appears on every main-site HTML page;
- the demo HTML does not contain the main-site container;
- the GTM script URL responds successfully;
- `window.dataLayer` is initialized and includes the `js` initialization event.

The workflow does not publish the Cloudflare production project or modify the production domain. Tracking will start on the public website only after the main branch is deployed to `seiton.biz.id`.

## Privacy notice

The existing privacy-policy wording was not edited as part of this technical installation. Before production tracking is activated, review and approve an update describing analytics processing, the relevant Google service, cookie/device identifiers if enabled, purpose, consent or other applicable lawful basis, retention, and user choices.

## Performance note

The lab Lighthouse run with the container enabled recorded a 93 performance score on the main homepage and 319 ms TBT. The GTM resource was approximately 183 KB and was associated with long tasks of 242 ms and 155 ms. This is a lab result, not field Core Web Vitals. Review the published container for duplicate or unused tags and expensive triggers before production deployment.
