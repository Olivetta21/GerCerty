import { ref } from 'vue';

//import { startGeneralTour } from './shepHerdTour';

import Janela from '../Janela';
import MainModal from './MainModal';
import { addToast } from '../../toastNotification';
import { fetchJson } from '../../fetcher';
import { tratarRetornosApi } from "../../commonactions";
import { floatData } from '../../utils';
//import { formatarData } from '../utils';

class Main extends Janela {
    static nome = 'Principal';
    static _opcaoVisivel = ref(false);
    static _loadingCert = ref(false);
    static _startDate = ref(floatData(-20));
    static _endDate = ref(floatData(30));
    static _nomeCert = ref('');
    static _codiCert = ref('');
    static _certs = ref([]);
    static _typeSearch = ref(0);
    static _notifications = ref([]);


    //getters
    static get opcaoVisivel_() {return this._opcaoVisivel}
    static get opcaoVisivel() {return this._opcaoVisivel.value}

    static get loadingCert_() {return this._loadingCert}
    static get loadingCert() {return this._loadingCert.value}
    
    static get startDate_() {return this._startDate}
    static get startDate() {return this._startDate.value}
    
    static get endDate_() {return this._endDate}
    static get endDate() {return this._endDate.value}
    
    static get nomeCert_() {return this._nomeCert}
    static get nomeCert() {return this._nomeCert.value}
    
    static get codiCert_() {return this._codiCert}
    static get codiCert() {return this._codiCert.value}

    static get certs_() {return this._certs}
    static get certs() {return this._certs.value}

    static get typeSearch() {return this._typeSearch.value}
    static get typeSearchNome() {
        let nome = '';
        switch (this.typeSearch) {
            case 0: nome = 'nome'; break;
            case 1: nome = 'data'; break;
            case 2: nome = 'codi'; break;
        }
        return nome;
    }

    static get notifications_() {return this._notifications}
    static get notifications() {return this._notifications.value}
    //#getters

    //setters
    static set opcaoVisivel(arg) {this._opcaoVisivel.value = arg}
    static set loadingCert(arg) {this._loadingCert.value = arg}
    static set startDate(arg) {this._startDate.value = arg}
    static set endDate(arg) {this._endDate.value = arg}
    static set typeSearch(arg) {this._typeSearch.value = arg}
    static set nomeCert(arg) {this._nomeCert.value = arg}
    static set codiCert(arg) {this._codiCert.value = arg}
    static set certs(arg) {this._certs.value = arg}
    static set notifications(arg) {this._notifications.value = arg}
    //#setters

    static entrando() {
        console.log('Janela principal foi aberta.');
    }
  
    static saindo() {
        console.log('Janela principal foi fechada.');
    }

    static swOpcaoVisivel() {
        this.opcaoVisivel = !this.opcaoVisivel;
    }

    static swTypeSearch() {
        if (this.typeSearch + 1 > 2) this.typeSearch = 0;
        else this.typeSearch++;
    }
    

    static async getCertificadosCodigos(codigos) {
        if (!Array.isArray(codigos)) {
            addToast("getCertificadosCodigos", "o parametro: " + codigos + " não é um array!", "error");
            return null;
        }
        if (codigos.length < 1){
            addToast("Certificados por Codigo", "vazio", "error");
            return null;
        } 

        const data = await fetchJson('/mainpage/getCertificado.php', [{"h":"cert_codis", "b":codigos}]);
    
        if (data['certificados']){
            return data['certificados'];
        }
        else tratarRetornosApi(data, "Pesquisar por codigo");
    
        return null;
    }

    static async prepareAndGetCertCodigos() {
        const vetorCods =  this.codiCert.split(";").map(num => parseFloat(num)).filter(num => !isNaN(num));

        return this.getCertificadosCodigos(vetorCods);
    }

    static async getCertificadosNome() {
        const data = await fetchJson('/mainpage/getCertificado.php', [{"h":"nome_cert", "b":this.nomeCert}]);
    
        if (data['certificados']){
            return data['certificados'];
        }
        else tratarRetornosApi(data, "Pesquisar por nome");
        
        return null;
    }

