import { ref } from "vue";

import Main from "./Main";
import { getCronograma, changeVersions, insertCronDB } from '../../Certificados/Cronograma';
import { getCertificadosCodigos } from '../../Certificados/Getters';
import { addToast } from "../../toastNotification";

class MainModal {
    //Principal
    static _isModalVisible = ref(false);
    static _loadingModal = ref(false);
    static _loadingModalCron = ref(false);
    static _cIM = ref(-1);

    static set isModalVisible(arg) {this._isModalVisible.value = arg}
    static set loadingModalCron(arg) {this._loadingModalCron.value = arg}
    static set loadingModal(arg) {this._loadingModal.value = arg}
    static set cIM(arg) {this._cIM.value = arg}

    static get isModalVisible_() {return this._isModalVisible}
    static get isModalVisible() {return this._isModalVisible.value}
    static get loadingModalCron_() {return this._loadingModalCron}
    static get loadingModalCron() {return this._loadingModalCron.value}
    static get loadingModal_() {return this._loadingModal}
    static get loadingModal() {return this._loadingModal.value}
    static get cIM_() {return this._cIM}
    static get cIM() {return this._cIM.value}

    //Cron Adder
    static _cronTitulo = ref("");
    static _cronNota = ref("");
    static _isCronAdderVisible = ref(false);

    static set cronTitulo(arg) {this._cronTitulo.value = arg}
    static set cronNota(arg) {this._cronNota.value = arg}
    static set isCronAdderVisible(arg) {this._isCronAdderVisible.value = arg}

    static get cronTitulo_() {return this._cronTitulo}
    static get cronTitulo() {return this._cronTitulo.value}
    static get cronNota_() {return this._cronNota}
    static get cronNota() {return this._cronNota.value}
    static get isCronAdderVisible_() {return this._isCronAdderVisible}
    static get isCronAdderVisible() {return this._isCronAdderVisible.value}



    static async attCronOnCert(crtIndx) {
        this.loadingModalCron = true;

        try {
            const cronograma_ = await getCronograma(Main.certs[crtIndx].id, Main.certs[crtIndx].versao);

            //console.log('dentro de opencertificado:' , cronograma_);

            if (cronograma_) {
                Main.certs[crtIndx].crono = cronograma_;                           
            }
            else {
                Main.certs[crtIndx].crono = null;
                addToast("MainModal/attCronOnCert", "getCronograma não retornou nada?", "error");
            }

        } catch (error) {
            addToast("MainModal/attCronOnCert", "erro no getCronograma", "error");
        } finally {
            this.loadingModalCron = false;
        }
    }

    static async openCertificado(crtIndx) {
        this.cIM = crtIndx;        
        this.isModalVisible = true;
        
        //se esse certificado ja conter o cronograma, nao realizar o query
        if (Main.certs[crtIndx].crono) return;
        /*
        certToShow: {
        id: 0, nome: 'null', local: '', venc: '0000-00-00', respRFB: '', usos: 0, notf: 0, agnd: 0, prbl: 0,
        crono: [{id: 0, c_codi: 0, c_ver: 0, type: '', user: '', nota: '', data: '0000-00-00'}]
        */

        //certificado:
        //id: 0, usos: 0, nome: 'null', venc: '0000-00-00', notf: 0, agnd: 0, prbl: 0

        this.attCronOnCert(crtIndx);                    
    }

    static async changeVersaoReOpen(crtIndx, direction) {        
        this.loadingModalCron = true;
        try {
            const newVersion = await changeVersions(Main.certs[crtIndx].id, Main.certs[crtIndx].versao, direction);

            //console.log('newVersion' , newVersion);

            if (newVersion) {
                Main.certs[crtIndx].versao = newVersion;                           
            }
            else {
                addToast("MainModal/changeVersaoReOpen", "Versão não encontrada.", "error");
            }

        } catch (error) {
            addToast("MainModal/changeVersaoReOpen", "error", "error");
        }

        await this.attCronOnCert(crtIndx);        
        this.loadingModalCron = false;
    }

    static async revelarLocal() {
        const crt_index = this.cIM;
        
        Main.certs[crt_index].localRevelado = 'carregando';

        //Tenta adicionar o cronograma de visualização
        try {
            const result = await insertCronDB(Main.certs[crt_index].id, "REVL", "sem notas");

            //console.warn("retorno de addREVL", result);
            
            //se o cronograma foi adicionado com sucesso...
            if (result) {

                //Recupera o certificado novamente
                try {
                    const certs = await getCertificadosCodigos(Main.certs[crt_index].id);

                    //console.warn("retorno de getCertCodi", certs);
                    
                    if (certs) {
                        //encontra o indice do certificado, tanto da consulta (ele retorna um array) quanto do vetor principal.
                        const correct_crt = certs.findIndex(cert => cert.id === Main.certs[crt_index].id);
                        const modal_crt = Main.certs.findIndex(cert => cert.id === Main.certs[crt_index].id);

                        if (correct_crt >= 0 && modal_crt >= 0) {
                            Main.certs[modal_crt] = certs[correct_crt];
                            this.attCronOnCert(crt_index); 
                            Main.certs[crt_index].localRevelado = true;
                            return;
                        }
                        else {
                            addToast("MainModal/revelarLocal", "o certificado " + Main.certs[crt_index].id + " nao foi encontrado em correct ou modal", "error");
                        }
                    
                    }
                    else {
                        addToast("MainModal/revelarLocal", "getCertificadosCodigos não retornou nada?", "error");
                    }

                } catch (error) {
                    addToast("MainModal/revelarLocal", "erro no getCertificadosCodigos", "error");
                }
            }
            else {
                addToast("MainModal/revelarLocal", "addREVL não autorizou", "error");
            }

        } catch (error) {
            addToast("MainModal/revelarLocal", "erro no addREVL", "error");
        }

        
        Main.certs[crt_index].localRevelado = false;
    }

    static switchModal() {
        this.isModalVisible = !this.isModalVisible;
    }

    static closeCronAdder(){
        this.isCronAdderVisible = false;
        this.cronTitulo = "";
        this.cronNota = "";
    }

    static async showCronAdder(tipo){
        this.cronTitulo = tipo;
        this.cronNota = "";

        this.isCronAdderVisible = true;
    }

    static async addCronograma(){
        if (await insertCronDB(Main.certs[this.cIM].id, this.cronTitulo, this.cronNota) === true) addToast("Cronograma", "adicionado!", "success");
        else (addToast("Cronograma", "erro ao adicionar", "error"))

        this.closeCronAdder();
        Main.atualizaCerts([Main.certs[this.cIM].id]);
    }
}

export default MainModal;