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
import TelaTeste from './components/TelaTeste.vue'
import Other from './frontend/scripts/Janelas/other/Other'
import CabecalhoPaginas from './components/CabecalhoPaginas.vue'

const routes = [
  { path: '/login', name: 'login', component: TelaLogin, meta: { classe: Login} },
  
  {
    path: '/site',
    component: CabecalhoPaginas,
    children: [
        { path: 'inicio', name: 'inicio', component: TelaPrincipal, meta: { classe: Main, requiresAuth: true } },
        { path: 'pagamentos', name: 'pagamentos', component: TelaPagamento, meta: { classe: Payment, requiresAuth: true } },
        { path: 'relatorios', name: 'relatorios', component: TelaRelatorio, meta: { classe: Relatorio, requiresAuth: true } },
        { path: 'vendas', name: 'vendas', component: TelaVenda, meta: { classe: Venda, requiresAuth: true } },
        { path: 'sistema', name: 'sistema', component: TelaSistema, meta: { classe: Sistema, requiresAuth: true } },
        { path: 'teste', name: 'teste', component: TelaTeste, meta: { classe: Other } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router