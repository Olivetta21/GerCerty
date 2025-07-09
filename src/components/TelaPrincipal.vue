<template>
	<div id="pagecontainer" :class="[Main.opcaoVisivel?'':'nooptions']">
		<transition name="page" mode="out-in">
            <ModalCertificado v-if="MainModal.isModalVisible" />
		</transition>
	
        <form @submit.prevent id="pesquisacert" class="soft-panel">
            <button type="button" @click="Main.swTypeSearch()">
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
                    placeholder="Selecione uma data"
                />
                <p class="itvd C"> a </p>
                <input class="itvd D" 
                    type="date" 
                    v-model="Main.endDate"
                    placeholder="Selecione uma data"
                />
            </div>
            <div v-if="Main.typeSearch == 2" id="textCertSearch">
                <input type="text" placeholder="Codigos dos Certificados" v-model="Main.codiCert">
            </div>
            <button type="submit" class="itvd E" @click="Main.setCertificados()" :disabled="Main.loadingCert">
                {{ Main.loadingCert ? "Espere..." : "Pesquisar" }}
            </button>
            <button v-if="Main.certs.length > 0" type="button" @click="objArrToCSV2(Main.certs)"> &#8292; &#8609; &#8292; </button>
        </form>

        
        <div id="listacertholder" class="soft-panel">
            <div v-if="Main.loadingCert" class="loading-indicator">
                <div class="spinner"> </div>
            </div>
            <div v-else id="listacert" class="scroll-brown">
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

		
	</div>
</template>

<script>
import { addToast } from '../frontend/scripts/toastNotification';
import { daysToExpire } from '../frontend/scripts/utils';

import Main from '../frontend/scripts/Janelas/main/Main';
import MainModal from '../frontend/scripts/Janelas/main/MainModal';

import ModalCertificado from './TelaPrincipal/ModalCertificado.vue';
import router from '../router';

import { prepareObjArrToCSV, generateCSV } from '../frontend/scripts/utils';

export default {
	data() {
		return {
            tour: null,
            router,

            Main,
                MainModal,


		};
	},
    methods: {
        addToast,
        daysToExpire,

        
        objArrToCSV2(a){
            let newObjects = [];

            const titulo = {
                id: "Codigo",
                usos: "Usos",
                nome: "Nome",
                venc: "Vencimento",
                notf: "Notificado",
                agnd: "Agendado",
                prbl: "Avisos",
            };

            a.forEach(e => {
                newObjects.push({
                    id: e.id,
                    usos: e.usos ? e.usos : 0,
                    nome: e.nome,
                    venc: e.venc,
                    notf: e.notf ? "Sim": "",
                    agnd: e.agnd ? "Sim": "",
                    prbl: e.prbl ? "Sim": "",
                });
            });


            const str_body = prepareObjArrToCSV(newObjects, titulo);

            generateCSV(str_body, "CertificadosFiltrados");
        },
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


