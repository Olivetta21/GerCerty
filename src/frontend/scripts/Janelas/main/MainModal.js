import { ref } from "vue";

import Main from "./Main";
import { addToast } from "../../toastNotification";
import { fetchJson } from "../../fetcher";
import { tratarRetornosApi } from "../../commonactions";
import Login from "../login/Login";


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

    static async getCronograma(cert_codi, cert_versao) {
        const data = await fetchJson('/mainpage/getCronograma.php', [{"h":"cert_codi","b":cert_codi}, {"h":"cert_versao","b":cert_versao}]);
        if (data['cronograma']){
            return data['cronograma'];
        }
        return null;
    }

    static async deleteCronograma(cron_id){        
        if (!Login.verifPerm(9, "Deletar um cronograma")) return;

        const data = await fetchJson('/mainpage/deleteCronograma.php', [{"h":"cron_id","b":cron_id}]);

        if (data['success']){
            addToast("Deletar cronograma", "deletado com sucesso!", "success");
            await Main.atualizaCerts([Main.certs[this.cIM].id]);
            Main.addNotification("Deletou cronograma. "+cron_id);
            console.log("deleteCronograma - cuide disso, pesquisa por indice");
        }
        else tratarRetornosApi(data, "Remover um cronograma");
    }

    static async changeVersions(cert_codi, cert_versao, forward){
        const data = await fetchJson('/mainpage/changeVersionCronograma.php',
            [{"h":"cert_codi","b":cert_codi},{"h":"cert_versao","b":cert_versao},{"h":"direction","b":forward}]
        );
    
        if (data['sucess']){
            return data['sucess'];
        }
        else if (data['nenhum']) {
            return false;
        }
        else tratarRetornosApi(data, "Mudar versao do cronograma");
    
        return false;
    }

    static async insertCronDB(cert_codi, cert_versao, tipo, nota) {
        const data = await fetchJson('/mainpage/insertCronDB.php',
            [{"h":"cert_codi","b":cert_codi},{"h":"cert_versao","b":cert_versao},{"h":"type","b":tipo},{"h":"nota","b":nota}]
        );
        if (data['success']){            
            //Recarrega o certificado
            await Main.atualizaCerts([Main.certs[this.cIM].id]);
            return true;
        }
        else tratarRetornosApi(data, "Adicionar um cronograma");
        return false;
    }


    static async attInfosCert(cert_codis){
        if (!Array.isArray(cert_codis)){
            addToast("Atualizar informações do certificado","não é array", "error", true);
            return;
        }

        const data = await fetchJson('/mainpage/getInfosCert.php', [{"h":"cert_codis","b":cert_codis}]);

        if (data["infos"]){
            for (const i of data["infos"]){
                const found = Main.findCertIndex(i.codi);
                if (found > -1) {
                    Main.certs[found].usos = i.revl;
                    Main.certs[found].prbl = i.prbl;
                    Main.certs[found].agnd = i.agnd;
                    Main.certs[found].notf = i.notf;
                }
            }
        }
        else if (data['nenhum']) {
            console.log("AttInfosCert", "nenhum dado");
        }
        else tratarRetornosApi(data, "attInfosCert");        
    }

    static async attCronOnCert(cert_codis) {
        if (!Array.isArray(cert_codis)){
            addToast("Att crono","Precisa ser uma array!", "error", true);   
            return;
        }

        await this.attInfosCert(cert_codis);

        
        let areLooking = cert_codis.findIndex(cc => (Main.certs[this.cIM] && cc === Main.certs[this.cIM].id)); //se o usuario estiver olhando para um cronograma, renovalo; senao, apenas deletar
        if (areLooking > -1){
            areLooking = cert_codis.splice(areLooking, 1)[0];
        }
        else areLooking = 'nao';
        
        for (const cc of cert_codis){
            let found = Main.findCertIndex(cc);

            if (found > -1){
                Main.certs[found].crono = null;
            }
        }
        if (areLooking === 'nao') return;
        
        let crtIndx = Main.findCertIndex(areLooking);
        if (crtIndx < 0) return;

        //o objetivo aqui é capturar os cronogramas somente do modal aberto, e deixar os outros pra depois.
        this.loadingModalCron = true;
        try {
            const cronograma_ = await this.getCronograma(Main.certs[crtIndx].id, Main.certs[crtIndx].versao);

            //console.log('dentro de opencertificado:' , cronograma_);

            if (cronograma_) {
                Main.certs[crtIndx].crono = cronograma_;                           
            }
            else {
                Main.certs[crtIndx].crono = null;
                addToast("MainModal/attCronOnCert", "nenhum cronograma para essa versao", "error");
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
        if (Main.certs[crtIndx].crono) {
            console.warn("certificado ja com cronograma, cancelando query");   
            return;
        }
        /*
        certToShow: {
        id: 0, nome: 'null', local: '', venc: '0000-00-00', respRFB: '', usos: 0, notf: 0, agnd: 0, prbl: 0,
        crono: [{id: 0, c_codi: 0, c_ver: 0, type: '', user: '', nota: '', data: '0000-00-00'}]
        */

        //certificado:
        //id: 0, usos: 0, nome: 'null', venc: '0000-00-00', notf: 0, agnd: 0, prbl: 0

        this.attCronOnCert([Main.certs[this.cIM].id]);                    
    }

    static async changeVersaoReOpen(crtIndx, direction) {        
        this.loadingModalCron = true;
        try {
            const newVersion = await this.changeVersions(Main.certs[crtIndx].id, Main.certs[crtIndx].versao, direction);

            //console.log('newVersion' , newVersion);

            if (newVersion) {
                Main.certs[crtIndx].versao = newVersion;  
                await this.attCronOnCert([Main.certs[crtIndx].id]);                          
            }
            else {
                addToast("Cronograma", "nenhum cronograma encontrado", "warn");
            }
        } catch (error) {
            addToast("MainModal/changeVersaoReOpen", "error", "error");
        }
       
        this.loadingModalCron = false;
    }

    static async revelarLocal() {
        if (!Login.verifPerm(8, "Ver local do certificado")) return;
        
        const crt_index = this.cIM;
        
        Main.certs[crt_index].localRevelado = 'carregando';

        //Tenta adicionar o cronograma de visualização
        try {
            const result = await this.insertCronDB(Main.certs[crt_index].id, Main.certs[crt_index].versao, "REVL", "");   
            Main.certs[crt_index].localRevelado = 'carregando'; //denovo porque a função acima remove essa variavel     
            //se o cronograma foi adicionado com sucesso...
            if (result) {
                const data = await fetchJson('/mainpage/getLocalCertificado.php', [{"h":"cert_codi","b":Main.certs[crt_index].id}]);
                if (data['local']){
                    Main.certs[crt_index].local = data['local'];
                    Main.certs[crt_index].localRevelado = true;
                    Main.addNotification("Revelou:"+Main.certs[crt_index].id);
                    return;
                }
                else tratarRetornosApi(data, "Buscar local");
            }
        } catch (error) {
            addToast("MainModal/revelarLocal", "erro no addREVL", "error");
            console.log("MainModal/revelarLocal", error);
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
        switch (this.cronTitulo) {
            case 'AGND':{
                if (!Login.verifPerm(6, "Fazer um agendamento")) return;
                break;
            }
            case 'NOTF':{
                if (!Login.verifPerm(7, "Notificar cliente")) return;
                break;
            }
        }
        
        const resultado = await this.insertCronDB(Main.certs[this.cIM].id, Main.certs[this.cIM].versao, this.cronTitulo, this.cronNota);

        if (resultado === true) {
            Main.addNotification("Ins. Cron. "+this.cronTitulo+" em "+Main.certs[this.cIM].id);
            addToast("Cronograma", "adicionado!", "success");
        }
        else {
            addToast("Cronograma", "erro ao adicionar", "error");
        }

        this.closeCronAdder();
        console.log("addCronograma - cuide disso, pesquisa por indice");
    }
}

export default MainModal;