# Business Dashboard (Finanzas, Inventario, Clientes)

Proyecto academico de analitica ejecutiva con 3 dashboards conectados a datos reales en PostgreSQL.

## 1. Que hace este proyecto

Este sistema permite:

1. Filtrar informacion por distintos criterios de negocio.
2. Visualizar KPIs y graficas para toma de decisiones.
3. Consultar detalle tabular paginado (50 o 100 filas por pagina).
4. Explorar distribucion geografica de clientes en un mapa real con Leaflet.

Dashboards incluidos:

1. Finanzas
2. Inventario
3. Clientes

## 2. Stack tecnologico

Frontend:

1. Vue 3
2. Vue Router
3. Chart.js + vue-chartjs
4. Leaflet (mapa en Clientes)

Backend:

1. Node.js + Express
2. Prisma ORM

Base de datos:

1. PostgreSQL
2. Gestion opcional con pgAdmin o DBeaver

## 3. Arquitectura de alto nivel

Flujo de datos:

1. Usuario aplica filtros en la UI.
2. Frontend llama endpoint summary con query params (incluye page y pageSize).
3. Backend construye where dinamico con Prisma.
4. Backend retorna:
	1. metrics (agregados globales)
	2. analytics (series para graficas)
	3. pagination (metadatos de pagina)
	4. rows (solo la pagina solicitada)
5. Frontend renderiza KPIs, graficas y tabla.

Beneficio clave:

1. Los KPIs se calculan en backend sobre el universo filtrado.
2. La tabla muestra solo pagina actual para rendimiento y usabilidad.

## 4. Estructura del proyecto

1. src/: aplicacion Vue (vistas, componentes y servicios)
2. backend/: API, Prisma y rutas de negocio
3. backend/sql/: scripts de schema, indices e importacion

Archivos importantes:

1. backend/src/routes/finanzas.js
2. backend/src/routes/inventario.js
3. backend/src/routes/clientes.js
4. src/views/FinanzasView.vue
5. src/views/InventarioView.vue
6. src/views/ClientesView.vue
7. src/components/CityLeaderMap.vue
8. src/services/api.js

## 5. Modelo de datos (resumen)

Tablas principales:

1. stores
2. skus
3. customers
4. promotions
5. sales
6. inventory_snapshots

Relaciones clave:

1. sales se relaciona con stores, skus y customers.
2. inventory_snapshots se relaciona con stores y skus.

## 6. Configuracion e instalacion

Requisitos:

1. Node.js 20+
2. PostgreSQL 14+

### 6.1 Crear DB

Crear base dashboard_db y ejecutar scripts en orden:

1. backend/sql/01_schema.sql
2. backend/sql/02_indexes.sql

### 6.2 Importar CSV

Archivos de entrada:

1. bm_stores.csv
2. bm_skus.csv
3. bm_customers.csv
4. bm_inventory.csv
5. bm_promotions.csv
6. bm_sales.csv

Puedes usar:

1. pgAdmin o DBeaver
2. scripts SQL de backend/sql para carga asistida

### 6.2.1 Estructura de datos cargados (CSV → Tablas)

#### Resumen de registros por tabla

| Tabla | Archivo CSV | Registros |
|-------|------------|-----------|
| **stores** | bm_stores.csv | 50 |
| **skus** | bm_skus.csv | 200 |
| **customers** | bm_customers.csv | 5,000 |
| **promotions** | bm_promotions.csv | 33 |
| **sales** | bm_sales.csv | **641,843** |
| **inventory_snapshots** | bm_inventory.csv | 8,735 |

#### Análisis de Ventas

Indicadores principales consolidados:

| Métrica | Valor |
|--------|-------|
| **Total de Ventas** | $73,214,931.30 |
| **Órdenes Totales** | 641,843 |
| **Unidades Vendidas** | 1,677,213 |
| **Ticket Promedio** | $114.07 |
| **Descuento Promedio** | 5.41% |

Estos datos abarcan todo el período de transacciones registradas en `bm_sales.csv` y sirven como base para los KPIs del dashboard de Finanzas.

#### Tabla: stores

Archivo CSV: `bm_stores.csv`

Campos importados:

1. store_id (INTEGER) - Identificador único
2. store_name (TEXT) - Nombre de la tienda
3. city (TEXT) - Ciudad donde se ubica
4. store_type (TEXT) - Tipo de tienda
5. opening_date (DATE) - Fecha de apertura

