import { createRouter, createWebHistory } from 'vue-router'


import Login from './frontend/scripts/Janelas/login/Login'
import Main from './frontend/scripts/Janelas/main/Main'
import Payment from './frontend/scripts/Janelas/payment/Payment'
import Relatorio from './frontend/scripts/Janelas/relatorio/Relatorio'
import Venda from './frontend/scripts/Janelas/venda/Venda'
import Sistema from './frontend/scripts/Janelas/sistema/Sistema'

import TelaLogin from './components/TelaLogin.vue'
import TelaPrincipal from './components/TelaPrincipal.vue'
import TelaPagamento from './components/TelaPagamento.vue'
import TelaRelatorio from './components/TelaRelatorio.vue'
import TelaVenda from './components/TelaVenda.vue'
import TelaSistema from './components/TelaSistema.vue'

const routes = [
  { path: '/', name: 'login', component: TelaLogin, meta: { classe: Login} },
  { path: '/inicio', name: 'inicio', component: TelaPrincipal, meta: { classe: Main} },
  { path: '/pagamentos', name: 'pagamentos', component: TelaPagamento, meta: { classe: Payment} },
  { path: '/relatorios', name: 'relatorios', component: TelaRelatorio, meta: { classe: Relatorio} },
  { path: '/vendas', name: 'vendas', component: TelaVenda, meta: { classe: Venda} },
  { path: '/sistema', name: 'sistema', component: TelaSistema, meta: { classe: Sistema} }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router