import { ref } from "vue";
import Janela from "../Janela";

import { addToast } from "../../toastNotification";
import { fetchJson } from "../../fetcher";
import { getMonthInterval } from "../../utils";
import { tratarRetornosApi } from "../../commonactions";

class Payment extends Janela {
    static nome = 'Pagamento';

    static _payouts = ref([]);
    static _paychecks = ref([]);
    static _pendingPays = ref([]);
    static _loadingPC = ref(false);
    static _loadingPO = ref(false);
    static _datas = ref({
        in: getMonthInterval(new Date(Date.now()), true),
        fi: getMonthInterval(new Date(Date.now()), false)
    });

    static get payouts_(){return this._payouts}
    static get payouts(){return this._payouts.value}
    
    static get paychecks_(){return this._paychecks}
    static get paychecks(){return this._paychecks.value}

    static get pendingPays_(){return this._pendingPays}
    static get pendingPays(){return this._pendingPays.value}

    static get loadingPC_(){return this._loadingPC}
    static get loadingPC(){return this._loadingPC.value}
    static get loadingPO_(){return this._loadingPO}
    static get loadingPO(){return this._loadingPO.value}

    static get datas_(){return this._datas}
    static get datas(){return this._datas.value}

    static get totalPagamentos(){
        let total = 0;
        this.payouts.forEach(a => {
            total += Number(a.total);
        });

        return total.toFixed(2);    
    }

    static get totalPendingPay(){
        let total = 0;
        this.pendingPays.forEach(a => {
            total += Number(a.valor);
        });

        return total.toFixed(2);
    }

    static get totalVendasPC(){
        let totalVP = 0;
        let totalVN = 0;
        let totalBP = 0;
        let totalBN = 0;

        this.paychecks.forEach(a => {
            if (a.borv === 'VEND'){
                if (a.pago) totalVP += Number(a.valor);
                else totalVN += Number(a.valor);
            }
            else {
                if (a.pago) totalBP += Number(a.valor);
                else totalBN += Number(a.valor);
            }
        });

        return [totalVP.toFixed(2),totalVN.toFixed(2),totalBP.toFixed(2),totalBN.toFixed(2)];
    }

    static set payouts(arg){this._payouts.value = arg}
    static set paychecks(arg){this._paychecks.value = arg}
    static set pendingPays(arg){this._pendingPays.value = arg}
    static set loadingPC(arg){this._loadingPC.value = arg}
    static set loadingPO(arg){this._loadingPO.value = arg}

    
    static entrando(){
        this.getPayouts();
        this.getPaychecks();
    }

    static saindo() {

    }

    static async getPayouts(){
        this.loadingPO = true;
        const data = await fetchJson('/pagamentospage/getPayouts.php', null);
        
        if (data['payouts']){
            this.payouts = data['payouts'];
            this.loadingPO = false;
            return;
        }
        else tratarRetornosApi(data, "getPayouts");

        
        this.payouts = [];
        this.loadingPO = false;
    }


    static async getPaychecks(idxPagto){
        this.loadingPC = true;
        this.pendingPays = [];
        let dados = {"h":null,"b":null};

        if (idxPagto != null) {  //recebe um indice do payouts
            if (this.payouts[idxPagto].listagem) { //se ja estiver na memoria, nao fazer o query
                this.paychecks = this.payouts[idxPagto].listagem;
                this.loadingPC = false;
                return;
            }
            else {
                dados.h = 'id_pagto';
                dados.b = [this.payouts[idxPagto].pay_id]; //converte o dados em um parametro apropriado com o id do pagamento
            }
        }
        else {
            dados.h = 'data_venda';
            dados.b = [this.datas.in, this.datas.fi];
        }

        const data = await fetchJson('/pagamentospage/getVendas.php', [dados]);
        if (data['paychecks']){
            this.paychecks = data['paychecks'];

            if (idxPagto != null){
                this.payouts[idxPagto].listagem = data['paychecks'];
            }

            this.loadingPC = false;
            return;
        }
        else tratarRetornosApi(data, "getPaychecks");

        this.paychecks = [];
        this.loadingPC = false;
    }


    static toggleExpand(idpc) {
        const idx = this.paychecks.findIndex(pc => pc.idpc == idpc);
        if (idx < 0){
            return;
        }
        this.paychecks[idx].expand = !this.paychecks[idx].expand;
    }

