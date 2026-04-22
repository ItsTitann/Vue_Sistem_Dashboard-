-- Limpiar datos previos si existen
TRUNCATE TABLE inventory_snapshots CASCADE;
TRUNCATE TABLE sales CASCADE;
TRUNCATE TABLE promotions CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE skus CASCADE;
TRUNCATE TABLE stores CASCADE;

-- Importar datos sin especificar orden (PostgreSQL respeta orden del CSV)
\copy stores FROM 'C:/Users/Usuario/Downloads/db/bm_stores.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF-8')
\copy skus FROM 'C:/Users/Usuario/Downloads/db/bm_skus.csv' WITH (FORMAT csv, HEADER true)
\copy customers FROM 'C:/Users/Usuario/Downloads/db/bm_customers.csv' WITH (FORMAT csv, HEADER true)
\copy promotions FROM 'C:/Users/Usuario/Downloads/db/bm_promotions.csv' WITH (FORMAT csv, HEADER true)
\copy sales FROM 'C:/Users/Usuario/Downloads/db/bm_sales.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF-8')
\copy inventory_snapshots FROM 'C:/Users/Usuario/Downloads/db/bm_inventory.csv' WITH (FORMAT csv, HEADER true)
