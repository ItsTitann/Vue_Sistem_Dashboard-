<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const viewMeta = {
  finanzas: {
    label: 'Finanzas',
    kicker: 'Flujo y rendimiento',
    description: 'Ventas, canales y productos con una lectura ejecutiva.',
  },
  inventario: {
    label: 'Inventario',
    kicker: 'Stock y reposicion',
    description: 'Disponibilidad, riesgo y control operativo.',
  },
  clientes: {
    label: 'Clientes',
    kicker: 'Perfil y geografia',
    description: 'Segmentacion, ciudad lider y mapa interactivo.',
  },
}

const currentView = computed(() => viewMeta[route.name] || viewMeta.finanzas)
</script>

<template>
  <div class="app-shell" :data-view="route.name">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-orb">BD</div>
        <div>
          <p class="brand-kicker">Analitica Ejecutiva</p>
          <h1>Business Dashboard</h1>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/finanzas">Finanzas</RouterLink>
        <RouterLink to="/inventario">Inventario</RouterLink>
        <RouterLink to="/clientes">Clientes</RouterLink>
      </nav>

      <div class="sidebar-panel">
        <span class="panel-label">Vista activa</span>
        <strong>{{ currentView.label }}</strong>
        <p>{{ currentView.kicker }}</p>
        <small>{{ currentView.description }}</small>
      </div>
    </aside>

    <div class="main-column">
      <header class="page-head">
        <div>
          <p class="page-kicker">{{ currentView.kicker }}</p>
          <h2>{{ currentView.label }}</h2>
        </div>
        <div class="page-chip">Datos en vivo · PostgreSQL</div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
:root {
  --surface: rgba(9, 14, 28, 0.78);
  --surface-soft: rgba(14, 22, 40, 0.78);
  --surface-strong: rgba(5, 10, 20, 0.92);
  --ink: #eff6ff;
  --muted: #94a3b8;
  --line: rgba(148, 163, 184, 0.2);
  --brand: #22d3ee;
  --brand-ink: #67e8f9;
  --accent-violet: #a855f7;
  --accent-cyan: #22d3ee;
  --accent-lime: #4ade80;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--ink);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at 10% 8%, rgba(168, 85, 247, 0.22) 0%, transparent 26%),
    radial-gradient(circle at 84% 16%, rgba(34, 211, 238, 0.22) 0%, transparent 24%),
    radial-gradient(circle at 58% 96%, rgba(74, 222, 128, 0.08) 0%, transparent 26%),
    linear-gradient(180deg, #040712 0%, #07101f 45%, #050814 100%);
  color: var(--ink);
}

.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 1.25rem;
  background:
    linear-gradient(180deg, rgba(8, 12, 24, 0.88) 0%, rgba(10, 16, 32, 0.76) 100%),
    radial-gradient(circle at top, rgba(168, 85, 247, 0.15), transparent 42%);
  border-right: 1px solid rgba(148, 163, 184, 0.16);
  backdrop-filter: blur(18px);
  box-shadow: 18px 0 40px rgba(2, 6, 23, 0.36);
  z-index: 20;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 1rem;
}

.sidebar-brand {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.85rem;
  align-items: center;
}

.brand-kicker {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #8b5cf6;
}

.sidebar h1 {
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.05;
  letter-spacing: 0.01em;
}

.brand-orb {
  width: 3rem;
  height: 3rem;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #f8fafc;
  background:
    linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(34, 211, 238, 0.9));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.12) inset,
    0 10px 24px rgba(34, 211, 238, 0.22),
    0 16px 30px rgba(168, 85, 247, 0.22);
}

.sidebar-nav {
  display: grid;
  gap: 0.55rem;
}

.sidebar-nav a {
  color: #e2e8f0;
  text-decoration: none;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.96rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.14);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.sidebar-nav a:hover {
  transform: translateX(4px);
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(34, 211, 238, 0.42);
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.18) inset,
    0 0 0 1px rgba(168, 85, 247, 0.12),
    0 12px 22px rgba(34, 211, 238, 0.12),
    0 0 24px rgba(168, 85, 247, 0.14);
}

.sidebar-nav a:focus-visible {
  outline: none;
  border-color: rgba(34, 211, 238, 0.58);
  box-shadow:
    0 0 0 3px rgba(34, 211, 238, 0.14),
    0 0 0 1px rgba(168, 85, 247, 0.18) inset,
    0 0 20px rgba(34, 211, 238, 0.16),
    0 0 26px rgba(168, 85, 247, 0.14);
}

.sidebar-nav a.router-link-active {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.88), rgba(34, 211, 238, 0.88));
  color: #f8fafc;
  box-shadow:
    0 10px 22px rgba(168, 85, 247, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.16) inset;
}

