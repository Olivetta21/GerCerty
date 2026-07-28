 <template>
    <div class="modal">
        <div class="modal-content">
            <div v-if="CertCardModal.loadingModal" class="loading-indicator">
                <div class="spinner"> </div>
            </div>

            <div v-else class="main-modal-certs modal-boxes"> 
                <div class="mmc-header"> 
                    <span class="close" @click="CertCardModal.switchModal()">&times;</span>
                    <h2 class="mmc-title">Certificado</h2>
                </div>
                <div v-if="Certificados.certs" class="mmc-body scroll-blue">
                    <div class="mmc-body-cert"> 
                        <div class="mmc-bc-infs">
                            <p class="tiny1"> Código </p>
                            <p class="info1"> {{ Certificados.certs[CertCardModal.cIM].id }} </p>
                        </div>

                        <div class="mmc-bc-infs">
                            <p class="tiny1"> Nome </p>
                            <p class="info1"> {{ Certificados.certs[CertCardModal.cIM].nome }} </p>
                        </div>
                        
                        <div class="mmc-bc-infs">
                            <p class="tiny1"> Vencimento </p>
                            <p class="info1"> {{ Certificados.certs[CertCardModal.cIM].venc }} </p>
                        </div>

                        <div v-if="Certificados.certs[CertCardModal.cIM].empresa" class="mmc-bc-infs">
                            <div>
                                <span class="tiny1"> Responsável RFB </span>
                                <template v-if="Certificados.certs[CertCardModal.cIM].user_is_editing_responsavel">
                                    <span @click="Certificados.certs[CertCardModal.cIM].user_is_editing_responsavel = false">↩️</span>
                                    <span @click="CertCardModal.saveEditingResponsavel()">💾</span>
                                </template>
                                <span v-else @click="CertCardModal.startEditingResponsavel()">✏️</span>
                            </div>
                            <input v-if="Certificados.certs[CertCardModal.cIM].user_is_editing_responsavel" 
                                class="info1" type="text"
                                v-model="CertCardModal.responsavel_name"
                            />
                            <p v-else class="info1" >
                                {{ Certificados.certs[CertCardModal.cIM].responsavel ? Certificados.certs[CertCardModal.cIM].responsavel : "não definido" }}
                            </p>
                        </div>
                        
                        <div class="mmc-bc-infs">
                            <p class="tiny1"> Usos </p>
                            <p class="info1"> {{ Certificados.certs[CertCardModal.cIM].usos ? Certificados.certs[CertCardModal.cIM].usos : 0 }} </p>
                        </div>
                        
                        <div class="mmc-bc-infs">
                            <p class="tiny1"> Local {{ Certificados.certs[CertCardModal.cIM].emusopor ? ` / Usando: ${Certificados.certs[CertCardModal.cIM].emusopor}` : '' }} </p>
                            <div v-if="Certificados.certs[CertCardModal.cIM].localRevelado == 'carregando'" class="loading-indicator">
                                <div class="spinner"> </div>
                            </div>
                            <template v-else>
                                <span v-if="Certificados.certs[CertCardModal.cIM].emusopor && Certificados.certs[CertCardModal.cIM].emusopor == Login.login" @click="Certificados.cancelaUso(CertCardModal.cIM)" ><button>♻️</button></span>
                                <button v-else-if="!Certificados.certs[CertCardModal.cIM].localRevelado" class="info1 no_tab" @click="CertCardModal.revelarLocal()"> Revelar Local </button>
                                <p v-if="Certificados.certs[CertCardModal.cIM].localRevelado" class="info1"> {{ Certificados.certs[CertCardModal.cIM].local }} </p>
                            </template>
                        </div>
                        
                        <!--
                            <div class="mmc-bc-infs">
                                <p v-if="Main.certs[MainModal.cIM].agnd || Main.certs[MainModal.cIM].notf" class="info1 no_tab"> Cliente já notificado. </p>
                                <button v-else class="info1 no_tab" @click="MainModal.showCronAdder('NOTF')"> Notifiquei o cliente </button>
                            </div>
                            
                            <div class="mmc-bc-infs">
                                <p v-if="Main.certs[MainModal.cIM].agnd" class="info1 no_tab"> Cliente já agendou. </p>
                                <button v-else class="info1 no_tab" @click="MainModal.showCronAdder('AGND')"> Agendei o cliente </button>
                            </div>
                        -->
                        
                        <div class="mmc-bc-infs">
                            <button class="tiny1" @click="CertCardModal.showCronAdder('PRBL')"> Adicionar Mensagem </button>
                        </div>
                    </div>
                    <div class="mmc-crono-holder">
                        <div class="mmc-title-cont">
                            <span class="close" @click="CertCardModal.changeVersaoReOpen(CertCardModal.cIM, true)"> &rArr; </span>
                            <span class="close"> {{ Certificados.certs[CertCardModal.cIM].versao }} </span>
                            <span class="close" @click="CertCardModal.changeVersaoReOpen(CertCardModal.cIM, false)"> &lArr; </span>
                            <h2 class="mmc-title">Cronograma</h2>
                        </div>

                        <div v-if="CertCardModal.loadingModalCron" class="loading-indicator">
                            <div class="spinner"> </div>
                        </div>
                        <p v-else-if="!Certificados.certs[CertCardModal.cIM].crono" class="tiny1"> Nenhum cronograma para este certificado... </p>
                        <div v-else class="mmc-body-cron scroll-blue ">
                            <div :class="['mmc-body-cron-cron', cron.type]" v-for="(cron) in Certificados.certs[CertCardModal.cIM].crono" :key="cron"> 
                                <p class="close" v-if="!['REVL', 'DVLV'].includes(cron.type) && cron.ulogin == Login.login" @click="CertCardModal.deleteCronograma(cron.id)"> &times; </p>
                                <p class="tiny1">{{ cron.user }}</p>
                                <p class="info1 no_tab">{{ {
                                    "AGND": "📋 Agendou", 
                                    "NOTF": "🔔 Notificou", 
                                    "REVL": "👁️ Visualizou", 
                                    "PRBL": "", 
                                    "DVLV": "♻️ Devolveu"
                                } [cron.type] ?? cron.type }}</p>
                                <p class="tiny1 nota">{{ cron.nota }}</p>
                                <p class="tiny1">{{ cron.data }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else> Índice inexistente! </div>
            </div>
            <div v-if="CertCardModal.isCronAdderVisible" class="modfSomething modal-boxes">
                <div class="ms-header-cont">
                    <div class="close" @click="CertCardModal.closeCronAdder()"> &times; </div>
                    <div class="ms-h-title">
                        {{ {
                            "AGND": "📋 Agendamento", 
                            "NOTF": "🔔 Notificando", 
                            "PRBL": "Mensagem", 
                        } [CertCardModal.cronTitulo] ?? CertCardModal.cronTitulo }}
                    </div>
                </div>
                <div class="ms-body-cont">
                    <textarea v-model="CertCardModal.cronNota" class="ms-b-nota" name="nota" placeholder="Digite algo" required> </textarea>
                </div>
                <div class="ms-footer-cont">
                    <button class="ms-f cancel" @click="CertCardModal.closeCronAdder()"> cancelar </button>
                    <button class="ms-f confirm" @click="CertCardModal.addCronograma()"> confirmar </button>
                </div>
            </div>
        </div>           
    </div>
</template>

<script>

import Login from '../../frontend/scripts/Janelas/login/Login';
import CertCardModal from '../../frontend/scripts/Janelas/certificados/CertCardModal';
import Certificados from '../../frontend/scripts/Janelas/certificados/Certificados';

export default {
    data() {
        return {
            Login,
            Certificados,
            CertCardModal
        };
    }
}
</script>

<style scoped>

</style>