CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_store_id ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_sku_id ON sales(sku_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);

CREATE INDEX IF NOT EXISTS idx_sales_channel ON sales(channel);
CREATE INDEX IF NOT EXISTS idx_skus_brand ON skus(brand);
CREATE INDEX IF NOT EXISTS idx_skus_category_subcategory ON skus(category, subcategory);

CREATE INDEX IF NOT EXISTS idx_inventory_snapshot_date ON inventory_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_inventory_store_sku ON inventory_snapshots(store_id, sku_id);

CREATE INDEX IF NOT EXISTS idx_customers_gender ON customers(gender);
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);
CREATE INDEX IF NOT EXISTS idx_customers_loyalty_segment ON customers(loyalty_segment);
CREATE INDEX IF NOT EXISTS idx_customers_registration_date ON customers(registration_date);
