<template>
    <ToastNotification/>
    <transition name="page" mode="out-in">
        <router-view></router-view>
    </transition>
    <div id="navigationbars">
        <div id="nvgb-buttons">
            <router-link to="/"> Login </router-link> |
            <router-link to="/inicio"> Inicio </router-link> |
            <router-link to="/pagamentos"> Pagamentos </router-link> |
            <router-link to="/relatorios"> Relatórios </router-link> |
            <router-link to="/vendas"> Vendas </router-link> |
            <router-link to="/sistema"> Sistema </router-link>            
        </div>
        <div id="nvgb-historicocont" class="scroll-blue">
            
        </div>
    </div>
</template>

<script>
import ToastNotification from './components/ToastNotification.vue';

export default {
    components: {
        ToastNotification
    }
};
</script>

<style>
@import '../src/frontend/styles/default.css';  /* mainpage */
</style>