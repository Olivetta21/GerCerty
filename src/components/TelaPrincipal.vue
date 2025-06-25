<template>
	<div id="pagecontainer" :class="[Main.opcaoVisivel?'':'nooptions']">
		<transition name="page" mode="out-in">
            <ModalCertificado v-if="MainModal.isModalVisible" />
		</transition>
	
		<div id="cabecalho">
            <div> {{ Login.USERNAME }}</div>
            <button @click="GerenciaPaginas.switchPG(Login)"> Sair </button>
		</div>
        
        <div id="pesquisacert" class="whitesoftshadow scroll-brown">
            <button class="verticaltext" @click="Main.swTypeSearch()">
                {{ Main.typeSearchNome }}
            </button>
            <div v-if="Main.typeSearch == 0" id="textCertSearch">
                <input type="text" placeholder="Nome do Certificado" v-model="Main.nomeCert">
            </div>	
            <div v-else-if="Main.typeSearch == 1" id="intervData">
                <p class="itvd A"> Intervado de: </p>
                <input class="itvd B" 
                    type="date" 
                    v-model="Main.startDate" 
                    @keyup.enter="Main.setCertificados()" 
                    placeholder="Selecione uma data"
                />
                <p class="itvd C"> a </p>
                <input class="itvd D" 
                    type="date" 
                    v-model="Main.endDate" 
                    @keyup.enter="Main.setCertificados()" 
                    placeholder="Selecione uma data"
                />
            </div>
            <div v-if="Main.typeSearch == 2" id="textCertSearch">
                <input type="text" placeholder="Codigos dos Certificados" v-model="Main.codiCert">
            </div>	
            <button class="itvd E" @click="Main.setCertificados()" :disabled="Main.loadingCert">
                {{ Main.loadingCert ? "Espere..." : "Pesquisar" }}
            </button>
        </div>

        
        <div id="listacertholder" class="whitesoftshadow scroll-brown">
            <div v-if="Main.loadingCert" class="loading-indicator">
                <div class="spinner"> </div>
            </div>
            <div v-else id="listacert">
                <table>
                    <thead>
                        <tr>
                            <th @click="Main.sortCertBy('id')">Codigo</th>
                            <th @click="Main.sortCertBy('usos')">Usos</th>
                            <th @click="Main.sortCertBy('nome')" class="col-fit-content">Nome</th>
                            <th @click="Main.sortCertBy('venc')">Vencimento</th>
                            <th @click="Main.sortCertBy('notf')" id="thNotfi">notificado</th>
                            <th @click="Main.sortCertBy('agnd')" id="thAgend">agendado</th>
                            <th @click="Main.sortCertBy('prbl')" id="thAlert">alerta</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(crt, index) in Main.certs" :key="index" @dblclick="MainModal.openCertificado(index)">
                            <td> {{ crt.id }} </td>
                            <td> {{ crt.usos ? crt.usos : 0 }} </td>
                            <td class="col-fit-content"> {{ crt.nome }} </td>
                            <td> {{ crt.venc }}  ⏳ {{ daysToExpire(crt.venc) }} </td>
                            <td> {{ crt.notf > 0 || crt.agnd > 0 ? "🔔" : " " }} </td>
                            <td> {{ crt.agnd > 0 ? "✔️" : " " }} </td>
                            <td> {{ crt.prbl > 0 ? "⚠️" : " " }} </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="Main.opcaoVisivel" id="hoptcont" class="whitesoftshadow scroll-brown">
            <div class="close" @click="Main.swOpcaoVisivel()"> &times; </div>
            <div>
                <button v-if="Login.verifPerm(13)" @click="GerenciaPaginas.switchPG(GerCertificado)"> Solicitar um novo Certificado </button>
                <button v-if="Login.verifPerm(3)" @click="GerenciaPaginas.switchPG(Payment)" > Pagamentos </button>
                <button v-if="Login.verifPerm(4) || Login.verifPerm(5)" @click="GerenciaPaginas.switchPG(Relatorio)" > Relatórios </button>
                <button v-if="Login.verifPerm(1)" @click="GerenciaPaginas.switchPG(Venda)" > Vendas </button>
                <button v-if="Login.verifPerm(14)"> Advertências </button>
                <button v-if="Login.verifPerm(12)" @click="GerenciaPaginas.switchPG(Sistema)" > Sistema </button>
            </div>
        </div>
        <div v-else id="hoptcont" class="whitesoftshadow scroll-brown">
            <button @click="Main.swOpcaoVisivel()"> &#8801; </button>
        </div>

        <div v-if="Main.opcaoVisivel" id="hnotifcont" class="whitesoftshadow scroll-brown">
            <p v-for="(notif, index) in Main.notifications" :key="index" class="hnotif"> {{ notif }} </p>
        </div>
        <div v-else id="hnotifcont" style="display: none;" class="whitesoftshadow scroll-brown"> </div>
		
	</div>
</template>

<script>
import { addToast } from '../frontend/scripts/toastNotification';
import { daysToExpire } from '../frontend/scripts/utils';

//Pages
import Login from '../frontend/scripts/Janelas/login/Login';
import Main from '../frontend/scripts/Janelas/main/Main';
/**/import MainModal from '../frontend/scripts/Janelas/main/MainModal';
import Payment from '../frontend/scripts/Janelas/payment/Payment';
import Other from '../frontend/scripts/Janelas/other/Other';
//#Pages


import GerenciaPaginas from '../frontend/scripts/Janelas/GerenciaPaginas';
import Venda from '../frontend/scripts/Janelas/venda/Venda';
import Relatorio from '../frontend/scripts/Janelas/relatorio/Relatorio';
import Sistema from '../frontend/scripts/Janelas/sistema/Sistema';
import GerCertificado from '../frontend/scripts/Janelas/gercertificado/GerCertificado';


// Components
import ModalCertificado from './TelaPrincipal/ModalCertificado.vue';

export default {
	data() {
		return {
            tour: null,

            Login,
            GerCertificado,
            Payment,
            Relatorio,
            Venda,
            Sistema,


            Main,
                MainModal,

            Other,

            GerenciaPaginas,
		};
	},
    methods: {
        addToast,
        daysToExpire
    },
    components: {
        ModalCertificado
    },
};
</script>

<style>
@import '../../src/frontend/styles/mainpage.css';  /* mainpage */
@import '../../src/frontend/styles/variables.css';  /* mainpage */
</style>


