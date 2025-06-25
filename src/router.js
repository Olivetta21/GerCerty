import { createRouter, createWebHistory } from 'vue-router'

import TelaLogin from './components/TelaLogin.vue'
import TelaPrincipal from './components/TelaPrincipal.vue'
import TelaPagamento from './components/TelaPagamento.vue'
import TelaRelatorio from './components/TelaRelatorio.vue'
import TelaVenda from './components/TelaVenda.vue'
import TelaSistema from './components/TelaSistema.vue'

const routes = [
  { path: '/', name: 'login', component: TelaLogin },
  { path: '/inicio', name: 'inicio', component: TelaPrincipal },
  { path: '/pagamentos', name: 'pagamentos', component: TelaPagamento },
  { path: '/relatorios', name: 'relatorios', component: TelaRelatorio },
  { path: '/vendas', name: 'vendas', component: TelaVenda },
  { path: '/sistema', name: 'sistema', component: TelaSistema }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router