Propósito: Datos maestros de sucursales/tiendas del negocio.

#### Tabla: skus

Archivo CSV: `bm_skus.csv`

Campos importados:

1. sku_id (INTEGER) - Identificador único del producto
2. sku_name (TEXT) - Nombre del producto
3. category (TEXT) - Categoría principal
4. subcategory (TEXT) - Subcategoría
5. unit_price (NUMERIC) - Precio unitario
6. cost_price (NUMERIC) - Costo unitario
7. brand (TEXT) - Marca

Propósito: Catálogo de productos/SKUs con precios y clasificación.

#### Tabla: customers

Archivo CSV: `bm_customers.csv`

Campos importados:

1. cust_id (INTEGER) - Identificador único
2. age (INTEGER) - Edad del cliente
3. gender (TEXT) - Género
4. city (TEXT) - Ciudad
5. loyalty_segment (TEXT) - Segmento de fidelización
6. preferred_channel (TEXT) - Canal de compra preferido
7. registration_date (DATE) - Fecha de registro

Propósito: Base de clientes con datos demográficos y comportamiento.

#### Tabla: promotions

Archivo CSV: `bm_promotions.csv`

Campos importados:

1. promo_id (INTEGER) - Identificador único de promoción
2. promo_name (TEXT) - Nombre de la promoción
3. start_date (DATE) - Fecha de inicio
4. end_date (DATE) - Fecha de fin
5. discount_pct (NUMERIC) - Porcentaje de descuento
6. promo_type (TEXT) - Tipo de promoción

Propósito: Catálogo de promociones vigentes y pasadas.

#### Tabla: sales

Archivo CSV: `bm_sales.csv`

Campos importados:

1. sale_date (DATE) - Fecha de la transacción
2. store_id (INTEGER) - Referencia a tienda
3. sku_id (INTEGER) - Referencia a producto
4. customer_id (INTEGER) - Referencia a cliente (nullable)
5. quantity (INTEGER) - Cantidad vendida
6. unit_price (NUMERIC) - Precio unitario en venta
7. total_value (NUMERIC) - Valor total de la venta
8. channel (TEXT) - Canal de venta (online/presencial)
9. discount_pct (NUMERIC) - Descuento aplicado

Propósito: Transacciones de ventas. **Tabla más voluminosa del sistema**, genera la mayoría de registros.

#### Tabla: inventory_snapshots

Archivo CSV: `bm_inventory.csv`

Campos importados:

1. store_id (INTEGER) - Referencia a tienda
2. sku_id (INTEGER) - Referencia a producto
3. stock_on_hand (INTEGER) - Stock disponible
4. reorder_point (INTEGER) - Punto de reorden
5. safety_stock (INTEGER) - Stock de seguridad
6. last_restock_date (DATE) - Última fecha de restock
7. snapshot_date (DATE) - Fecha del snapshot

Propósito: Snapshots de inventario por tienda/producto. Permite análisis histórico de disponibilidad.

**Nota**: Ejecuta el script `backend/sql/05_import_final.sql` al final de la carga para verificar los registros cargados en cada tabla mediante consulta SQL.

### 6.3 Backend

```sh
cd backend
npm install
copy .env.example .env
```

Configurar DATABASE_URL en backend/.env.

```sh
npm run prisma:generate
npm run dev
```

Health check:

1. GET http://localhost:4000/health

### 6.4 Frontend

En la raiz:

```sh
npm install
npm run dev
```

URL API por defecto:

1. http://localhost:4000/api

Opcional en .env raiz:

```env
VITE_API_URL=http://localhost:4000/api
```

## 7. Endpoints y parametros

Endpoints:

1. GET /api/finanzas/summary
2. GET /api/inventario/summary
3. GET /api/clientes/summary
4. GET /api/finanzas/options
5. GET /api/inventario/options
6. GET /api/clientes/options

Paginacion en los 3 summary:

1. page: numero de pagina (>=1)
2. pageSize: 50 o 100

Ejemplo:

1. /api/clientes/summary?page=2&pageSize=100

Respuesta summary (estructura conceptual):

```json
{
  "metrics": {},
  "analytics": {},
  "pagination": {
	 "page": 1,
	 "pageSize": 50,
	 "totalRows": 5000,
	 "totalPages": 100
  },
  "rows": []
}
```

## 8. Como explicar cada dashboard en clase

### 8.1 Finanzas

Objetivo:

1. Medir ventas y rendimiento comercial.

