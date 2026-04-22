-- Limpiar tablas
TRUNCATE TABLE inventory_snapshots CASCADE;
TRUNCATE TABLE sales CASCADE;
TRUNCATE TABLE promotions CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE skus CASCADE;
TRUNCATE TABLE stores CASCADE;

-- IMPORTAR STORES (con conversión de fecha española)
CREATE TEMP TABLE temp_stores (
  store_id INTEGER,
  store_name TEXT,
  city TEXT,
  store_type TEXT,
  opening_date TEXT
);
\copy temp_stores FROM 'C:/Users/Usuario/Downloads/db/bm_stores.csv' WITH (FORMAT csv, HEADER true)
INSERT INTO stores (store_id, store_name, city, store_type, opening_date)
SELECT 
  store_id, store_name, city, store_type,
  TO_DATE(opening_date, 'FMDAY, DD FMMONTH YYYY')::DATE
FROM temp_stores;
DROP TABLE temp_stores;

-- IMPORTAR SKUS
\copy skus FROM 'C:/Users/Usuario/Downloads/db/bm_skus.csv' WITH (FORMAT csv, HEADER true)

-- IMPORTAR CUSTOMERS  
\copy customers FROM 'C:/Users/Usuario/Downloads/db/bm_customers.csv' WITH (FORMAT csv, HEADER true)

-- IMPORTAR PROMOTIONS (orden correcto: promo_name,start_date,end_date,discount_pct,promo_type,promo_id)
CREATE TEMP TABLE temp_promo (
  promo_name TEXT,
  start_date DATE,
  end_date DATE,
  discount_pct NUMERIC(5,2),
  promo_type TEXT,
  promo_id INTEGER
);
\copy temp_promo FROM 'C:/Users/Usuario/Downloads/db/bm_promotions.csv' WITH (FORMAT csv, HEADER true)
INSERT INTO promotions (promo_id, promo_name, start_date, end_date, discount_pct, promo_type)
SELECT promo_id, promo_name, start_date, end_date, discount_pct, promo_type
FROM temp_promo;
DROP TABLE temp_promo;

-- IMPORTAR SALES (orden correcto: date,store_id,sku_id,customer_id,quantity,unit_price,total_value,channel,discount_pct)
CREATE TEMP TABLE temp_sales (
  sale_date DATE,
  store_id INTEGER,
  sku_id INTEGER,
  customer_id NUMERIC,
  quantity INTEGER,
  unit_price NUMERIC(12,2),
  total_value NUMERIC(14,2),
  channel TEXT,
  discount_pct NUMERIC(5,2)
);
\copy temp_sales FROM 'C:/Users/Usuario/Downloads/db/bm_sales.csv' WITH (FORMAT csv, HEADER true)
INSERT INTO sales (sale_date, store_id, sku_id, customer_id, quantity, unit_price, total_value, channel, discount_pct)
SELECT
  sale_date, store_id, sku_id,
  CASE WHEN customer_id IS NULL THEN NULL ELSE CAST(customer_id AS INTEGER) END,
  quantity, unit_price, total_value, channel, discount_pct
FROM temp_sales;
DROP TABLE temp_sales;

-- IMPORTAR INVENTORY (orden correcto: store_id,sku_id,stock_on_hand,reorder_point,safety_stock,last_restock_date,snapshot_date)
\copy inventory_snapshots (store_id, sku_id, stock_on_hand, reorder_point, safety_stock, last_restock_date, snapshot_date)
FROM 'C:/Users/Usuario/Downloads/db/bm_inventory.csv' WITH (FORMAT csv, HEADER true)

-- Verificar datos cargados
SELECT 'stores' as tabla, COUNT(*) as registros FROM stores
UNION ALL
SELECT 'skus', COUNT(*) FROM skus
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'promotions', COUNT(*) FROM promotions
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'inventory_snapshots', COUNT(*) FROM inventory_snapshots;
