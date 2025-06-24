<template>
	<div id="pagecontainer" :class="[Main.opcaoVisivel?'':'nooptions']">
		<transition name="page" mode="out-in">
		<div v-if="mainModal_isModalVisible" class="modal">
			<div class="modal-content">
                <div v-if="mainModal_loadingModal" class="loading-indicator">
                    <div class="spinner"> </div>
                </div>

                <div v-else class="main-modal-certs modal-boxes"> 
                    <div class="mmc-header"> 
                        <span class="close" @click="MainModal.switchModal()">&times;</span>
                        <h2 class="mmc-title">Certificado</h2>
                    </div>
                    <div v-if="main_certs" class="mmc-body scroll-blue">
                        <div class="mmc-body-cert"> 
                            <div class="mmc-bc-infs">
                                <p class="tiny1"> Código </p>
                                <p class="info1"> {{ main_certs[mainModal_cIM].id }} </p>
                            </div>

                            <div class="mmc-bc-infs">
                                <p class="tiny1"> Nome </p>
                                <p class="info1"> {{ main_certs[mainModal_cIM].nome }} </p>
                            </div>
                            
                            <div class="mmc-bc-infs">
                                <p class="tiny1"> Vencimento </p>
                                <p class="info1"> {{ main_certs[mainModal_cIM].venc }} </p>
                            </div>

                            <div v-if="main_certs[mainModal_cIM].empresa" class="mmc-bc-infs">
                                <p class="tiny1"> Responsável RFB </p>
                                <p class="info1"> {{ main_certs[mainModal_cIM].resprfb ? main_certs[mainModal_cIM].resprfb : "não definido"}} </p>
                            </div>
                            
                            <div class="mmc-bc-infs">
                                <p class="tiny1"> Usos </p>
                                <p class="info1"> {{ main_certs[mainModal_cIM].usos ? main_certs[mainModal_cIM].usos : 0 }} </p>
                            </div>
                            
                            <div class="mmc-bc-infs">
                                <p class="tiny1"> Local </p>
                                <div v-if="main_certs[mainModal_cIM].localRevelado == 'carregando'" class="loading-indicator">
                                    <div class="spinner"> </div>
                                </div>
                                <button v-else-if="!main_certs[mainModal_cIM].localRevelado" class="info1 no_tab" @click="MainModal.revelarLocal()"> Revelar Local </button>
                                <p v-else-if="main_certs[mainModal_cIM].localRevelado" class="info1"> {{ main_certs[mainModal_cIM].local }} </p>
                            </div>
                            
                            <div class="mmc-bc-infs">
                                <p v-if="main_certs[mainModal_cIM].agnd || main_certs[mainModal_cIM].notf" class="info1 no_tab"> Cliente já notificado. </p>
                                <button v-else class="info1 no_tab" @click="MainModal.showCronAdder('NOTF')"> Notifiquei o cliente </button>
                            </div>
                            
                            <div class="mmc-bc-infs">
                                <p v-if="main_certs[mainModal_cIM].agnd" class="info1 no_tab"> Cliente já agendou. </p>
                                <button v-else class="info1 no_tab" @click="MainModal.showCronAdder('AGND')"> Agendei o cliente </button>
                            </div>
                            
                            <div class="mmc-bc-infs">
                                <p class="info1"> Avisos: {{ main_certs[mainModal_cIM].prbl }} </p>
                                <button class="tiny1" @click="MainModal.showCronAdder('PRBL')"> Adicionar </button>
                            </div>
                        </div>
                        <div class="mmc-crono-holder">
                            <div class="mmc-title-cont">
                                <span class="close" @click="MainModal.changeVersaoReOpen(mainModal_cIM, true)"> &rArr; </span>
                                <span class="close"> {{ main_certs[mainModal_cIM].versao }} </span>
                                <span class="close" @click="MainModal.changeVersaoReOpen(mainModal_cIM, false)"> &lArr; </span>
                                <h2 class="mmc-title">Cronograma</h2>
                            </div>

                            <div v-if="mainModal_loadingModalCron" class="loading-indicator">
                                <div class="spinner"> </div>
                            </div>
                            <p v-else-if="!main_certs[mainModal_cIM].crono" class="tiny1"> Nenhum cronograma para este certificado... </p>
                            <div v-else class="mmc-body-cron scroll-blue ">
                                <div :class="['mmc-body-cron-cron', cron.type]" v-for="(cron) in main_certs[mainModal_cIM].crono" :key="cron"> 
                                    <p class="close" v-if="cron.type != 'REVL' && cron.ulogin == Login.login" @click="MainModal.deleteCronograma(cron.id)"> &times; </p>
                                    <p class="tiny1">{{ cron.user }}</p>
                                    <p class="info1 no_tab">{{ cron.type }}</p>
                                    <p class="tiny1 nota">{{ cron.nota }}</p>
                                    <p class="tiny1">{{ cron.data }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else> Índice inexistente! </div>
                </div>
                <div v-if="mainModal_isCronAdderVisible" class="modfSomething modal-boxes">
                    <div class="ms-header-cont">
                        <div class="close" @click="MainModal.closeCronAdder()"> &times; </div>
                        <div class="ms-h-title"> {{ mainModal_cronTitulo }} </div>
                    </div>
                    <div class="ms-body-cont">
                        <textarea v-model="mainModal_cronNota" class="ms-b-nota" name="nota" placeholder="Digite algo" required> </textarea>
                    </div>
                    <div class="ms-footer-cont">
                        <button class="ms-f cancel" @click="MainModal.closeCronAdder()"> cancelar </button>
                        <button class="ms-f confirm" @click="MainModal.addCronograma()"> confirmar </button>
                    </div>
                </div>
			</div>           
		</div>
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
                    v-model="main_startDate" 
                    @keyup.enter="Main.setCertificados()" 
                    placeholder="Selecione uma data"
                />
                <p class="itvd C"> a </p>
                <input class="itvd D" 
                    type="date" 
                    v-model="main_endDate" 
                    @keyup.enter="Main.setCertificados()" 
                    placeholder="Selecione uma data"
                />
            </div>
            <div v-if="Main.typeSearch == 2" id="textCertSearch">
                <input type="text" placeholder="Codigos dos Certificados" v-model="Main.codiCert">
            </div>	
            <button class="itvd E" @click="Main.setCertificados()" :disabled="main_loadingCert">
                {{ main_loadingCert ? "Espere..." : "Pesquisar" }}
            </button>
        </div>

        
        <div id="listacertholder" class="whitesoftshadow scroll-brown">
            <div v-if="main_loadingCert" class="loading-indicator">
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
                        <tr v-for="(crt, index) in main_certs" :key="index" @dblclick="MainModal.openCertificado(index)">
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
            main_loadingCert: Main.loadingCert_,
            main_startDate: Main.startDate_,
            main_endDate: Main.endDate_,
            main_certs: Main.certs_,
                MainModal,
                mainModal_cIM: MainModal.cIM_,
                mainModal_isModalVisible: MainModal.isModalVisible_,
                mainModal_loadingModal: MainModal.loadingModal_, //não usado atualmente.
                mainModal_loadingModalCron: MainModal.loadingModalCron_,
                mainModal_isCronAdderVisible: MainModal.isCronAdderVisible_,
                mainModal_cronTitulo: MainModal.cronTitulo_,
                mainModal_cronNota: MainModal.cronNota_,

            Other,


            GerenciaPaginas,
		};
	},
    methods: {
        addToast,
        daysToExpire
    }
};
</script>

<style>
@import '../../src/frontend/styles/mainpage.css';  /* mainpage */
@import '../../src/frontend/styles/variables.css';  /* mainpage */
</style>


