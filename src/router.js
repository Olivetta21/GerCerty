import { createRouter, createWebHistory } from 'vue-router'


import Login from './frontend/scripts/Janelas/login/Login'
import Certificados from './frontend/scripts/Janelas/certificados/Certificados'
import Payment from './frontend/scripts/Janelas/payment/Payment'
import Relatorio from './frontend/scripts/Janelas/relatorio/Relatorio'
import Venda from './frontend/scripts/Janelas/venda/Venda'
import Sistema from './frontend/scripts/Janelas/sistema/Sistema'
import Contatos from './frontend/scripts/Janelas/contatos/Contatos'
import Other from './frontend/scripts/Janelas/other/Other'

import TelaLogin from './components/TelaLogin.vue'
import TelaCertificados from './components/TelaCertificados.vue'
import TelaPagamento from './components/TelaPagamento.vue'
import TelaRelatorio from './components/TelaRelatorio.vue'
import TelaVenda from './components/TelaVenda.vue'
import TelaSistema from './components/TelaSistema.vue'
import TelaTeste from './components/TelaTeste.vue'
import CabecalhoPaginas from './components/CabecalhoPaginas.vue'
import TelaContatos from './components/TelaContatos/TelaContatos.vue'
import TelaInicio from './components/TelaInicio.vue'


const routes = [
  { path: '/login', name: 'login', component: TelaLogin, meta: { classe: Login } },

  {
    path: '/site',
    component: CabecalhoPaginas,
    meta: { requiresAuth: true },
    redirect: { name: 'inicio' },
    children: [
      { path: 'inicio', name: 'inicio', component: TelaInicio},
      { path: 'certificados', name: 'certificados', component: TelaCertificados, meta: { classe: Certificados } },
      { path: 'pagamentos', name: 'pagamentos', component: TelaPagamento, meta: { classe: Payment } },
      { path: 'relatorios', name: 'relatorios', component: TelaRelatorio, meta: { classe: Relatorio } },
      { path: 'vendas', name: 'vendas', component: TelaVenda, meta: { classe: Venda, } },
      { path: 'sistema', name: 'sistema', component: TelaSistema, meta: { classe: Sistema, } },
      { path: 'teste', name: 'teste', component: TelaTeste, meta: { classe: Other } },
      { path: 'contatos', name: 'contatos', component: TelaContatos, meta: { classe: Contatos } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'inicio', params: {} } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router