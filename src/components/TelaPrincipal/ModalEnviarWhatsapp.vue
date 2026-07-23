 <template>
    <div class="modal">
        <div class="modal-content">
            <div class="main-modal-certs modal-boxes"> 
                <div class="mmc-header"> 
                    <span class="close" @click="EnviarWhatsModal.close()">&times;</span>
                    <h2 class="mmc-title">Enviar para o WhatsApp</h2>
                </div>
                <div class="mmc-body scroll-blue">
                    <div class="mmc-body-cert"> 
                        <div class="mmc-bc-infs">
                            <p class="tiny1"> Cliente </p>
                            <p class="info1"> {{ EnviarWhatsModal.certificado.nome }} </p>
                        </div>

                        <div v-if="EnviarWhatsModal.certificado.telefone_whatsapp" class="mmc-bc-infs numero-whats" @click="(EnviarWhatsModal.certificado.telefone_whatsapp && EnviarWhatsModal.sendWhats())">
                            <p class="numero-definido"> Notificar {{ EnviarWhatsModal.certificado.telefone_whatsapp }} </p>
                        </div>
                        
                        <div class="mmc-bc-infs pesq-change-num">
                            <p class="info1" @click="trocar_numero_visible = !trocar_numero_visible" v-if="!trocar_numero_visible"> Definir Numero </p>
                            <p class="info1" @click="outros_numeros_visible = !outros_numeros_visible" v-if="!outros_numeros_visible"> Procurar Numeros </p>
                        </div>
                    </div>
                    <div class="mmc-crono-holder" v-if="outros_numeros_visible">    
                        <div class="mmc-title-cont">
                            <h2 class="mmc-title" @click="outros_numeros_visible = !outros_numeros_visible">Outros Possíveis Números do Cliente</h2>
                        </div>
                        <p v-if="!EnviarWhatsModal.numeros.length" class="tiny1"> Nenhum número encontrado para este cliente... </p>
                        <div v-else class="mmc-body-cron scroll-blue ">
                            <div :class="['mmc-body-cron-cron']" v-for="(num, index) in EnviarWhatsModal.numeros" :key="index"> 
                                <p class="tiny1 numero-id-and-pri" @click="EnviarWhatsModal.setCertNumber(num.numero)"> {{ num.id }} | {{ num.prioridade }} <span> definir </span></p>
                                <p class="tiny1"> {{ num.cliente }} </p>
                                <p class="tiny1"> Numero: </p>
                                <p class="info1 numero-whats" @click="EnviarWhatsModal.sendWhats(num.numero)"> {{ num.numero }} <span>Notificar</span></p>
                                <p class="tiny1"> Informado por: </p>
                                <p class="tiny1"> {{ num.original }} </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>            
            <div v-if="trocar_numero_visible" class="modfSomething modal-boxes numero-whats">
                <div class="ms-header-cont">
                    <div class="close" @click="trocar_numero_visible = false"> &times; </div>
                    <div class="ms-h-title"> Digite o telefone do cliente: </div>
                </div>
                <div class="ms-body-cont novo-numero">
                    <input type="tel" class="ms-b-nota" name="numero" placeholder="numero" required v-model="novo_numero">
                    <button class="ms-f confirm" @click="EnviarWhatsModal.setCertNumber(novo_numero)"> Definir </button>
                </div>
            </div>
        </div>           
    </div>
</template>

<script>

import EnviarWhatsModal from '@/frontend/scripts/Janelas/main/EnviarWhatsModal';
import Login from '../../frontend/scripts/Janelas/login/Login';

export default {
    data() {
        return {
            Login,
            EnviarWhatsModal,
            
            trocar_numero_visible: false,
            outros_numeros_visible: false,

            novo_numero: "",

        };
    }
}
</script>

<style scoped>
.numero-whats {
    border: 1px solid var(--cor-letra-escuro2);
    padding: 5px;
    border-radius: 5px;
    font-weight: bold;
    font-size: 1.2rem;
    color: var(--cor-letra-escuro2);
    text-align: center;
}
.numero-definido {
    font-size: larger;
    font-weight: bolder;
    padding: 10px;
    padding-top: 40px;
    padding-bottom: 40px;
    background-color: var(--fundo-secundario);
}
.numero-whats:hover, .pesq-change-num p:hover {
    cursor: pointer;
    background: var(--cor-letra-claro);
}

.numero-id-and-pri {
    background: var(--cor-letra-claro);
    text-align: center;
}

.numero-whats {
    height: min-content;
}

.pesq-change-num {
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: stretch;
    justify-content: center;
}

.pesq-change-num p {
    border: 1px solid var(--cor-letra-escuro2);
    border-radius: 5px;
    padding: 5px;
    font-weight: bold;
    color: var(--cor-letra-escuro2);
    text-align: center;
}

.novo-numero {
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: stretch;
    justify-content: center;
}
.novo-numero input {
    font-size: larger;
}

</style>