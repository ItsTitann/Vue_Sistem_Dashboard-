import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

function asInt(value) {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

function asDate(value) {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function asPageSize(value) {
  const parsed = asInt(value)
  return parsed === 100 ? 100 : 50
}

router.get('/options', async (_req, res) => {
  try {
    const [storeRows, skuRows, snapshotRows] = await Promise.all([
      prisma.store.findMany({ select: { store_id: true }, orderBy: { store_id: 'asc' } }),
      prisma.sku.findMany({ select: { sku_id: true }, orderBy: { sku_id: 'asc' } }),
      prisma.inventorySnapshot.findMany({
        distinct: ['snapshot_date'],
        select: { snapshot_date: true },
        orderBy: { snapshot_date: 'desc' },
      }),
    ])

    res.json({
      storeIds: storeRows.map((row) => row.store_id),
      skuIds: skuRows.map((row) => row.sku_id),
      snapshotDates: snapshotRows.map((row) => row.snapshot_date.toISOString().slice(0, 10)),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error loading inventario options' })
  }
})

router.get('/summary', async (req, res) => {
  try {
    const where = {}
    const page = Math.max(asInt(req.query.page) || 1, 1)
    const pageSize = asPageSize(req.query.pageSize)
    const skip = (page - 1) * pageSize

    const storeId = asInt(req.query.storeId)
    const skuId = asInt(req.query.skuId)
    if (storeId) where.store_id = storeId
    if (skuId) where.sku_id = skuId

    const snapshotDate = asDate(req.query.snapshotDate)
    if (snapshotDate) {
      where.snapshot_date = {
        gte: new Date(snapshotDate.toISOString().slice(0, 10)),
        lte: new Date(`${snapshotDate.toISOString().slice(0, 10)}T23:59:59.999Z`),
      }
    }

    const rows = await prisma.inventorySnapshot.findMany({
      where,
      include: {
        store: { select: { store_name: true, city: true, store_type: true } },
        sku: { select: { sku_name: true, category: true, subcategory: true, brand: true } },
      },
      orderBy: { snapshot_date: 'desc' },
    })

    const pagedRows = rows.slice(skip, skip + pageSize)

    const storeTotals = new Map()

    const metrics = rows.reduce(
      (acc, row) => {
        acc.stockOnHand += row.stock_on_hand
        acc.safetyStock += row.safety_stock
        acc.reorderPoint += row.reorder_point
        if (row.stock_on_hand <= row.reorder_point) acc.lowStockItems += 1

        const storeName = row.store?.store_name || `Tienda ${row.store_id}`
        storeTotals.set(storeName, (storeTotals.get(storeName) || 0) + Number(row.stock_on_hand || 0))

        return acc
      },
      { stockOnHand: 0, safetyStock: 0, reorderPoint: 0, lowStockItems: 0 },
    )

    const storeDistribution = [...storeTotals.entries()]
      .map(([name, stock]) => ({ name, stock }))
      .sort((a, b) => b.stock - a.stock)

    const topStore = storeDistribution[0] || { name: 'Sin dato', stock: 0 }
    const healthDistribution = [
      { label: 'Bajo stock', value: metrics.lowStockItems },
      { label: 'Saludable', value: Math.max(rows.length - metrics.lowStockItems, 0) },
    ]

    res.json({
      metrics: {
        ...metrics,
        rows: rows.length,
        topStore,
        storeDistribution,
        healthDistribution,
      },
      pagination: {
        page,
        pageSize,
        totalRows: rows.length,
        totalPages: rows.length > 0 ? Math.ceil(rows.length / pageSize) : 0,
      },
      rows: pagedRows,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error building inventario summary' })
  }
})

export default router
