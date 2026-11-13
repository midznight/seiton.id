# Google Analytics 4 (GA4) and Google Tag Manager

Date: 13 November 2026  
Branch: `feat/ga4-consent-analytics` → target `rebuild`

## Identifiers already recorded in the project

- GTM web container: `GTM-K3LKMTF3`
- GA4 web Measurement ID: `G-9Z02GKBZQX`

The repository records an earlier browser test that observed a GA4 `page_view` request to this Measurement ID. That proves a tag destination was configured at the time of that test; it does not prove the current GA4 property is owned by Seiton.id, that the current GTM version is published, or that its complete tag inventory is still appropriate. No Google Analytics or Google Tag Manager account was connected for this work.

## Current implementation prepared on the rebuild branch

- The main site and its two legal pages use a first-party consent controller: `/analytics-consent.js`.
- Analytics defaults to denied. The GTM container does not load until the visitor explicitly chooses **Izinkan analitik**.
- **Tolak analitik** stores the denied preference and does not load GTM.
- Visitors can reopen or change their preference using **Pengaturan privasi** in the footer.
- Advertising consent states remain denied; the Analytics choice does not grant advertising storage.
- The container is restricted to `seiton.biz.id` and `www.seiton.biz.id`, and only in an explicit Cloudflare production build. Preview hosts and the fictional demo never load the container.
- The standard GTM start event is pushed to `dataLayer` only after consent.
- The legal privacy page now describes GA4, identifiers, data categories, purpose, consent choice, preference changes, and the planned 14-month event/user-data retention setting.

This is a basic opt-in Consent Mode pattern: Google tags are blocked until the user grants consent. Google distinguishes this from advanced mode, where tags can load before consent and send cookieless pings. Official guide: https://developers.google.com/tag-platform/security/guides/consent

## Required GA4 account checks before production activation

These steps require an Editor or Administrator in the actual Google accounts and have not been completed by repository access:

1. Sign in to the intended Google Tag Manager account and verify that container `GTM-K3LKMTF3` belongs to Seiton.id.
2. Review every published tag, trigger, and variable. Confirm that the container sends expected GA4 events to `G-9Z02GKBZQX`, and remove duplicate or unrelated/advertising tags unless separately approved.
3. In GA4 Admin → Data Settings → Data Retention, set user-level and event-level retention to **14 months** and save. Standard GA4 properties offer 2- or 14-month retention for user-level data and 2- or 14-month retention for event data; standard aggregated reports are not governed by this raw event/user retention setting. Source: https://support.google.com/analytics/answer/7667196
4. Use Tag Assistant Preview on a controlled production test session after release. Accept analytics, verify a single `page_view` in GA4 Realtime/DebugView, then reject/change the preference and verify subsequent page loads do not load GTM.
5. Review the updated privacy notice and confirm it accurately reflects the published GTM container and property settings before production rollout.

## Data safety and preview policy

- No production GTM or GA4 request is made by GitHub CI, local preview, Cloudflare Pages preview, or the fictional demo site.
- A prior test run used localhost before the preview gate was in place; a few historical page_view events may remain in the GA4 property.
- Do not run browser tests against the production domain without an explicit test plan, as those visits may become real Analytics events.
- Standard GA4 reports and property-level settings must be checked directly in the Google account. The repository and CI cannot inspect or change account-side configuration.

## Performance

The previous lab Lighthouse run with the container enabled recorded a 93 performance score on the main homepage and 319 ms TBT; the GTM resource was approximately 183 KB. This was a lab result, not field Core Web Vitals. The opt-in gate prevents third-party Analytics code from loading for visitors who have not granted consent. Review the current GTM container for duplicate or expensive tags before publishing.
