<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="app-shell" :data-view="route.name">
    <header class="topbar">
      <div class="brand-block">
        <p class="brand-kicker">Analitica Ejecutiva</p>
        <h1>Business Dashboard</h1>
      </div>
      <nav>
        <RouterLink to="/finanzas">Finanzas</RouterLink>
        <RouterLink to="/inventario">Inventario</RouterLink>
        <RouterLink to="/clientes">Clientes</RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style>
:root {
  --surface: #ffffff;
  --surface-soft: #f8fafc;
  --ink: #0f172a;
  --muted: #64748b;
  --line: #dbe3ef;
  --brand: #0ea5e9;
  --brand-ink: #075985;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--ink);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at 12% 8%, rgba(14, 165, 233, 0.22) 0%, transparent 28%),
    radial-gradient(circle at 86% 20%, rgba(56, 189, 248, 0.15) 0%, transparent 25%),
    linear-gradient(180deg, #eef4fb 0%, #f7fbff 44%, #f2f7ff 100%);
}

.app-shell {
  min-height: 100vh;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  background:
    linear-gradient(92deg, #08102a 0%, #0d1b46 45%, #0d254f 100%);
  color: #f8fafc;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 18px 34px rgba(2, 6, 23, 0.25);
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand-block {
  display: grid;
  gap: 0.15rem;
}

.brand-kicker {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: #93c5fd;
}

.topbar h1 {
  margin: 0;
  font-size: clamp(1.4rem, 2.1vw, 2.25rem);
  letter-spacing: 0.01em;
}

.topbar nav {
  display: flex;
  gap: 0.55rem;
  background: rgba(15, 23, 42, 0.36);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 999px;
  padding: 0.3rem;
  backdrop-filter: blur(4px);
}

.topbar a {
  color: #dbeafe;
  text-decoration: none;
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
}

.topbar a.router-link-active {
  background: linear-gradient(120deg, #0284c7 0%, #0ea5e9 100%);
  color: #f8fafc;
  box-shadow: 0 8px 16px rgba(14, 165, 233, 0.35);
}

.content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 1.2rem;
}

section {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 18px;
  padding: 1.05rem;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(8px);
}

section h2 {
  margin: 0 0 0.9rem;
  font-size: clamp(1.35rem, 1.8vw, 2rem);
  color: var(--ink);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
  gap: 0.65rem;
  margin-bottom: 1rem;
  padding: 0.9rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.8);
}

.filters-grid input,
.filters-grid select,
.filters-grid button {
  padding: 0.62rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  transition: all 0.25s ease;
}

.filters-grid input:focus,
.filters-grid select:focus {
  outline: none;
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
  transform: translateY(-1px);
}

.filters-grid button {
  border: none;
  background: linear-gradient(120deg, #0ea5e9 0%, #2563eb 100%);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.filters-grid button:disabled {
  background: #93c5fd;
}

.secondary-button {
  background: #e2e8f0 !important;
  color: #0f172a !important;
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
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
}

.pagination-page {
  color: #334155;
  font-size: 0.9rem;
  padding: 0 0.25rem;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}

.detail-table th,
.detail-table td {
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  font-size: 0.95rem;
}

.detail-table th {
  background: #f1f5f9;
  color: var(--ink);
}

.detail-table tr:last-child td {
  border-bottom: none;
}

.detail-table tbody tr:nth-child(odd) {
  background: #fcfdff;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.8rem;
}

.card {
  background: var(--surface);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--line);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  will-change: transform;
}

.card:hover {
  transform: scale(1.03);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
}

.chart-card {
  background: var(--surface);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--line);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.07);
  min-height: 360px;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  will-change: transform;
}

.chart-card:hover {
  transform: scale(1.02);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.13);
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
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 0.95rem 1rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  will-change: transform;
}

.summary-card:hover {
  transform: scale(1.03);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.13);
}

.summary-card .summary-label {
  display: block;
  font-size: 0.82rem;
  color: #64748b;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-card .summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink);
}

.summary-card .summary-note {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: #475569;
}

.city-card ul {
  margin: 0;
  padding-left: 1rem;
}

.error {
  color: #dc2626;
}

.app-shell[data-view='finanzas'] {
  --brand: #0ea5e9;
  --brand-ink: #075985;
}

.app-shell[data-view='inventario'] {
  --brand: #f59e0b;
  --brand-ink: #92400e;
}

.app-shell[data-view='clientes'] {
  --brand: #22c55e;
  --brand-ink: #14532d;
}

.app-shell[data-view='inventario'] .summary-card {
  background: linear-gradient(180deg, #fffdf7 0%, #fffbeb 100%);
}

.app-shell[data-view='clientes'] .summary-card {
  background: linear-gradient(180deg, #f7fff9 0%, #ecfdf3 100%);
}

@media (max-width: 860px) {
  .topbar {
    align-items: flex-start;
    gap: 0.8rem;
    flex-direction: column;
  }

  .topbar nav {
    width: 100%;
    justify-content: space-between;
    overflow-x: auto;
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
}
</style>
