<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getJson } from '../services/api'
import ChartPanel from '../components/ChartPanel.vue'

const loading = ref(false)
const error = ref('')
const result = ref(null)
const pagination = reactive({
  page: 1,
  pageSize: 50,
  totalRows: 0,
  totalPages: 0,
})
const options = ref({
  storeIds: [],
  skuIds: [],
  customerIds: [],
  channels: [],
  brands: [],
  categories: [],
  subcategories: [],
  promoNames: [],
  promoTypes: [],
})

const filters = reactive({
  dateFrom: '',
  dateTo: '',
  customerId: '',
  skuId: '',
  channel: '',
  customerStatus: '',
  brand: '',
  category: '',
  subcategory: '',
  promoName: '',
  promoType: '',
})

const defaultFilters = {
  dateFrom: '',
  dateTo: '',
  customerId: '',
  skuId: '',
  channel: '',
  customerStatus: '',
  brand: '',
  category: '',
  subcategory: '',
  promoName: '',
  promoType: '',
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    result.value = await getJson('/finanzas/summary', {
      ...filters,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })

    const pageInfo = result.value?.pagination || {}
    pagination.totalRows = Number(pageInfo.totalRows || 0)
    pagination.totalPages = Number(pageInfo.totalPages || 0)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  pagination.page = 1
  loadData()
}

async function loadOptions() {
  try {
    options.value = await getJson('/finanzas/options')
  } catch (err) {
    error.value = err.message
  }
}

function clearFilters() {
  Object.assign(filters, defaultFilters)
  pagination.page = 1
  pagination.totalRows = 0
  pagination.totalPages = 0
  result.value = null
  error.value = ''
}

function changePageSize(size) {
  pagination.pageSize = size === 100 ? 100 : 50
  pagination.page = 1
  if (result.value) {
    loadData()
  }
}

function goToPage(page) {
  const target = Number(page)
  if (target < 1 || target > pagination.totalPages || target === pagination.page) return
  pagination.page = target
  loadData()
}

onMounted(loadOptions)

const salesByDateChart = computed(() => {
  const items = result.value?.analytics?.dailySales || []
  const labels = items.map((item) => item.date).slice(-14)
  const valuesByDate = new Map(items.map((item) => [item.date, item.totalValue]))

  return {
    labels,
    datasets: [
      {
        label: 'Venta total',
        data: labels.map((label) => valuesByDate.get(label) || 0),
        borderColor: '#1d4ed8',
        backgroundColor: 'rgba(29, 78, 216, 0.18)',
        tension: 0.35,
        fill: true,
      },
    ],
  }
})

const salesByCategoryChart = computed(() => {
  const items = result.value?.analytics?.categorySales || []
  const labels = items.map((item) => item.name)

  return {
    labels,
    datasets: [
      {
        label: 'Venta por categoría',
        data: items.map((item) => item.sales),
        backgroundColor: ['#0f172a', '#1d4ed8', '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e'],
      },
    ],
  }
})

const salesRows = computed(() => result.value?.rows || [])
const pageStart = computed(() => {
  if (!result.value || pagination.totalRows === 0) return 0
  return (pagination.page - 1) * pagination.pageSize + 1
})
const pageEnd = computed(() => {
  if (!result.value || pagination.totalRows === 0) return 0
  return Math.min(pagination.page * pagination.pageSize, pagination.totalRows)
})

const summaryCards = computed(() => {
  if (!result.value) return []

  const topChannel = result.value.metrics.topChannel
  const topCategory = result.value.metrics.topCategory
  const topBrand = result.value.metrics.topBrand

  return [
    { label: 'Venta total', value: `$${result.value.metrics.salesAmount.toFixed(2)}`, note: 'Monto acumulado' },
    { label: 'Unidades', value: `${result.value.metrics.soldUnits}`, note: 'Piezas vendidas' },
    {
      label: 'Canal principal',
      value: topChannel?.name || 'Sin dato',
      note: `$${Number(topChannel?.sales || 0).toFixed(2)} en ventas`,
    },
    {
      label: 'Categoría líder',
      value: topCategory?.name || 'Sin dato',
      note: `$${Number(topCategory?.sales || 0).toFixed(2)} en ventas`,
    },
    {
      label: 'Marca líder',
      value: topBrand?.name || 'Sin dato',
      note: `$${Number(topBrand?.sales || 0).toFixed(2)} en ventas`,
    },
    { label: 'Ticket promedio', value: `$${result.value.metrics.avgTicket.toFixed(2)}`, note: 'Promedio por transacción' },
  ]
})
</script>

