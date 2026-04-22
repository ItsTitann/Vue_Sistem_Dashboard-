import { createRouter, createWebHistory } from 'vue-router'
import FinanzasView from '../views/FinanzasView.vue'
import InventarioView from '../views/InventarioView.vue'
import ClientesView from '../views/ClientesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/finanzas',
    },
    {
      path: '/finanzas',
      name: 'finanzas',
      component: FinanzasView,
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: InventarioView,
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: ClientesView,
    },
  ],
})

export default router
