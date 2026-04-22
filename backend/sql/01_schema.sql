CREATE TABLE IF NOT EXISTS stores (
  store_id INTEGER PRIMARY KEY,
  store_name TEXT NOT NULL,
  city TEXT NOT NULL,
  store_type TEXT NOT NULL,
  opening_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS skus (
  sku_id INTEGER PRIMARY KEY,
  sku_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  cost_price NUMERIC(12,2) NOT NULL,
  brand TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  cust_id INTEGER PRIMARY KEY,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  city TEXT NOT NULL,
  loyalty_segment TEXT NOT NULL,
  preferred_channel TEXT NOT NULL,
  registration_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS promotions (
  promo_id INTEGER PRIMARY KEY,
  promo_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  discount_pct NUMERIC(5,2) NOT NULL,
  promo_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sales (
  id BIGSERIAL PRIMARY KEY,
  sale_date DATE NOT NULL,
  store_id INTEGER NOT NULL REFERENCES stores(store_id),
  sku_id INTEGER NOT NULL REFERENCES skus(sku_id),
  customer_id INTEGER NULL REFERENCES customers(cust_id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total_value NUMERIC(14,2) NOT NULL,
  channel TEXT NOT NULL,
  discount_pct NUMERIC(5,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id BIGSERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(store_id),
  sku_id INTEGER NOT NULL REFERENCES skus(sku_id),
  stock_on_hand INTEGER NOT NULL,
  reorder_point INTEGER NOT NULL,
  safety_stock INTEGER NOT NULL,
  last_restock_date DATE NOT NULL,
  snapshot_date DATE NOT NULL
);
