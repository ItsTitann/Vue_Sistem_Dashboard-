<script setup>
import { computed } from 'vue'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
)

const props = defineProps({
  type: {
    type: String,
    default: 'bar',
  },
  data: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  height: {
    type: Number,
    default: 320,
  },
  accent: {
    type: String,
    default: '#0f172a',
  },
})

const chartComponent = computed(() => {
  const map = {
    bar: Bar,
    line: Line,
    doughnut: Doughnut,
    pie: Doughnut,
  }

  return map[props.type] || Bar
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1100,
    easing: 'easeOutQuart',
  },
  transitions: {
    active: {
      animation: {
        duration: 700,
        easing: 'easeOutQuart',
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
    },
    title: {
      display: Boolean(props.title),
      text: props.title,
      color: props.accent,
      font: {
        size: 16,
        weight: '600',
      },
    },
  },
}))
</script>

<template>
  <article class="chart-card">
    <component :is="chartComponent" :data="data" :options="chartOptions" :height="height" />
  </article>
</template>
