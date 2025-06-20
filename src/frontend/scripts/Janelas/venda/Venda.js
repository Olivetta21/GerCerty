import { ref } from "vue";
import Janela from "../Janela";
import { fetchJson } from "../../fetcher";
import { addToast } from "../../toastNotification";
import Login from "../login/Login";
import { formatarData } from "../../utils";
import { tratarRetornosApi } from "../../commonactions";

class Venda extends Janela {
    static nome = 'Venda';

    static _tipoConsult = ref(1);
    static _certNomePesq = ref('');
    static _certs = ref(null);
    static _certsLoading = ref(false);

    static get tipoConsult_(){return this._tipoConsult}
    static get tipoConsult(){return this._tipoConsult.value}
    static get tipoConsultName(){
        switch (this.tipoConsult) {
            case 1: return 'Agendados';
            case 2: return 'Notificados';
            case 3: return 'Nome';
            default: return 'indefinido';
        }
    }
    static get certNomePesq_(){return this._certNomePesq}
    static get certNomePesq(){return this._certNomePesq.value}
    static get certs_(){return this._certs}
    static get certs(){return this._certs.value}
    static get certsLoading_(){return this._certsLoading}
    static get certsLoading(){return this._certsLoading.value}

    static set tipoConsult(arg){this._tipoConsult.value = arg}
    static set certs(arg){this._certs.value = arg}
    static set certsLoading(arg){this._certsLoading.value = arg}
    
    static entrando(){
        this.clsInfoVenda();
    }

    static saindo() {

    }

    static _InfoVenda = ref({
        loading: false,
        isVending: false,

        vendedor: null,
        nomeVend: '',
        cron_agnd_id: null,
        nomeBene: '',

        aliqVend: 0,
        aliqBene_: 0,
        vlrDeVenda: 0,
        vlrDaDespesa: 0,
        get aliqBene(){return this.cron_agnd_id ? this.aliqBene_ : 0},
        set aliqBene(arg){this.aliqBene_ = arg},

        certCodi: 0,
        certNome: 'nenhum certificado selecionado',
        certVersao: -1,
        actVenc: '9999-99-99',
        notaCert: 'sem notas',
        initValid: formatarData(new Date(Date.now())),
        periodoValid: 1,
        newVenc_: '9999-99-99',
        get newVenc() {
            let now = new Date(this.initValid);
            now.setFullYear(now.getFullYear() + this.periodoValid);
            return formatarData(now);
        },
        newLoca: ''
    });

    static clsInfoVenda(){
        this.InfoVenda.isVending = false,

        this.InfoVenda.vendedor = '',
        this.InfoVenda.nomeVend = '',
        this.InfoVenda.aliqVend = 0,

        this.InfoVenda.cron_agnd_id = null,
        this.InfoVenda.nomeBene = '',
        this.InfoVenda.aliqBene = 0,
        this.InfoVenda.certCodi = -1,
        this.InfoVenda.certNome = '',
        this.InfoVenda.certVersao = -1,
        this.InfoVenda.actVenc = '9999-99-99',
        this.InfoVenda.notaCert = 'sem notas',
        this.InfoVenda.initValid = formatarData(new Date(Date.now())),
        this.InfoVenda.newVenc_ = '9999-99-99',
        this.InfoVenda.newLoca = ''
    }
    
    static get InfoVenda_() {return this._InfoVenda}
    static get InfoVenda() {return this._InfoVenda.value}

    static loadInfoVenda(index) {
        this.InfoVenda.isVending = true,

        this.InfoVenda.vendedor = Login.login;
        this.InfoVenda.nomeVend = Login.USERNAME;
        this.InfoVenda.aliqVend = Login.aliqVend;

        this.InfoVenda.cron_agnd_id = this.certs[index]['cron_agnd_id'];
        this.InfoVenda.nomeBene = this.certs[index]['nomebene'];
        this.InfoVenda.aliqBene = this.certs[index]['bene_comiss'];
        this.InfoVenda.certCodi = this.certs[index]['codi'];
        this.InfoVenda.certNome = this.certs[index]['nome'];
        this.InfoVenda.certVersao = this.certs[index]['versao'];
        this.InfoVenda.actVenc = this.certs[index]['vencimento'];
        this.InfoVenda.notaCert = this.certs[index]['nota'];
        this.InfoVenda.newLoca = this.certs[index]['local'];
    }

    
    static validateDecimal(inputValue) {
        const regex = /^\d+(\.\d{0,2})?$/; // Permite números com até 2 casas decimais
        if (!regex.test(this.InfoVenda[inputValue])) {
            this.InfoVenda[inputValue] = this.InfoVenda[inputValue].toString().slice(0, -1);
        }            
        if (this.InfoVenda[inputValue] > 999.99) this.InfoVenda[inputValue] = 999.99;
    }

    static switchSearchType(){
        if (this.tipoConsult + 1 > 3) this.tipoConsult = 1;
        else this.tipoConsult++;
    }

    static async searchCert(){
        let tipo = '';
        this.certsLoading = true;

        switch (this.tipoConsult){
            case 1:{
                tipo = {"head":"AGND"};
                break;
            }
            case 2:{
                tipo = {"head":"NOTF"};
                break;
            }
            case 3:{
                tipo = {"head":"PESQ", "body":this.certNomePesq};
                break;
            }
        }

        const data = await fetchJson('/vendapage/getCerts.php', [{"h":"TIPO","b":tipo}]);

        if (data['success']){
            this.certs = data['success'];
            this.certsLoading = false;
            return;
        }
        else tratarRetornosApi(data, "Buscar certificados");

        this.certs = null;
        this.certsLoading = false;
    }


    static async vender(){
        this.InfoVenda.loading = true;

        const data = await fetchJson('/vendapage/insertVendaDB.php', [
            {"h":"vendcomiss","b":this.InfoVenda.aliqVend},
            {"h":"cert","b":this.InfoVenda.certCodi},
            {"h":"versao","b":this.InfoVenda.certVersao},
            {"h":"valor","b":this.InfoVenda.vlrDeVenda},
            {"h":"despesa","b":this.InfoVenda.vlrDaDespesa},
            {"h":"newvenc","b":this.InfoVenda.newVenc},
            {"h":"newloca","b":this.InfoVenda.newLoca},
            {"h":"cron_agnd_id","b":this.InfoVenda.cron_agnd_id},
            {"h":"benecomiss","b":this.InfoVenda.aliqBene}
        ]);

        if (data['success']){
            addToast("VENDA", "venda realizada com sucesso!", "success");
            this.clsInfoVenda();
            this.searchCert();

        }
        else tratarRetornosApi(data, "Realizar venda");
        
        this.InfoVenda.loading = false;
    }
}


export default Venda;