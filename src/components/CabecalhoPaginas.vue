<template> 
    <div id="cabecalhoo">
        <div id="cabecalho-hori"> 
            <div> {{ Login.USERNAME }}</div>
            <button @click="router.push({ name: 'login' })"> Sair </button>
        </div>
        <div id="conteudo">
            <div id="cabecalho-vert"> 
                <button v-if="Login.verifPerm(3)" @click="router.push({ name: 'inicio' })" > Inicio </button>
                <button v-if="Login.verifPerm(3)" @click="router.push({ name: 'pagamentos' })" > Pagamentos </button>
                <button v-if="Login.verifPerm(4) || Login.verifPerm(5)" @click="router.push({ name: 'relatorios' })" > Relatórios </button>
                <button v-if="Login.verifPerm(1)" @click="router.push({ name: 'vendas' })" > Vendas </button>
                <button v-if="Login.verifPerm(12)" @click="router.push({ name: 'sistema' })" > Sistema </button>
                
                <div id="hnotifcont" class="whitesoftshadow scroll-brown">
                    <p v-for="(notif, index) in Main.notifications" :key="index" class="hnotif"> {{ notif }} </p>
                </div>
            </div>
            <div id="pagina">
                <router-view/>
            </div>
        </div>
    </div>
</template>

<script>
import Main from '../frontend/scripts/Janelas/main/Main';
import Login from '../frontend/scripts/Janelas/login/Login';
import router from '../router';

export default {
  data() {
    return {
        router,
        Login,
        Main
    };
  }
};
</script>

<style scoped>
    #cabecalhoo {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;

        padding: 10px;
    }

    #cabecalho-hori {
        width: 100%;
        height: 50px;
        background-color: var(--fundo-principal);
        display: flex;
        justify-content: center;
        align-items: center;

        border: 1px solid var(--cor-borda-escuro);
    }

    #conteudo {
        display: flex;
        flex-direction: row;
        height: calc(100% - 50px);
    }

    #cabecalho-vert {
        width: 200px;
        background-color: var(--fundo-principal);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        border: 1px solid var(--cor-borda-escuro);
        border-top: none;
    }

    #pagina {
        flex: 1;
    }

</style>