    static moveToPendingPay(idpc){
        const idx = this.paychecks.findIndex(pc => pc.idpc == idpc);
        if (idx < 0 || this.paychecks[idx].pago){
            addToast("Mover para lista de pagamentos", "só é possivel mover o item que ainda não foi pago!", "error");
            return;
        }

        this.pendingPays.push(this.paychecks.splice(idx, 1)[0]);
    }

    static moveAllToPendingPay(type){
        let pends = [];
        this.paychecks.forEach((a, index) => {
            if (!a.pago && (type === 'ALL' || a.borv === type)) pends.push(index);
        });

        const tam = pends.length;
        for (let i = tam-1; i >= 0; i--){
            this.pendingPays.push(this.paychecks.splice(pends[i], 1)[0]);
        }
    }

    static returnPendingPay(idx){
        this.paychecks.push(this.pendingPays.splice(idx, 1)[0]);
    }

    //Ordenação dos PayOuts
    static poAscendingOrder = {'ID':true, 'DATA':true, 'VALOR':true}
    static sortPoBy(col){
        const asc = (this.poAscendingOrder.col = !this.poAscendingOrder.col);

        switch (col){
            case 'ID':{
                if (asc) this.payouts.sort((a, b) => a.pay_id - b.pay_id);
                else this.payouts.sort((b, a) => a.pay_id - b.pay_id);
                break
            }
            case 'DATA':{
                if (asc) this.payouts.sort((a, b) => a.data.localeCompare(b.data));
                else this.payouts.sort((b, a) => a.data.localeCompare(b.data));
                break
            }
            case 'VALOR':{
                if (asc) this.payouts.sort((a, b) => a.total - b.total);
                else this.payouts.sort((b, a) => a.total - b.total);
                break
            }
        }
    }

    //Ordenação dos PayChecks
    static pcAscendingOrder = {'borv':true,'login':true,'pago':true,'valor':true,'listagem':true}
    static sortPcBy(col){
        this.loadingPC = true;
        const asc = (this.pcAscendingOrder.col = !this.pcAscendingOrder.col);

        switch (col){
            case 'borv':{
                if (asc) this.paychecks.sort((a, b) => a.borv.localeCompare(b.borv));
                else this.paychecks.sort((b, a) => a.borv.localeCompare(b.borv));
                break
            }
            case 'login':{
                if (asc) this.paychecks.sort((a, b) => a.login.localeCompare(b.login));
                else this.paychecks.sort((b, a) => a.login.localeCompare(b.login));
                break
            }
            case 'pago':{
                if (asc) this.paychecks.sort((a, b) => a.pago - b.pago);
                else this.paychecks.sort((b, a) => a.pago - b.pago);
                break
            }
            case 'valor':{
                if (asc) this.paychecks.sort((a, b) => a.valor - b.valor);
                else this.paychecks.sort((b, a) => a.valor - b.valor);
                break
            }
            case 'listagem':{
                if (asc) this.paychecks.sort((a, b) => a.listagem.length - b.listagem.length);
                else this.paychecks.sort((b, a) => a.listagem.length - b.listagem.length);
                break
            }
        }
        
        this.loadingPC = false;
    }

    static async efetuarPagamento(){
        if (this.pendingPays.length < 1) {
            addToast("Efetuar pagamento", "não há nada na lista de pagamentos!", "error");
            return;
        }


        let vendPays = [];
        this.pendingPays.filter(filtrado => filtrado.borv == 'VEND').forEach(vp => {
            vp.listagem.forEach(l => {
                vendPays.push(Number(l.venda));
            });
        });

        let benePays = [];
        this.pendingPays.filter(filtrado => filtrado.borv == 'BENE').forEach(bp => {
            bp.listagem.forEach(l => {
                benePays.push(Number(l.venda));
            });
        });

        console.log("vendPays", vendPays);
        console.log("benePays", benePays);

        const data = await fetchJson('/pagamentospage/insertPagamentoDB.php',
        [{"h":"vendPays","b":vendPays},{"h":"benePays","b":benePays}]);

        if (data['success']) addToast("Pagamento", "pagamento realizado com sucesso!", "success");
        else tratarRetornosApi(data, "Efetuar pagamento");

        this.getPayouts();
        this.getPaychecks();
    }

}

export default Payment;