KPIs principales:

1. Venta total
2. Unidades vendidas
3. Ticket promedio
4. Canal principal
5. Categoria lider
6. Marca lider

Graficas:

1. Ventas por fecha
2. Ventas por categoria

Mensaje de valor:

1. Permite identificar donde se vende mas y por que canal.

### 8.2 Inventario

Objetivo:

1. Controlar disponibilidad y riesgo de quiebre.

KPIs principales:

1. Stock total
2. Safety stock
3. Reorder point
4. Items en bajo stock
5. Tienda lider por stock

Graficas:

1. Stock por tienda
2. Estado del inventario (bajo stock vs saludable)

Mensaje de valor:

1. Ayuda a priorizar reposicion y balancear inventario.

### 8.3 Clientes

Objetivo:

1. Entender perfil y distribucion de clientes.

KPIs principales:

1. Clientes filtrados
2. Ciudad lider
3. Segmento de lealtad lider
4. Canal preferido

Visualizaciones:

1. Distribucion por ciudad
2. Segmentacion de lealtad
3. Mapa Leaflet con ciudades, tooltip y click para filtrar

Mensaje de valor:

1. Permite orientar acciones comerciales por geografia y perfil.

## 9. Guion sugerido para exposicion (7 a 10 minutos)

1. Problema de negocio (1 min):
	1. La empresa necesita visibilidad de ventas, stock y clientes.
2. Arquitectura (1 min):
	1. Vue para UI, Express para API, PostgreSQL para datos.
3. Flujo tecnico (1 min):
	1. Filtro -> API -> Prisma -> DB -> metrics/analytics/pagination -> UI.
4. Demo Finanzas (2 min):
	1. Aplicar filtro y explicar cambios en KPIs + grafica.
5. Demo Inventario (2 min):
	1. Mostrar estado de stock y tabla paginada.
6. Demo Clientes (2 min):
	1. Mostrar mapa, tooltip y click en ciudad para filtrar.
7. Cierre (1 min):
	1. Beneficios, mejoras futuras y conclusiones.

## 10. Validaciones tecnicas para demostrar en vivo

Comprobar API activa:

```sh
curl http://localhost:4000/health
```

Comprobar paginacion en endpoints:

```powershell
$f = Invoke-RestMethod -Uri "http://localhost:4000/api/finanzas/summary?page=2&pageSize=100"
$i = Invoke-RestMethod -Uri "http://localhost:4000/api/inventario/summary?page=2&pageSize=100"
$c = Invoke-RestMethod -Uri "http://localhost:4000/api/clientes/summary?page=2&pageSize=100"

"FIN rows=" + $f.rows.Count + " total=" + $f.pagination.totalRows + " pages=" + $f.pagination.totalPages
"INV rows=" + $i.rows.Count + " total=" + $i.pagination.totalRows + " pages=" + $i.pagination.totalPages
"CLI rows=" + $c.rows.Count + " total=" + $c.pagination.totalRows + " pages=" + $c.pagination.totalPages
```

## 11. Preguntas que te pueden hacer y como responder

1. Por que usar tabla en un dashboard?
	1. Porque el dashboard resume (KPI/grafica) y la tabla permite auditoria de detalle.

2. Como aseguran que los KPIs sean correctos?
	1. Se calculan en backend con agregaciones Prisma sobre datos filtrados completos.

3. Por que paginar?
	1. Para rendimiento, usabilidad y evitar saturar pantalla con miles de filas.

4. El mapa de clientes es decorativo o funcional?
	1. Es funcional: muestra distribucion, tooltip informativo y click para filtrar.

5. Como escalarian esta solucion?
	1. Cache de consultas, indices adicionales, seguridad por roles y despliegue cloud.

## 12. Limites actuales y mejoras futuras

Limites:

1. El filtro por promocion se aproxima por fecha y discount_pct.
2. No hay autenticacion/autorizacion multiusuario.

Mejoras futuras:

1. Exportar reportes CSV/PDF.
2. Agregar alertas automaticas de bajo stock.
3. Incorporar pronostico de demanda.
4. Agregar observabilidad y tests automatizados.

## 13. Nota sobre promociones

bm_sales.csv no trae promo_id. Por eso el filtro de promociones se aproxima con:

1. Rango de fechas de la promocion.
2. discount_pct.

Para precision total se recomienda:

1. Agregar promo_id en sales.
2. O crear tabla puente sales_promotions.