    static async getCertificadosData() {
        if (this.startDate && this.endDate) {
            if (this.startDate > this.endDate) {
                addToast("Pesquisar Por Data", "A data de término deve ser posterior à data de início.", "error");
                return null;
            }
        } else {
            addToast("Pesquisar Por Data", "Por favor, defina ambas as datas.", "warn");
            return null;
        }
    
        const data = await fetchJson('/mainpage/getCertificado.php', [{"h":"intervData", "b":[this.startDate, this.endDate]}]);
    
        if (data['certificados']){
            return data['certificados'];
        }
        else tratarRetornosApi(data, "Pesquisar por data");
        
        return null;
    }

    static async setCertificados() {        
        this.loadingCert = true;      

        try {
            this.certs = [];
            
            let certs = null;
            switch (this.typeSearch) {
                case 0: certs = await this.getCertificadosNome(); break;
                case 1: certs = await this.getCertificadosData(); break;
                case 2: certs = await this.prepareAndGetCertCodigos(); break;
            }

            if (certs) {
                this.certs = certs;
                Main.addNotification("Pesquisa por "+this.typeSearchNome+". "+this.certs.length+" resultados.");
            }

        } catch (error) {
            addToast("MainPage/setCertificados","erro no getCertificado", "error");
        }
        
        this.loadingCert = false;
    }

    
    static findCertIndex(codi) {
        if (Array.isArray(this.certs)) return this.certs.findIndex(c => c.id === codi);
        return -1;
    }

    static async atualizaCerts(certs_cods) {        
        if (this.certs.length < 1 || certs_cods.length < 1) return;
        
        try {
            const certs = await this.getCertificadosCodigos(certs_cods);

            if (certs) {
                certs.forEach(crt => {
                    const found = this.findCertIndex(crt.id); // Procura pelo certificado

                    if (found > -1){
                        this.certs[found] = crt;
                    }
                });                            
            }           
        } catch (error) {
            addToast("MainPage/atualizaCerts","erro no atualizaCerts", "error");
        }

        if (MainModal.isModalVisible) {  //Se tiver algum certificado aberto, recarrega-lo
            MainModal.openCertificado(MainModal.cIM);
        }
    }


    //Ordenar os certificados;
    static certAcendingOrder = {'id':true, 'usos':true, 'nome':true, 'venc':true, 'notf':true, 'agnd':true, 'prbl':true};
    static sortCertBy(col){
        this.loadingCert = true;
        let asc = (this.certAcendingOrder.col = !this.certAcendingOrder.col);

        switch (col){
            case 'id':{
                if (asc) this.certs.sort((a, b) => a.id - b.id);
                else this.certs.sort((b, a) => a.id - b.id);
                break
            }
            case 'usos':{
                if (asc) this.certs.sort((a, b) => a.usos - b.usos);
                else this.certs.sort((b, a) => a.usos - b.usos);
                break
            }
            case 'nome':{
                if (asc) this.certs.sort((a, b) => a.nome.localeCompare(b.nome));
                else this.certs.sort((b, a) => a.nome.localeCompare(b.nome));
                break
            }
            case 'venc':{
                if (asc) this.certs.sort((a, b) => a.venc.localeCompare(b.venc));
                else this.certs.sort((b, a) => a.venc.localeCompare(b.venc));
                break
            }
            case 'notf':{
                if (asc) this.certs.sort((a, b) => a.notf - b.notf);
                else this.certs.sort((b, a) => a.notf - b.notf);
                break
            }
            case 'agnd':{
                if (asc) this.certs.sort((a, b) => a.agnd - b.agnd);
                else this.certs.sort((b, a) => a.agnd - b.agnd);
                break
            }
            case 'prbl':{
                if (asc) this.certs.sort((a, b) => a.prbl - b.prbl);
                else this.certs.sort((b, a) => a.prbl - b.prbl);
                break
            }
        }

        this.loadingCert = false;
    }



    static addNotification(texto) {   
        if (this.notifications.unshift(texto) > 20) this.notifications.splice(20);        
    }

}

export default Main;