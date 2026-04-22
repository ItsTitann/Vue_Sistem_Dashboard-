-- Update paths to your local machine before execution.
-- Example base path: C:/Users/Usuario/Downloads/db

\copy stores(store_id,store_name,city,store_type,opening_date) FROM 'C:/Users/Usuario/Downloads/db/bm_stores.csv' WITH (FORMAT csv, HEADER true)
\copy skus(sku_id,sku_name,category,subcategory,unit_price,cost_price,brand) FROM 'C:/Users/Usuario/Downloads/db/bm_skus.csv' WITH (FORMAT csv, HEADER true)
\copy customers(cust_id,age,gender,city,loyalty_segment,preferred_channel,registration_date) FROM 'C:/Users/Usuario/Downloads/db/bm_customers.csv' WITH (FORMAT csv, HEADER true)
\copy promotions(promo_name,start_date,end_date,discount_pct,promo_type,promo_id) FROM 'C:/Users/Usuario/Downloads/db/bm_promotions.csv' WITH (FORMAT csv, HEADER true)
\copy sales(sale_date,store_id,sku_id,customer_id,quantity,unit_price,total_value,channel,discount_pct) FROM 'C:/Users/Usuario/Downloads/db/bm_sales.csv' WITH (FORMAT csv, HEADER true)
\copy inventory_snapshots(store_id,sku_id,stock_on_hand,reorder_point,safety_stock,last_restock_date,snapshot_date) FROM 'C:/Users/Usuario/Downloads/db/bm_inventory.csv' WITH (FORMAT csv, HEADER true)
