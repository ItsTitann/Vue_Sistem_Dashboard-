import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

function asDate(value) {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function asInt(value) {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

function asPageSize(value) {
  const parsed = asInt(value)
  return parsed === 100 ? 100 : 50
}

router.get('/options', async (_req, res) => {
  try {
    const [genderRows, cityRows, loyaltyRows, preferredChannelRows] = await Promise.all([
      prisma.customer.findMany({
        distinct: ['gender'],
        select: { gender: true },
        orderBy: { gender: 'asc' },
      }),
      prisma.customer.findMany({
        distinct: ['city'],
        select: { city: true },
        orderBy: { city: 'asc' },
      }),
      prisma.customer.findMany({
        distinct: ['loyalty_segment'],
        select: { loyalty_segment: true },
        orderBy: { loyalty_segment: 'asc' },
      }),
      prisma.customer.findMany({
        distinct: ['preferred_channel'],
        select: { preferred_channel: true },
        orderBy: { preferred_channel: 'asc' },
      }),
    ])

    res.json({
      genders: genderRows.map((row) => row.gender),
      cities: cityRows.map((row) => row.city),
      loyaltySegments: loyaltyRows.map((row) => row.loyalty_segment),
      preferredChannels: preferredChannelRows.map((row) => row.preferred_channel),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error loading clientes options' })
  }
})

router.get('/summary', async (req, res) => {
  try {
    const where = {}
    const page = Math.max(asInt(req.query.page) || 1, 1)
    const pageSize = asPageSize(req.query.pageSize)
    const skip = (page - 1) * pageSize

    if (req.query.gender) where.gender = String(req.query.gender)
    if (req.query.city) where.city = String(req.query.city)
    if (req.query.loyaltySegment) where.loyalty_segment = String(req.query.loyaltySegment)
    if (req.query.preferredChannel) where.preferred_channel = String(req.query.preferredChannel)

    const regFrom = asDate(req.query.registrationFrom)
    const regTo = asDate(req.query.registrationTo)
    if (regFrom || regTo) {
      where.registration_date = {}
      if (regFrom) where.registration_date.gte = regFrom
      if (regTo) where.registration_date.lte = regTo
    }

    const [rows, cityGroup, loyaltyGroup, totalCount] = await Promise.all([
      prisma.customer.findMany({ where, orderBy: { registration_date: 'desc' }, skip, take: pageSize }),
      prisma.customer.groupBy({ by: ['city'], where, _count: { cust_id: true } }),
      prisma.customer.groupBy({ by: ['loyalty_segment'], where, _count: { cust_id: true } }),
      prisma.customer.count({ where }),
    ])

    const total = totalCount || 1
    const sortedCityGroup = [...cityGroup].sort((a, b) => b._count.cust_id - a._count.cust_id)
    const sortedLoyaltyGroup = [...loyaltyGroup].sort((a, b) => b._count.cust_id - a._count.cust_id)

    res.json({
      metrics: {
        rows: totalCount,
        totalCustomers: totalCount,
        cityDistribution: sortedCityGroup.map((item) => ({
          city: item.city,
          customers: item._count.cust_id,
          pct: (item._count.cust_id / total) * 100,
        })),
        loyaltyDistribution: sortedLoyaltyGroup.map((item) => ({
          loyaltySegment: item.loyalty_segment,
          customers: item._count.cust_id,
        })),
      },
      pagination: {
        page,
        pageSize,
        totalRows: totalCount,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      },
      rows,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error building clientes summary' })
  }
})

export default router
