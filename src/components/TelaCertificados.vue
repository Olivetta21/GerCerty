<template>
	<div id="pagecontainer" :class="[Certificados.opcaoVisivel?'':'nooptions']">
		<transition name="page" mode="out-in">
            <ModalCertificado v-if="CertCardModal.isModalVisible" />
		</transition>
		<transition name="page" mode="out-in">
            <ModalEnviarWhatsapp v-if="EnviarWhatsModal.isModalVisible" />
		</transition>
        <form @submit.prevent id="pesquisacert" class="soft-panel">
            <button type="button" @click="Certificados.swTypeSearch()">
                {{ Certificados.typeSearchNome }}
            </button>
            <div v-if="Certificados.typeSearch == 0" id="textCertSearch">
                <input type="text" placeholder="Nome do Certificado" v-model="Certificados.nomeCert">
            </div>	
            <div v-else-if="Certificados.typeSearch == 1" id="intervData">
                <p class="itvd A"> Intervado de: </p>
                <input class="itvd B" 
                    type="date" 
                    v-model="Certificados.startDate"
                    placeholder="Selecione uma data"
                />
                <p class="itvd C"> a </p>
                <input class="itvd D" 
                    type="date" 
                    v-model="Certificados.endDate"
                    placeholder="Selecione uma data"
                />
            </div>
            <div v-if="Certificados.typeSearch == 2" id="textCertSearch">
                <input type="text" placeholder="Codigos dos Certificados" v-model="Certificados.codiCert">
            </div>
            <button type="submit" class="itvd E" @click="Certificados.setCertificados()" :disabled="Certificados.loadingCert">
                {{ Certificados.loadingCert ? "Espere..." : "Pesquisar" }}
            </button>
            <button v-if="Certificados.certs.length > 0" type="button" @click="objArrToCSV2(Certificados.certs)"> &#8292; &#8609; &#8292; </button>
        </form>

        
        <div id="listacertholder" class="soft-panel">
            <div v-if="Certificados.loadingCert" class="loading-indicator">
                <div class="spinner"> </div>
            </div>
            <div v-else id="listacert" class="scroll-brown">
                <table>
                    <thead>
                        <tr>
                            <th @click="Certificados.sortCertBy('id')">Codigo</th>
                            <th @click="Certificados.sortCertBy('usos')">Usos</th>
                            <th @click="Certificados.sortCertBy('nome')" class="col-fit-content">Nome</th>
                            <th @click="Certificados.sortCertBy('venc')">Vencimento</th>
                            <th @click="Certificados.sortCertBy('agnd')" id="thAgend">Local</th>
                            <th @click="Certificados.sortCertBy('notf')" id="thNotfi">info</th>
                            <th @click="Certificados.sortCertBy('prbl')" id="thAlert">avisar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(crt, index) in Certificados.certs" :key="index" @dblclick="CertCardModal.openCertificado(index)">
                            <td @click="console.log(crt)"> {{ crt.id }} </td>
                            <td> {{ crt.usos ? crt.usos : 0 }} </td>
                            <td class="col-fit-content"> {{ crt.nome }} </td>
                            <td> {{ crt.venc }}  ⏳ {{ daysToExpire(crt.venc) }} </td>
                            <td> 
                                <span v-if="crt.localRevelado == 'carregando'" class="loading-indicator"><div class="spinner loc-loading"> </div></span>
                                <template v-else>
                                    <span v-if="crt.emusopor && crt.emusopor == Login.login" @click="Certificados.cancelaUso(index)" ><button>♻️</button></span>
                                    <span v-else-if="!crt.localRevelado" @click="CertCardModal.helper_revelarLocal_semAbrirModal(index)"><button>👁️</button></span>                                    
                                    {{crt.local == 'escondido' ? '' : crt.local}} {{ crt.emusopor ? ` / Usando: ${crt.emusopor}` : '' }} 
                                </template>
                            </td>
                            <td>
                                <span> {{ crt.agnd > 0 ? "✔️" : " " }} </span>
                                <span> {{ crt.prbl > 0 ? "⚠️" : " " }} </span>
                            </td>
                            <td> 
                                <span> {{ crt.notf > 0 || crt.agnd > 0 ? "🔔" : " " }} <button v-if="daysToExpire(crt.venc) < 40" @click="EnviarWhatsModal.open(crt)">📞</button></span>
                            </td>
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

import Certificados from '../frontend/scripts/Janelas/certificados/Certificados';
import CertCardModal from '../frontend/scripts/Janelas/certificados/CertCardModal';

import ModalCertificado from './TelaPrincipal/ModalCertificado.vue';
import router from '../router';

import { prepareObjArrToCSV, generateCSV } from '../frontend/scripts/utils';
import ModalEnviarWhatsapp from './TelaPrincipal/ModalEnviarWhatsapp.vue';
import EnviarWhatsModal from '@/frontend/scripts/Janelas/certificados/EnviarWhatsModal';
import Login from '@/frontend/scripts/Janelas/login/Login';

export default {
	data() {
		return {
            tour: null,
            router,

            Login,
            Certificados,
                CertCardModal,
                EnviarWhatsModal,


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
        ModalCertificado,
        ModalEnviarWhatsapp
    },
};
</script>

<style>
@import '../../src/frontend/styles/mainpage.css';  /* mainpage */
@import '../../src/frontend/styles/variables.css';  /* mainpage */
</style>


