<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getJson } from '../services/api'
import ChartPanel from '../components/ChartPanel.vue'
import CityLeaderMap from '../components/CityLeaderMap.vue'

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
  genders: [],
  loyaltySegments: [],
  cities: [],
  preferredChannels: [],
})

const filters = reactive({
  gender: '',
  loyaltySegment: '',
  city: '',
  preferredChannel: '',
  registrationFrom: '',
  registrationTo: '',
})

const defaultFilters = {
  gender: '',
  loyaltySegment: '',
  city: '',
  preferredChannel: '',
  registrationFrom: '',
  registrationTo: '',
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    result.value = await getJson('/clientes/summary', {
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
    options.value = await getJson('/clientes/options')
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

function applyCityFilter(city) {
  filters.city = city
  pagination.page = 1
  loadData()
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

const cityChart = computed(() => {
  const cities = result.value?.metrics?.cityDistribution || []
  return {
    labels: cities.map((item) => item.city),
    datasets: [
      {
        data: cities.map((item) => item.customers),
        backgroundColor: ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#22c55e'],
      },
    ],
  }
})

const loyaltyChart = computed(() => {
  const items = result.value?.metrics?.loyaltyDistribution || []

  return {
    labels: items.map((item) => item.loyaltySegment),
    datasets: [
      {
        label: 'Clientes',
        data: items.map((item) => item.customers),
        backgroundColor: ['#0f172a', '#1d4ed8', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444'],
      },
    ],
  }
})

const customerRows = computed(() => result.value?.rows || [])
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

  const cityDistribution = result.value.metrics.cityDistribution || []
  const topCity = cityDistribution[0]
  const loyaltyDistribution = result.value.metrics.loyaltyDistribution || []
  const topLoyalty = loyaltyDistribution[0]

  return [
    { label: 'Clientes filtrados', value: `${result.value.metrics.rows}`, note: 'Total del resultado' },
    { label: 'Ciudad líder', value: topCity?.city || 'Sin dato', note: `${topCity?.pct?.toFixed?.(1) || '0.0'}% del total` },
    { label: 'Segmento líder', value: topLoyalty?.loyaltySegment || 'Sin dato', note: `${topLoyalty?.customers || 0} clientes` },
    { label: 'Canal preferido', value: customerRows.value[0]?.preferred_channel || 'Sin dato', note: 'Primer registro filtrado' },
  ]
})
</script>

<template>
  <section>
    <h2>Clientes</h2>

    <div class="filters-grid">
      <input v-model="filters.gender" type="text" list="clientes-genders" placeholder="Genero" />
      <input
        v-model="filters.loyaltySegment"
        type="text"
        list="clientes-loyalty-segments"
        placeholder="Lealtad"
      />
      <input v-model="filters.city" type="text" list="clientes-cities" placeholder="Ciudad" />
      <input
        v-model="filters.preferredChannel"
        type="text"
        list="clientes-preferred-channels"
        placeholder="Canal preferencia"
      />
      <input v-model="filters.registrationFrom" type="date" />
      <input v-model="filters.registrationTo" type="date" />
      <button :disabled="loading" @click="applyFilters">Filtrar</button>
      <button type="button" class="secondary-button" :disabled="loading" @click="clearFilters">Limpiar</button>
    </div>

    <datalist id="clientes-genders">
      <option v-for="value in options.genders" :key="value" :value="value" />
    </datalist>
    <datalist id="clientes-loyalty-segments">
      <option v-for="value in options.loyaltySegments" :key="value" :value="value" />
    </datalist>
    <datalist id="clientes-cities">
      <option v-for="value in options.cities" :key="value" :value="value" />
    </datalist>
    <datalist id="clientes-preferred-channels">
      <option v-for="value in options.preferredChannels" :key="value" :value="value" />
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
        <h3>Clientes filtrados</h3>
        <p>{{ result.metrics.rows }}</p>
      </article>
      <article class="card city-card">
        <h3>Distribucion por ciudad (%)</h3>
        <ul>
          <li v-for="city in result.metrics.cityDistribution" :key="city.city">
            {{ city.city }}: {{ city.pct.toFixed(2) }}%
          </li>
        </ul>
      </article>
    </div>

    <h3 class="section-title">Gráficas</h3>
    <div v-if="result" class="map-grid">
      <CityLeaderMap :city-distribution="result.metrics.cityDistribution" @select-city="applyCityFilter" />
    </div>

    <div v-if="result" class="charts-grid">
      <ChartPanel type="doughnut" title="Distribución por ciudad" :data="cityChart" accent="#1d4ed8" />
      <ChartPanel type="bar" title="Clientes por segmento de lealtad" :data="loyaltyChart" accent="#0f172a" />
    </div>

    <h3 class="section-title">Detalle</h3>
    <div v-if="result" class="table-wrap">
      <table class="detail-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ciudad</th>
            <th>Genero</th>
            <th>Lealtad</th>
            <th>Canal</th>
            <th>Registro</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in customerRows" :key="row.cust_id">
            <td>{{ row.cust_id }}</td>
            <td>{{ row.city }}</td>
            <td>{{ row.gender }}</td>
            <td>{{ row.loyalty_segment }}</td>
            <td>{{ row.preferred_channel }}</td>
            <td>{{ String(row.registration_date).slice(0, 10) }}</td>
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

<style scoped>
.map-grid {
  margin-bottom: 0.9rem;
}
</style>
