# Order bot — multi-item checkout schema

This directory documents the additive D1 migration used by the Telegram order bot.

## Data model

- `orders` remains the parent transaction, payment-verification and receipt record.
- `order_items` stores one row per SKU in a multi-product checkout.
- `order_item_inventory_movements` records stock reservation and release per SKU.
- Existing one-SKU orders continue using the original `inventory_movements` table.
- Telegram cart state is serialized per customer in the existing `OrderCoordinator` Durable Object.
- The parent order and all item/stock rows are written in a single D1 batch. Stock changes are guarded by SQLite triggers, so an unavailable SKU aborts the whole batch.

## Migration

Apply `migrations/0002_multi_item_cart.sql` to the order database. The migration uses `IF NOT EXISTS` and is safe to re-run.

Production database: `seiton-transactions-prod`.

The Worker runtime is currently deployed on Cloudflare as `seiton-order-bot`. This public repository contains the schema migration and deployment notes, not the proprietary Worker implementation or any secret bindings.
