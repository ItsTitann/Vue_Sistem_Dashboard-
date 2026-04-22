<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  cityDistribution: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Mapa de concentración por ciudad',
  },
})

const emit = defineEmits(['select-city'])

const mapContainer = ref(null)
let mapInstance = null
let markerLayer = null

const cityCoords = {
  Sharjah: [25.3463, 55.4209],
  Dubai: [25.2048, 55.2708],
  'Abu Dhabi': [24.4539, 54.3773],
  Ajman: [25.4052, 55.5136],
  'Al Ain': [24.1302, 55.8023],
  'Ras Al Khaimah': [25.8007, 55.9762],
  Fujairah: [25.1288, 56.3265],
  'Umm Al Quwain': [25.5647, 55.5533],
}

const normalizedCities = computed(() => {
  const maxCustomers = Math.max(...props.cityDistribution.map((item) => item.customers), 1)

  return props.cityDistribution
    .map((item) => {
      const coords = cityCoords[item.city]
      if (!coords) return null

      return {
        ...item,
        coords,
        radius: 8 + (item.customers / maxCustomers) * 16,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.customers - a.customers)
})

const leader = computed(() => normalizedCities.value[0] || null)

function buildTooltip(point) {
  return `
    <div class="leaflet-city-tooltip">
      <strong>${point.city}</strong><br />
      ${point.customers} clientes<br />
      ${point.pct.toFixed(1)}% del total
    </div>
  `
}

function clearMarkers() {
  if (markerLayer) {
    markerLayer.clearLayers()
  }
}

function renderMarkers() {
  if (!mapInstance || !markerLayer) return

  clearMarkers()

  normalizedCities.value.forEach((point) => {
    const marker = L.circleMarker(point.coords, {
      radius: point.radius,
      color: point.city === leader.value?.city ? '#0f172a' : '#1d4ed8',
      weight: 2,
      fillColor: point.city === leader.value?.city ? '#1d4ed8' : '#38bdf8',
      fillOpacity: 0.45,
    })

    marker
      .bindTooltip(buildTooltip(point), {
        direction: 'top',
        sticky: true,
        opacity: 0.98,
        className: 'city-leaflet-tooltip',
      })
      .on('click', () => {
        emit('select-city', point.city)
      })

    markerLayer.addLayer(marker)
  })
}

async function initMap() {
  if (!mapContainer.value || mapInstance) return

  mapInstance = L.map(mapContainer.value, {
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: false,
  }).setView([25.05, 55.25], 7)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 6,
  }).addTo(mapInstance)

  markerLayer = L.layerGroup().addTo(mapInstance)

  await nextTick()
  renderMarkers()
}

watch(
  () => props.cityDistribution,
  () => {
    renderMarkers()
  },
  { deep: true },
)

onMounted(initMap)

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerLayer = null
  }
})
</script>

<template>
  <article class="city-map-card">
    <header class="map-head">
      <div>
        <h4>{{ title }}</h4>
        <p v-if="leader">Ciudad líder: <strong>{{ leader.city }}</strong> ({{ leader.pct.toFixed(1) }}%)</p>
      </div>
      <button v-if="leader" type="button" class="leader-chip" @click="emit('select-city', leader.city)">
        Filtrar {{ leader.city }}
      </button>
    </header>

    <div class="map-body">
      <div ref="mapContainer" class="leaflet-map" aria-label="Mapa de ciudades"></div>

      <ul class="map-legend">
        <li v-for="point in normalizedCities" :key="point.city" @click="emit('select-city', point.city)">
          <span class="legend-name">{{ point.city }}</span>
          <span class="legend-values">{{ point.customers }} clientes | {{ point.pct.toFixed(1) }}%</span>
        </li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.city-map-card {
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.07);
}

.map-head {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  align-items: flex-start;
  margin-bottom: 0.9rem;
}

.map-head h4 {
  margin: 0;
  color: #1d4ed8;
  font-size: 1.05rem;
}

.map-head p {
  margin: 0.3rem 0 0;
  color: #475569;
  font-size: 0.92rem;
}

.leader-chip {
  border: 1px solid #bfdbfe;
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
  color: #0f172a;
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.leader-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(29, 78, 216, 0.18);
}

.map-body {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(220px, 280px);
  gap: 0.8rem;
  align-items: stretch;
}

.leaflet-map {
  min-height: 360px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #dbe3ef;
}

.map-legend {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.45rem;
  align-content: start;
}

.map-legend li {
  display: grid;
  gap: 0.1rem;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background-color 0.18s ease, transform 0.18s ease;
}

.map-legend li:hover {
  background: #eff6ff;
  transform: translateY(-1px);
}

.legend-name {
  font-weight: 600;
  color: #0f172a;
}

.legend-values {
  font-size: 0.86rem;
  color: #475569;
}

:global(.city-leaflet-tooltip) {
  border: 1px solid #cbd5e1 !important;
  border-radius: 10px !important;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.16) !important;
  background: #ffffff !important;
  color: #0f172a !important;
  padding: 0.5rem 0.65rem !important;
}

:global(.leaflet-city-tooltip strong) {
  display: inline-block;
  margin-bottom: 0.15rem;
}

:global(.leaflet-container) {
  font-family: inherit;
}

@media (max-width: 900px) {
  .map-body {
    grid-template-columns: 1fr;
  }

  .leaflet-map {
    min-height: 300px;
  }

  .map-head {
    flex-direction: column;
  }
}
</style>