<template>
  <section>
    <h2>Finanzas</h2>

    <div class="filters-grid">
      <input v-model="filters.dateFrom" type="date" placeholder="Desde" />
      <input v-model="filters.dateTo" type="date" placeholder="Hasta" />
      <input v-model="filters.customerId" type="text" list="finanzas-customer-ids" placeholder="Cliente" />
      <input v-model="filters.skuId" type="text" list="finanzas-sku-ids" placeholder="SKU" />
      <input v-model="filters.channel" type="text" list="finanzas-channels" placeholder="Canal" />
      <select v-model="filters.customerStatus">
        <option value="">Registro</option>
        <option value="registered">Registrado</option>
        <option value="unregistered">No registrado</option>
      </select>
      <input v-model="filters.brand" type="text" list="finanzas-brands" placeholder="Marca" />
      <input v-model="filters.category" type="text" list="finanzas-categories" placeholder="Categoria" />
      <input v-model="filters.subcategory" type="text" list="finanzas-subcategories" placeholder="Subcategoria" />
      <input v-model="filters.promoName" type="text" list="finanzas-promo-names" placeholder="Promo nombre" />
      <input v-model="filters.promoType" type="text" list="finanzas-promo-types" placeholder="Promo tipo" />
      <button :disabled="loading" @click="applyFilters">Filtrar</button>
      <button type="button" class="secondary-button" :disabled="loading" @click="clearFilters">Limpiar</button>
    </div>

    <datalist id="finanzas-customer-ids">
      <option v-for="value in options.customerIds" :key="value" :value="value" />
    </datalist>
    <datalist id="finanzas-sku-ids">
      <option v-for="value in options.skuIds" :key="value" :value="value" />
    </datalist>
    <datalist id="finanzas-channels">
      <option v-for="value in options.channels" :key="value" :value="value" />
    </datalist>
    <datalist id="finanzas-brands">
      <option v-for="value in options.brands" :key="value" :value="value" />
    </datalist>
    <datalist id="finanzas-categories">
      <option v-for="value in options.categories" :key="value" :value="value" />
    </datalist>
    <datalist id="finanzas-subcategories">
      <option v-for="value in options.subcategories" :key="value" :value="value" />
    </datalist>
    <datalist id="finanzas-promo-names">
      <option v-for="value in options.promoNames" :key="value" :value="value" />
    </datalist>
    <datalist id="finanzas-promo-types">
      <option v-for="value in options.promoTypes" :key="value" :value="value" />
    </datalist>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="result" class="summary-grid">
      <article v-for="card in summaryCards" :key="card.label" class="summary-card">
        <span class="summary-label">{{ card.label }}</span>
        <div class="summary-value">{{ card.value }}</div>
        <div class="summary-note">{{ card.note }}</div>
      </article>
    </div>

    <div v-if="result" class="cards-grid">
      <article class="card">
        <h3>Venta total</h3>
        <p>{{ result.metrics.salesAmount.toFixed(2) }}</p>
      </article>
      <article class="card">
        <h3>Unidades</h3>
        <p>{{ result.metrics.soldUnits }}</p>
      </article>
      <article class="card">
        <h3>Ticket promedio</h3>
        <p>{{ result.metrics.avgTicket.toFixed(2) }}</p>
      </article>
      <article class="card">
        <h3>Registros</h3>
        <p>{{ result.metrics.rows }}</p>
      </article>
    </div>

    <h3 class="section-title">Gráficas</h3>
    <div v-if="result" class="charts-grid">
      <ChartPanel type="line" title="Ventas por fecha" :data="salesByDateChart" accent="#1d4ed8" />
      <ChartPanel type="bar" title="Ventas por categoría" :data="salesByCategoryChart" accent="#0f172a" />
    </div>

    <h3 class="section-title">Detalle</h3>
    <div v-if="result" class="table-wrap">
      <table class="detail-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tienda</th>
            <th>SKU</th>
            <th>Categoría</th>
            <th>Canal</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in salesRows" :key="row.id">
            <td>{{ String(row.sale_date).slice(0, 10) }}</td>
            <td>{{ row.store?.store_name || `Tienda ${row.store_id}` }}</td>
            <td>{{ row.sku?.sku_name || row.sku_id }}</td>
            <td>{{ row.sku?.category || '-' }}</td>
            <td>{{ row.channel }}</td>
            <td>{{ Number(row.total_value).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination-bar">
        <div class="pagination-info">Mostrando {{ pageStart }}-{{ pageEnd }} de {{ pagination.totalRows }} registros</div>
        <div class="pagination-controls">
          <label>
            Filas
            <select :value="pagination.pageSize" @change="changePageSize(Number($event.target.value))">
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </label>
          <button type="button" class="secondary-button" :disabled="loading || pagination.page <= 1" @click="goToPage(pagination.page - 1)">
            Anterior
          </button>
          <span class="pagination-page">Página {{ pagination.page }} de {{ Math.max(pagination.totalPages, 1) }}</span>
          <button
            type="button"
            class="secondary-button"
            :disabled="loading || pagination.page >= pagination.totalPages"
            @click="goToPage(pagination.page + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