.sidebar-panel {
  align-self: end;
  padding: 1rem;
  border-radius: 18px;
  background: rgba(7, 12, 24, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 18px 30px rgba(2, 6, 23, 0.22);
}

.sidebar-panel:hover {
  border-color: rgba(34, 211, 238, 0.38);
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.18) inset,
    0 14px 28px rgba(2, 6, 23, 0.3),
    0 0 26px rgba(168, 85, 247, 0.12);
}

.panel-label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #38bdf8;
  margin-bottom: 0.45rem;
}

.sidebar-panel strong {
  display: block;
  font-size: 1.05rem;
  margin-bottom: 0.2rem;
}

.sidebar-panel p,
.sidebar-panel small {
  margin: 0;
  color: var(--muted);
}

.main-column {
  min-width: 0;
}

.page-head {
  position: sticky;
  top: 0;
  z-index: 15;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.4rem;
  margin: 1rem 1rem 0;
  border-radius: 20px;
  background: rgba(7, 12, 24, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.12);
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 32px rgba(2, 6, 23, 0.25);
}

.page-kicker {
  margin: 0 0 0.2rem;
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
}

.page-head h2 {
  margin: 0;
  font-size: clamp(1.3rem, 2vw, 1.9rem);
}

.page-chip {
  padding: 0.7rem 0.95rem;
  border-radius: 999px;
  color: #e2e8f0;
  font-weight: 700;
  background: rgba(15, 23, 42, 0.58);
  border: 1px solid rgba(34, 211, 238, 0.18);
  box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.08) inset;
}

.page-chip:hover {
  border-color: rgba(34, 211, 238, 0.42);
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.2) inset,
    0 0 22px rgba(34, 211, 238, 0.12),
    0 0 24px rgba(168, 85, 247, 0.12);
}

.content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem 1rem 1.4rem;
}

section {
  background: linear-gradient(180deg, rgba(11, 16, 30, 0.8) 0%, rgba(7, 11, 22, 0.84) 100%);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 24px;
  padding: 1.1rem;
  box-shadow:
    0 20px 48px rgba(2, 6, 23, 0.34),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  backdrop-filter: blur(16px);
}

section h2 {
  margin: 0 0 0.9rem;
  font-size: clamp(1.35rem, 1.8vw, 2rem);
  color: #f8fafc;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
  gap: 0.65rem;
  margin-bottom: 1rem;
  padding: 0.9rem;
  background: rgba(10, 15, 28, 0.76);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 18px;
  box-shadow:
    0 12px 24px rgba(2, 6, 23, 0.22),
    0 0 0 1px rgba(34, 211, 238, 0.04) inset;
}

.filters-grid input,
.filters-grid select,
.filters-grid button {
  padding: 0.62rem 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 10px;
  transition: all 0.25s ease;
  background: rgba(4, 9, 18, 0.92);
  color: #e2e8f0;
}

.filters-grid input:hover,
.filters-grid select:hover,
.filters-grid button:hover {
  border-color: rgba(34, 211, 238, 0.48);
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.12) inset,
    0 0 0 1px rgba(168, 85, 247, 0.08),
    0 0 18px rgba(34, 211, 238, 0.1);
}

.filters-grid input:focus,
.filters-grid select:focus {
  outline: none;
  border-color: rgba(34, 211, 238, 0.82);
  box-shadow:
    0 0 0 3px rgba(34, 211, 238, 0.16),
    0 0 24px rgba(168, 85, 247, 0.12);
  transform: translateY(-1px);
}

.filters-grid input:focus-visible,
.filters-grid select:focus-visible,
.filters-grid button:focus-visible,
.pagination-controls select:focus-visible,
.pagination-controls button:focus-visible {
  outline: none;
  border-color: rgba(34, 211, 238, 0.88);
  box-shadow:
    0 0 0 3px rgba(34, 211, 238, 0.16),
    0 0 0 1px rgba(168, 85, 247, 0.18) inset,
    0 0 22px rgba(34, 211, 238, 0.2),
    0 0 30px rgba(168, 85, 247, 0.16);
}

.filters-grid button {
  border: none;
  background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 12px 18px rgba(34, 211, 238, 0.14);
}

.filters-grid button:disabled {
  background: rgba(51, 65, 85, 0.9);
  color: #94a3b8;
}

.filters-grid button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 14px 20px rgba(34, 211, 238, 0.16),
    0 0 28px rgba(168, 85, 247, 0.16);
}

.secondary-button {
  background: rgba(15, 23, 42, 0.82) !important;
  color: #e2e8f0 !important;
  border: 1px solid rgba(148, 163, 184, 0.18) !important;
}

.secondary-button:hover:not(:disabled) {
  border-color: rgba(34, 211, 238, 0.42) !important;
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.14) inset,
    0 0 24px rgba(34, 211, 238, 0.12),
    0 0 18px rgba(168, 85, 247, 0.08) !important;
}

