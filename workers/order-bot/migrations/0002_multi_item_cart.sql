-- Multi-item Telegram checkout: preserve the existing parent orders table.
-- One parent order remains the payment/receipt unit; each SKU is stored in order_items.
CREATE TABLE IF NOT EXISTS order_items (
  order_id TEXT NOT NULL,
  sku TEXT NOT NULL COLLATE NOCASE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 1000),
  unit_price INTEGER NOT NULL CHECK(unit_price >= 0),
  subtotal INTEGER NOT NULL CHECK(subtotal >= 0),
  created_at TEXT NOT NULL,
  PRIMARY KEY(order_id, sku),
  FOREIGN KEY(order_id) REFERENCES orders(order_id),
  FOREIGN KEY(sku) REFERENCES catalog_products(sku)
);

CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(sku, order_id);

CREATE TABLE IF NOT EXISTS order_item_inventory_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  sku TEXT NOT NULL COLLATE NOCASE,
  movement_type TEXT NOT NULL CHECK(movement_type IN ('RESERVE','RELEASE')),
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  created_at TEXT NOT NULL,
  UNIQUE(order_id, sku, movement_type),
  FOREIGN KEY(order_id, sku) REFERENCES order_items(order_id, sku),
  FOREIGN KEY(sku) REFERENCES catalog_products(sku)
);

CREATE TRIGGER IF NOT EXISTS order_item_inventory_guard
BEFORE INSERT ON order_item_inventory_movements
WHEN NEW.movement_type = 'RESERVE'
BEGIN
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM order_items i
      JOIN catalog_products p ON p.sku = i.sku
      JOIN orders o ON o.order_id = i.order_id
      WHERE i.order_id = NEW.order_id
        AND i.sku = NEW.sku
        AND i.quantity = NEW.quantity
        AND p.active = 1
        AND o.sku = 'MULTI'
        AND o.stock_reserved = 1
    ) THEN RAISE(ABORT, 'PRODUCT_UNAVAILABLE')
    WHEN (SELECT stock FROM catalog_products WHERE sku = NEW.sku) IS NOT NULL
      AND (SELECT stock FROM catalog_products WHERE sku = NEW.sku) < NEW.quantity
      THEN RAISE(ABORT, 'INSUFFICIENT_STOCK')
  END;
END;

CREATE TRIGGER IF NOT EXISTS order_item_inventory_reserve_apply
AFTER INSERT ON order_item_inventory_movements
WHEN NEW.movement_type = 'RESERVE'
BEGIN
  UPDATE catalog_products
  SET stock = stock - NEW.quantity, updated_at = NEW.created_at
  WHERE sku = NEW.sku AND stock IS NOT NULL;
END;

CREATE TRIGGER IF NOT EXISTS order_item_inventory_release_apply
AFTER INSERT ON order_item_inventory_movements
WHEN NEW.movement_type = 'RELEASE'
BEGIN
  UPDATE catalog_products
  SET stock = stock + NEW.quantity, updated_at = NEW.created_at
  WHERE sku = NEW.sku AND stock IS NOT NULL;
END;
