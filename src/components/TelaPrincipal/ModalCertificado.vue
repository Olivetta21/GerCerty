 <template>
    <div class="modal">
        <div class="modal-content">
            <div v-if="mainModal_loadingModal" class="loading-indicator">
                <div class="spinner"> </div>
            </div>

            <div v-else class="main-modal-certs modal-boxes"> 
                <div class="mmc-header"> 
                    <span class="close" @click="MainModal.switchModal()">&times;</span>
                    <h2 class="mmc-title">Certificado</h2>
                </div>
                <div v-if="Main.certs" class="mmc-body scroll-blue">
                    <div class="mmc-body-cert"> 
                        <div class="mmc-bc-infs">
                            <p class="tiny1"> Código </p>
                            <p class="info1"> {{ Main.certs[MainModal.cIM].id }} </p>
                        </div>

                        <div class="mmc-bc-infs">
                            <p class="tiny1"> Nome </p>
                            <p class="info1"> {{ Main.certs[MainModal.cIM].nome }} </p>
                        </div>
                        
                        <div class="mmc-bc-infs">
                            <p class="tiny1"> Vencimento </p>
                            <p class="info1"> {{ Main.certs[MainModal.cIM].venc }} </p>
                        </div>

                        <div v-if="Main.certs[MainModal.cIM].empresa" class="mmc-bc-infs">
                            <p class="tiny1"> Responsável RFB </p>
                            <p class="info1"> {{ Main.certs[MainModal.cIM].resprfb ? Main.certs[MainModal.cIM].resprfb : "não definido"}} </p>
                        </div>
                        
                        <div class="mmc-bc-infs">
                            <p class="tiny1"> Usos </p>
                            <p class="info1"> {{ Main.certs[MainModal.cIM].usos ? Main.certs[MainModal.cIM].usos : 0 }} </p>
                        </div>
                        
                        <div class="mmc-bc-infs">
                            <p class="tiny1"> Local </p>
                            <div v-if="Main.certs[MainModal.cIM].localRevelado == 'carregando'" class="loading-indicator">
                                <div class="spinner"> </div>
                            </div>
                            <button v-else-if="!Main.certs[MainModal.cIM].localRevelado" class="info1 no_tab" @click="MainModal.revelarLocal()"> Revelar Local </button>
                            <p v-else-if="Main.certs[MainModal.cIM].localRevelado" class="info1"> {{ Main.certs[MainModal.cIM].local }} </p>
                        </div>
                        
                        <div class="mmc-bc-infs">
                            <p v-if="Main.certs[MainModal.cIM].agnd || Main.certs[MainModal.cIM].notf" class="info1 no_tab"> Cliente já notificado. </p>
                            <button v-else class="info1 no_tab" @click="MainModal.showCronAdder('NOTF')"> Notifiquei o cliente </button>
                        </div>
                        
                        <div class="mmc-bc-infs">
                            <p v-if="Main.certs[MainModal.cIM].agnd" class="info1 no_tab"> Cliente já agendou. </p>
                            <button v-else class="info1 no_tab" @click="MainModal.showCronAdder('AGND')"> Agendei o cliente </button>
                        </div>
                        
                        <div class="mmc-bc-infs">
                            <p class="info1"> Avisos: {{ Main.certs[MainModal.cIM].prbl }} </p>
                            <button class="tiny1" @click="MainModal.showCronAdder('PRBL')"> Adicionar </button>
                        </div>
                    </div>
                    <div class="mmc-crono-holder">
                        <div class="mmc-title-cont">
                            <span class="close" @click="MainModal.changeVersaoReOpen(MainModal.cIM, true)"> &rArr; </span>
                            <span class="close"> {{ Main.certs[MainModal.cIM].versao }} </span>
                            <span class="close" @click="MainModal.changeVersaoReOpen(MainModal.cIM, false)"> &lArr; </span>
                            <h2 class="mmc-title">Cronograma</h2>
                        </div>

                        <div v-if="MainModal.loadingModalCron" class="loading-indicator">
                            <div class="spinner"> </div>
                        </div>
                        <p v-else-if="!Main.certs[MainModal.cIM].crono" class="tiny1"> Nenhum cronograma para este certificado... </p>
                        <div v-else class="mmc-body-cron scroll-blue ">
                            <div :class="['mmc-body-cron-cron', cron.type]" v-for="(cron) in Main.certs[MainModal.cIM].crono" :key="cron"> 
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
            <div v-if="MainModal.isCronAdderVisible" class="modfSomething modal-boxes">
                <div class="ms-header-cont">
                    <div class="close" @click="MainModal.closeCronAdder()"> &times; </div>
                    <div class="ms-h-title"> {{ MainModal.cronTitulo }} </div>
                </div>
                <div class="ms-body-cont">
                    <textarea v-model="MainModal.cronNota" class="ms-b-nota" name="nota" placeholder="Digite algo" required> </textarea>
                </div>
                <div class="ms-footer-cont">
                    <button class="ms-f cancel" @click="MainModal.closeCronAdder()"> cancelar </button>
                    <button class="ms-f confirm" @click="MainModal.addCronograma()"> confirmar </button>
                </div>
            </div>
        </div>           
    </div>
</template>

<script>

import Login from '../../frontend/scripts/Janelas/login/Login';
import MainModal from '../../frontend/scripts/Janelas/main/MainModal';
import Main from '../../frontend/scripts/Janelas/main/Main';

export default {
    data() {
        return {
            Login,
            Main,
            MainModal
        };
    }
}
</script>

<style scoped>

</style>