.table-wrap {
  overflow-x: auto;
  margin-top: 0.75rem;
}

.pagination-bar {
  margin-top: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.pagination-info {
  color: #475569;
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.pagination-controls label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #334155;
  font-size: 0.9rem;
}

.pagination-controls select {
  padding: 0.42rem 0.55rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: rgba(4, 9, 18, 0.92);
  color: #e2e8f0;
}

.pagination-page {
  color: #334155;
  font-size: 0.9rem;
  padding: 0 0.25rem;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(7, 12, 24, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  overflow: hidden;
}

.detail-table th,
.detail-table td {
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  text-align: left;
  font-size: 0.95rem;
}

.detail-table th {
  background: rgba(15, 23, 42, 0.92);
  color: #e2e8f0;
}

.detail-table tbody tr {
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.detail-table tbody tr:hover td {
  background: rgba(15, 23, 42, 0.72);
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.14) inset,
    0 0 22px rgba(34, 211, 238, 0.08);
}

.detail-table tr:last-child td {
  border-bottom: none;
}

.detail-table tbody tr:nth-child(odd) {
  background: rgba(15, 23, 42, 0.5);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.8rem;
}

.card {
  background: linear-gradient(180deg, rgba(10, 15, 28, 0.86) 0%, rgba(6, 10, 20, 0.92) 100%);
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow:
    0 14px 28px rgba(2, 6, 23, 0.24),
    0 0 0 1px rgba(34, 211, 238, 0.03) inset;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  will-change: transform;
  overflow: hidden;
}

.card:hover {
  transform: scale(1.03);
  border-color: rgba(34, 211, 238, 0.36);
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.14) inset,
    0 20px 36px rgba(2, 6, 23, 0.34),
    0 0 32px rgba(168, 85, 247, 0.12);
}

.chart-card {
  background: linear-gradient(180deg, rgba(10, 15, 28, 0.86) 0%, rgba(6, 10, 20, 0.92) 100%);
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 14px 28px rgba(2, 6, 23, 0.24);
  min-height: 360px;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  will-change: transform;
}

.chart-card:hover {
  transform: scale(1.02);
  border-color: rgba(34, 211, 238, 0.28);
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.12) inset,
    0 18px 34px rgba(2, 6, 23, 0.36),
    0 0 28px rgba(34, 211, 238, 0.08);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 0.8rem;
  margin-top: 1rem;
}

.section-title {
  margin: 1.2rem 0 0.7rem;
  font-size: 1.05rem;
  color: var(--brand-ink);
  letter-spacing: 0.01em;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
  margin: 0.75rem 0 1rem;
}

.summary-card {
  background: linear-gradient(180deg, rgba(12, 18, 34, 0.92) 0%, rgba(7, 12, 24, 0.88) 100%);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 18px;
  padding: 0.95rem 1rem;
  box-shadow: 0 14px 28px rgba(2, 6, 23, 0.24);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  will-change: transform;
  min-width: 0;
  overflow: hidden;
}

.summary-card:hover {
  transform: scale(1.03);
  border-color: rgba(168, 85, 247, 0.34);
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.12) inset,
    0 20px 36px rgba(2, 6, 23, 0.34),
    0 0 30px rgba(168, 85, 247, 0.14);
}

.summary-card .summary-label {
  display: block;
  font-size: 0.82rem;
  color: #94a3b8;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-card .summary-value {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.2;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.summary-card .summary-note {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: #cbd5e1;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.city-card ul {
  margin: 0;
  padding-left: 1rem;
}

.error {
  color: #fca5a5;
}

.app-shell[data-view='finanzas'] {
  --brand: #22d3ee;
  --brand-ink: #67e8f9;
}

.app-shell[data-view='inventario'] {
  --brand: #a855f7;
  --brand-ink: #d8b4fe;
}

.app-shell[data-view='clientes'] {
  --brand: #4ade80;
  --brand-ink: #86efac;
}

.app-shell[data-view='inventario'] .summary-card {
  background: linear-gradient(180deg, rgba(18, 14, 32, 0.92) 0%, rgba(8, 10, 22, 0.88) 100%);
}

.app-shell[data-view='clientes'] .summary-card {
  background: linear-gradient(180deg, rgba(10, 21, 24, 0.92) 0%, rgba(7, 12, 24, 0.88) 100%);
}

@media (max-width: 860px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: relative;
    height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  }

  .page-head {
    position: relative;
    top: auto;
    margin: 0.8rem 0.8rem 0;
    flex-direction: column;
    align-items: flex-start;
  }

  .sidebar-nav {
    width: 100%;
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .pagination-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .content {
    padding: 0.85rem;
  }
}
</style>
