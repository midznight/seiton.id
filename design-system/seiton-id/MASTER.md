# Seiton.id — Master Design System

## Product and audience
Seiton.id is an Indonesian digital-services storefront for UMKM. It bridges two user jobs: (1) helping customers discover an usaha and its products, and (2) helping the owner organize inquiries and orders. Treat it as a hybrid of **B2B Service**, **E-commerce**, and **Restaurant/Food Service** rather than a generic SaaS dashboard.

## Skill-derived direction
The installed UI UX Pro Max catalog points to:
- **Primary page pattern:** Feature-Rich Showcase for B2B service and e-commerce discovery.
- **Supporting pattern:** Product Demo + Features for explaining the catalog, QR menu, and order flow.
- **Conversion pattern:** Hero + Features + CTA, with clear CTA labels and transparent pricing.
- **Visual style:** Minimalism & Swiss Style as the structural base; selectively use product photography and block-based visual previews where the product itself must be understood.
- **Astro implementation:** static-first HTML, zero client JavaScript unless the existing interaction materially helps; load only the assets needed for the visible content.

These recommendations are adapted to the existing Seiton brand. Do not replace its identity with a generic template or a new palette.

## Brand tokens
| Token | Value | Use |
|---|---|---|
| Ink | `#1F2937` | Primary text, navigation, dark surfaces |
| Ink soft | `#354253` | Secondary headings and dark UI layers |
| Orange | `#FF6B35` | Brand accent, large decorative areas, button fill with dark text |
| Orange deep | `#B94A22` | Stronger text accent on light surfaces |
| Text accent | `#A94420` | Links and small labels on white |
| Bone | `#F7F5EF` | Main warm background |
| Surface | `#FFFFFF` | Cards and content surfaces |
| Sage | `#E7EDE4` | Secondary section backgrounds |
| Border | `#DFE1DC` | Dividers and card boundaries |
| Muted | `#5E6874` | Supporting body copy |

Contrast note: `#FF6B35` on white is approximately 2.84:1 and must not be used for normal-size text. Use dark ink on orange fills (approximately 5.18:1), or deep orange text such as `#A94420` on white (approximately 5.94:1). Keep normal body text at least 16px with comfortable line height.

## Typography
- Keep the current system font stack to avoid remote font dependencies and layout shift.
- Headings use bold weight, tight but readable tracking, and responsive `clamp()` sizing.
- Body copy starts at 16px; long-form text should remain around 65–75 characters per line.
- Never rely on all-caps alone to communicate status.

## Layout and components
- Centered content container; wide hero uses a two-column composition on desktop and a single-column stack on narrow screens.
- Use clear section headings, 3–4 cards per desktop row only when card content remains readable; use 2 columns at tablet and 1 column on small screens.
- Service cards and demo cards need a product-facing preview, a clear title, a concise outcome-oriented description, and a single descriptive link.
- Use local product photography and existing demo assets. Label all fabricated product/catalog previews as demo data; do not present them as client work.
- Price cards are grouped by availability and source: fixed-price services from the live pricing API, custom-quote systems, and unavailable services. Never conflate a priced Website + Telegram package with the custom-quoted advanced System Bot / Website + Bot Combo.

## Interaction and accessibility
- Keyboard-operable navigation and tabs, visible focus, semantic headings, descriptive links, and skip link.
- Touch-friendly controls, minimum 44px component height where practical, and sufficient spacing.
- Decorative previews use empty alt text / hidden semantics. Meaningful product photography must receive descriptive alt text.
- No emoji as structural icons. Use CSS primitives or vector assets.
- Motion is limited to useful interaction feedback; honor `prefers-reduced-motion`.
- Do not clip long titles, descriptions, product names, prices, or badges. Ensure cards expand naturally.

## Responsive QA targets
Check 390px, 600px, 760px, 900px, and 1440px. Confirm no horizontal overflow, no clipped card content, no overlapping navigation, and stable image aspect ratios. Use the repository's build, integrity, journey, asset, and mobile accessibility checks.

## Content integrity
- Use Indonesian copy consistently.
- Make the offer and outcome explicit in the first viewport.
- Use only verified facts, API-backed prices, and clearly identified fictional demo data.
- No invented social proof, review counts, client logos, or business metrics.
