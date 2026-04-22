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
  snapshotDates: [],
})

const filters = reactive({
  storeId: '',
  skuId: '',
  snapshotDate: '',
})

const defaultFilters = {
  storeId: '',
  skuId: '',
  snapshotDate: '',
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    result.value = await getJson('/inventario/summary', {
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
    options.value = await getJson('/inventario/options')
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

const stockByStoreChart = computed(() => {
  const items = result.value?.metrics?.storeDistribution || []
  const topItems = items.slice(0, 10)

  return {
    labels: topItems.map((item) => item.name),
    datasets: [
      {
        label: 'Stock disponible',
        data: topItems.map((item) => item.stock),
        backgroundColor: '#f59e0b',
      },
    ],
  }
})

const stockHealthChart = computed(() => {
  const items = result.value?.metrics?.healthDistribution || []

  return {
    labels: items.map((item) => item.label),
    datasets: [
      {
        data: items.map((item) => item.value),
        backgroundColor: ['#ef4444', '#22c55e'],
      },
    ],
  }
})

const inventoryRows = computed(() => result.value?.rows || [])
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
  const topStore = result.value.metrics.topStore

  return [
    { label: 'Stock total', value: `${result.value.metrics.stockOnHand}`, note: 'Disponibilidad acumulada' },
    { label: 'Bajo stock', value: `${result.value.metrics.lowStockItems}`, note: 'Items en riesgo' },
    { label: 'Tienda líder', value: topStore?.name || 'Sin dato', note: `${Number(topStore?.stock || 0)} de stock` },
    { label: 'Snapshots', value: `${result.value.metrics.rows}`, note: 'Registros consultados' },
  ]
})
</script>

<template>
  <section>
    <h2>Inventario</h2>

    <div class="filters-grid">
      <input v-model="filters.storeId" type="text" list="inventario-store-ids" placeholder="Tienda" />
      <input v-model="filters.skuId" type="text" list="inventario-sku-ids" placeholder="SKU" />
      <input v-model="filters.snapshotDate" type="text" list="inventario-snapshot-dates" placeholder="Fecha" />
      <button :disabled="loading" @click="applyFilters">Filtrar</button>
      <button type="button" class="secondary-button" :disabled="loading" @click="clearFilters">Limpiar</button>
    </div>

    <datalist id="inventario-store-ids">
      <option v-for="value in options.storeIds" :key="value" :value="value" />
    </datalist>
    <datalist id="inventario-sku-ids">
      <option v-for="value in options.skuIds" :key="value" :value="value" />
    </datalist>
    <datalist id="inventario-snapshot-dates">
      <option v-for="value in options.snapshotDates" :key="value" :value="value" />
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
        <h3>Stock disponible</h3>
        <p>{{ result.metrics.stockOnHand }}</p>
      </article>
      <article class="card">
        <h3>Stock seguridad</h3>
        <p>{{ result.metrics.safetyStock }}</p>
      </article>
      <article class="card">
        <h3>Reorder point</h3>
        <p>{{ result.metrics.reorderPoint }}</p>
      </article>
      <article class="card">
        <h3>Bajo stock</h3>
        <p>{{ result.metrics.lowStockItems }}</p>
      </article>
    </div>

    <h3 class="section-title">Gráficas</h3>
    <div v-if="result" class="charts-grid">
      <ChartPanel type="bar" title="Stock por tienda" :data="stockByStoreChart" accent="#f59e0b" />
      <ChartPanel type="doughnut" title="Estado del inventario" :data="stockHealthChart" accent="#0f172a" />
    </div>

    <h3 class="section-title">Detalle</h3>
    <div v-if="result" class="table-wrap">
      <table class="detail-table">
        <thead>
          <tr>
            <th>Tienda</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Reorder</th>
            <th>Seguridad</th>
            <th>Última reposición</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in inventoryRows" :key="row.id">
            <td>{{ row.store?.store_name || `Tienda ${row.store_id}` }}</td>
            <td>{{ row.sku?.sku_name || row.sku_id }}</td>
            <td>{{ row.stock_on_hand }}</td>
            <td>{{ row.reorder_point }}</td>
            <td>{{ row.safety_stock }}</td>
            <td>{{ String(row.last_restock_date).slice(0, 10) }}</td>
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
