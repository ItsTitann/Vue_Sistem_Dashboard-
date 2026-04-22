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
    const [storeRows, skuRows, customerRows, channelRows, promoRows] = await Promise.all([
      prisma.store.findMany({ select: { store_id: true }, orderBy: { store_id: 'asc' } }),
      prisma.sku.findMany({
        select: { sku_id: true, brand: true, category: true, subcategory: true },
        orderBy: { sku_id: 'asc' },
      }),
      prisma.customer.findMany({ select: { cust_id: true }, orderBy: { cust_id: 'asc' } }),
      prisma.sale.findMany({
        distinct: ['channel'],
        select: { channel: true },
        orderBy: { channel: 'asc' },
      }),
      prisma.promotion.findMany({
        select: { promo_name: true, promo_type: true },
        orderBy: { promo_name: 'asc' },
      }),
    ])

    const unique = (values) => [...new Set(values)]

    res.json({
      storeIds: storeRows.map((row) => row.store_id),
      skuIds: skuRows.map((row) => row.sku_id),
      customerIds: customerRows.map((row) => row.cust_id),
      channels: channelRows.map((row) => row.channel),
      brands: unique(skuRows.map((row) => row.brand)).sort(),
      categories: unique(skuRows.map((row) => row.category)).sort(),
      subcategories: unique(skuRows.map((row) => row.subcategory)).sort(),
      promoNames: unique(promoRows.map((row) => row.promo_name)).sort(),
      promoTypes: unique(promoRows.map((row) => row.promo_type)).sort(),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error loading finanzas options' })
  }
})

router.get('/summary', async (req, res) => {
  try {
    const where = {}
    const page = Math.max(asInt(req.query.page) || 1, 1)
    const pageSize = asPageSize(req.query.pageSize)
    const skip = (page - 1) * pageSize

    const dateFrom = asDate(req.query.dateFrom)
    const dateTo = asDate(req.query.dateTo)
    if (dateFrom || dateTo) {
      where.sale_date = {}
      if (dateFrom) where.sale_date.gte = dateFrom
      if (dateTo) where.sale_date.lte = dateTo
    }

    const storeId = asInt(req.query.storeId)
    const skuId = asInt(req.query.skuId)
    const customerId = asInt(req.query.customerId)
    if (storeId) where.store_id = storeId
    if (skuId) where.sku_id = skuId
    if (customerId) where.customer_id = customerId

    if (req.query.channel) where.channel = String(req.query.channel)

    if (req.query.customerStatus === 'registered') {
      where.customer_id = { not: null }
    }
    if (req.query.customerStatus === 'unregistered') {
      where.customer_id = null
    }

    const skuFilter = {}
    if (req.query.brand) skuFilter.brand = String(req.query.brand)
    if (req.query.category) skuFilter.category = String(req.query.category)
    if (req.query.subcategory) skuFilter.subcategory = String(req.query.subcategory)
    if (Object.keys(skuFilter).length > 0) where.sku = skuFilter

    if (req.query.promoName || req.query.promoType) {
      const promoWhere = {}
      if (req.query.promoName) promoWhere.promo_name = String(req.query.promoName)
      if (req.query.promoType) promoWhere.promo_type = String(req.query.promoType)

      const promos = await prisma.promotion.findMany({
        where: promoWhere,
        select: { start_date: true, end_date: true, discount_pct: true },
      })

      if (promos.length === 0) {
        return res.json({
          metrics: { salesAmount: 0, soldUnits: 0, avgTicket: 0, rows: 0 },
          pagination: { page, pageSize, totalRows: 0, totalPages: 0 },
          rows: [],
        })
      }

      where.OR = promos.map((promo) => ({
        sale_date: { gte: promo.start_date, lte: promo.end_date },
        discount_pct: promo.discount_pct,
      }))
    }

    const [aggregates, rows] = await Promise.all([
      prisma.sale.aggregate({
        where,
        _sum: { total_value: true, quantity: true },
        _count: { id: true },
      }),
      prisma.sale.findMany({
        where,
        include: {
          sku: { select: { sku_name: true, category: true, subcategory: true, brand: true } },
          store: { select: { store_name: true, city: true } },
          customer: { select: { gender: true, loyalty_segment: true, city: true } },
        },
        orderBy: { sale_date: 'desc' },
        skip,
        take: pageSize,
      }),
    ])

    const [dailyGroups, channelGroups, skuGroups] = await Promise.all([
      prisma.sale.groupBy({
        by: ['sale_date'],
        where,
        _sum: { total_value: true },
        orderBy: { sale_date: 'asc' },
      }),
      prisma.sale.groupBy({
        by: ['channel'],
        where,
        _sum: { total_value: true },
        orderBy: { _sum: { total_value: 'desc' } },
      }),
      prisma.sale.groupBy({
        by: ['sku_id'],
        where,
        _sum: { total_value: true },
        orderBy: { _sum: { total_value: 'desc' } },
      }),
    ])

    const skuIds = skuGroups.map((group) => group.sku_id)
    const skuInfo = skuIds.length
      ? await prisma.sku.findMany({
          where: { sku_id: { in: skuIds } },
          select: { sku_id: true, category: true, brand: true },
        })
      : []

    const skuMap = new Map(skuInfo.map((item) => [item.sku_id, item]))
    const categoryTotals = new Map()
    const brandTotals = new Map()

    skuGroups.forEach((group) => {
      const sku = skuMap.get(group.sku_id)
      const value = Number(group._sum.total_value || 0)
      const category = sku?.category || 'Sin categoría'
      const brand = sku?.brand || 'Sin marca'

      categoryTotals.set(category, (categoryTotals.get(category) || 0) + value)
      brandTotals.set(brand, (brandTotals.get(brand) || 0) + value)
    })

    const topCategory = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])[0]
    const topBrand = [...brandTotals.entries()].sort((a, b) => b[1] - a[1])[0]
    const sortedChannelGroups = [...channelGroups].sort(
      (a, b) => Number(b._sum.total_value || 0) - Number(a._sum.total_value || 0),
    )
    const topChannel = sortedChannelGroups[0]

    const salesAmount = Number(aggregates._sum.total_value || 0)
    const soldUnits = Number(aggregates._sum.quantity || 0)
    const rowCount = Number(aggregates._count.id || 0)

    res.json({
      metrics: {
        salesAmount,
        soldUnits,
        avgTicket: rowCount > 0 ? salesAmount / rowCount : 0,
        rows: rowCount,
        topCategory: topCategory
          ? { name: topCategory[0], sales: topCategory[1] }
          : { name: 'Sin dato', sales: 0 },
        topBrand: topBrand ? { name: topBrand[0], sales: topBrand[1] } : { name: 'Sin dato', sales: 0 },
        topChannel: topChannel
          ? { name: topChannel.channel || 'Sin canal', sales: Number(topChannel._sum.total_value || 0) }
          : { name: 'Sin dato', sales: 0 },
      },
      pagination: {
        page,
        pageSize,
        totalRows: rowCount,
        totalPages: rowCount > 0 ? Math.ceil(rowCount / pageSize) : 0,
      },
      analytics: {
        dailySales: dailyGroups.map((group) => ({
          date: group.sale_date.toISOString().slice(0, 10),
          totalValue: Number(group._sum.total_value || 0),
        })),
        categorySales: [...categoryTotals.entries()]
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 8),
        channelSales: sortedChannelGroups.map((group) => ({
          name: group.channel || 'Sin canal',
          sales: Number(group._sum.total_value || 0),
        })),
      },
      rows,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error building finanzas summary' })
  }
})

export default router
