<template>
    <ToastNotification/>
    <transition name="page" mode="out-in">
        <router-view></router-view>
    </transition>
    <div id="navigationbars">
        <div id="nvgb-buttons">

            <router-link to="/">Login</router-link> |
            <router-link to="/inicio"> Inicio </router-link> |
            <router-link to="/pagamentos"> Pagamentos </router-link> |
            <router-link to="/relatorios"> Relatórios </router-link> |
            <router-link to="/vendas"> Vendas </router-link> |
            <router-link to="/sistema"> Sistema </router-link> |
            
        </div>
        <div id="nvgb-historicocont" class="scroll-blue">
            
        </div>
    </div>
</template>

<script>
import ToastNotification from './components/ToastNotification.vue';

//import TelaLogin from './components/TelaLogin.vue';
//import TelaGerCertificado from './components/TelaGerCertificado.vue';
//import TelaPrincipal from './components/TelaPrincipal.vue';
//import TelaPagamento from './components/TelaPagamento.vue';
//import TelaRelatorio from './components/TelaRelatorio.vue';
//import TelaVenda from './components/TelaVenda.vue';
//import TelaSistema from './components/TelaSistema.vue';
//import TelaTeste from './components/TelaTeste.vue';
//import TelaNaoLocalizada from './components/TelaNaoLocalizada.vue';

import GerenciaPaginas from './frontend/scripts/Janelas/GerenciaPaginas';
import Login from './frontend/scripts/Janelas/login/Login';
import GerCertificado from './frontend/scripts/Janelas/gercertificado/GerCertificado';
import Main from './frontend/scripts/Janelas/main/Main';
import Payment from './frontend/scripts/Janelas/payment/Payment';
import Relatorio from './frontend/scripts/Janelas/relatorio/Relatorio';
import Venda from './frontend/scripts/Janelas/venda/Venda';
import Sistema from './frontend/scripts/Janelas/sistema/Sistema';
import Other from './frontend/scripts/Janelas/other/Other';

export default {
	data() {
		return {
            Login,
            GerCertificado,
            Main,
            Payment,
            Relatorio,
            Venda,
            Sistema,
            Other,

            GerenciaPaginas,
            actPage: GerenciaPaginas.initPgAtual_,
            historico: GerenciaPaginas.historico_,
            hisPos: GerenciaPaginas.historicoPos_
		};
	},
    components: {
        ToastNotification,
    //    TelaLogin,
    //    TelaGerCertificado,
    //    TelaPrincipal,
    //    TelaPagamento,
    //    TelaRelatorio,
    //    TelaVenda,
    //    TelaSistema,
    //    TelaTeste,
    //    TelaNaoLocalizada
    }
};
</script>

<style>
@import '../src/frontend/styles/default.css';  /* mainpage */
</style>