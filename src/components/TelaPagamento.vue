<template> 
    <div id="paymentcont" class="scroll-brown">
        <div class="payoutsholder grid0-0">
            <div class="paybutton grid1-0b soft-panel" >
                <div> Total Pagamento no Periodo: {{ Payment.totalPagamentos }} </div>
                <button @click="Payment.getPayouts()" :disabled="loadingPO"> recarregar </button>
            </div>
            <div class="payoutscont scroll-brown grid1-1b soft-panel">
                <div v-if="loadingPO" class="loading-indicator">
                    <div class="spinner"></div>
                </div>
                <div v-else class="payoutstableholder">
                    <table>
                        <thead>
                            <tr>
                                <th @click="Payment.sortPoBy('ID')"> ID </th>
                                <th @click="Payment.sortPoBy('DATA')"> DATA </th>
                                <th @click="Payment.sortPoBy('VALOR')"> VALOR </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(pay, index) in payouts" :key="index" class="payoutsinfo" @click="Payment.getPaychecks(index)">
                                <td> {{ pay.pay_id }} </td>
                                <td> {{ pay.data }} </td>
                                <td> {{ pay.total }} </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="payoutscont scroll-brown grid1-2b soft-panel">
                <div class="payoutstableholder">
                    <table>
                        <thead>
                            <tr>
                                <th > TIPO </th>
                                <th > QUEM </th>
                                <th > VALOR </th>
                            </tr>
                        </thead>
                        <tbody v-if="pendingPays">
                            <tr v-for="(pay, index) in pendingPays" :key="index" class="payoutsinfo" @click="Payment.returnPendingPay(index)">
                                <td> {{ pay.borv }} </td>
                                <td> {{ pay.login }} </td>
                                <td> {{ pay.valor }} </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="paybutton grid1-3b soft-panel">
                <button @click="Payment.efetuarPagamento()"> Confirmar Pagamento de {{ Payment.totalPendingPay }}</button>    
            </div>
        </div>
        <div class="paycheckholder grid0-1">
            <div class="pcheader grid1-0">
                <div class="paybutton soft-panel">
                    <div class="pcheaderdatesearch">
                        <span> Periodo de </span>
                        <input v-model="Payment.datas.in" type="date" placeholder="inicio" />
                        <span> a </span>
                        <input v-model="Payment.datas.fi" type="date" placeholder="fim" />
                    </div>
                    <button @click="Payment.getPaychecks()"> Mostrar Pagamentos </button>
                    <button @click="objArrToCSV2(paychecks, excelCol_pc)"> Excel </button>
                </div>
                <button @click="router.go(-1)"> &#10094; </button>
            </div>
            <div class="pcbody grid1-1">
                <div class="beneholder grid2-0">
                    <div class="benecont scroll-brown grid3-0 soft-panel"> 
                        <div v-if="loadingPC" class="loading-indicator">
                            <div class="spinner"></div>
                        </div>
                        <div v-else class="table-holder1"> 
                            <table class="paycheck-table">
                                <thead>
                                    <tr class="tbl-head-head">
                                    <th @click="Payment.sortPcBy('borv')">Tipo</th>
                                    <th @click="Payment.sortPcBy('login')">Login</th>
                                    <th @click="Payment.sortPcBy('pago')">Pago</th>
                                    <th @click="Payment.sortPcBy('valor')">Valor</th>
                                    <th @click="Payment.sortPcBy('listagem')">Qnt Listagem</th>
                                    <th> Listagem </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-for="(pchk) in paychecks.filter(filtrado => filtrado.borv == 'BENE')" :key="pchk.idpc">
                                    <!-- Linha Principal -->
                                    <tr class="tbl-head-body" @dblclick="Payment.moveToPendingPay(pchk.idpc)">
                                        <td> Beneficiario </td>
                                        <td>{{ pchk.login }}</td>
                                        <td :class="[pchk.pago ? 'pchkpago' : 'pchknaopago']">{{ pchk.pago ? 'SIM' : 'NÃO' }}</td>
                                        <td>{{ pchk.valor }}</td>
                                        <td>{{ pchk.listagem.length }}</td>
                                        <td>
                                        <button @click="Payment.toggleExpand(pchk.idpc)">
                                            {{ pchk.expand ? 'Colapsar' : 'Expandir' }}
                                        </button>
                                        </td>
                                    </tr>
                                    <!-- Linha Expandida -->
                                    <tr v-if="pchk.expand" class="expanded-row">
                                        <td colspan="6">
                                        <div class="bene-listagem-cont">
                                            <div class="bene-listagem scroll-brown">
                                                <div class="table-container">
                                                    <table>
                                                        <thead>
                                                            <tr class="tbl-lista-head">
                                                                <th> Venda n° </th>
                                                                <th> Vendedor </th>
                                                                <th> Beneficiario </th>
                                                                <th> Certificado </th>
                                                                <th> Valor Venda </th>
                                                                <th> Despesa </th>
                                                                <th> aliq.Bene. </th>
                                                                <th> aliq.Vend. </th>
                                                                <th> Parte Beneficiario </th>
                                                                <th> Parte Vendedor </th>
                                                                <th> Orteco </th>
                                                                <th> Data </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr class="tbl-lista-body" v-for="(list, listIndex) in pchk.listagem" :key="listIndex">
                                                                <td> {{ list.venda }} </td>
                                                                <td> {{ list.vendedor }}</td>
                                                                <td> {{ list.beneficiario }}</td>
                                                                <td> {{ list.cartao }}</td>
                                                                <td> {{ list.valor }}</td>
                                                                <td> {{ list.despesa }}</td>
                                                                <td> {{ list.bene_pcent }}</td>
                                                                <td> {{ list.vend_pcent }}</td>
                                                                <td> {{ list.vlr_bene }}</td>
                                                                <td> {{ list.vlr_vend }}</td>
                                                                <td> {{ list.vlr_empresa }}</td>
                                                                <td> {{ list.data }}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        </td>
                                    </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="paybutton i2 grid3-1 soft-panel">
                        <div>
                            <div> Beneficiados Pagos: {{ Payment.totalVendasPC[2] }}</div>
                            <div> Beneficiados não Pagos: {{ Payment.totalVendasPC[3] }} </div>
                        </div>
                        <button @click="Payment.moveAllToPendingPay('BENE')"> &#10094; Beneficiados não pagos </button>
                    </div>
                </div>
                <div class="beneholder grid2-1">
                    <div class="benecont scroll-brown grid3-0 soft-panel">
                        <div v-if="loadingPC" class="loading-indicator">
                            <div class="spinner"></div>
                        </div>
                        <div v-else class="table-holder1"> 
                            <table class="paycheck-table">
                                <thead>
                                    <tr class="tbl-head-head">
                                    <th @click="Payment.sortPcBy('borv')">Tipo</th>
                                    <th @click="Payment.sortPcBy('login')">Login</th>
                                    <th @click="Payment.sortPcBy('pago')">Pago</th>
                                    <th @click="Payment.sortPcBy('valor')">Valor</th>
                                    <th @click="Payment.sortPcBy('listagem')">Qnt Listagem</th>
                                    <th> Listagem </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-for="(pchk) in paychecks.filter(filtrado => filtrado.borv == 'VEND')" :key="pchk.idpc">
                                    <!-- Linha Principal -->
                                    <tr class="tbl-head-body" @dblclick="Payment.moveToPendingPay(pchk.idpc)">
                                        <td> Vendedor </td>
                                        <td>{{ pchk.login }}</td>
                                        <td :class="[pchk.pago ? 'pchkpago' : 'pchknaopago']" >{{ pchk.pago ? 'SIM' : 'NÃO' }}</td>
                                        <td>{{ pchk.valor }}</td>
                                        <td>{{ pchk.listagem.length }}</td>
                                        <td>
                                        <button @click="Payment.toggleExpand(pchk.idpc)">
                                            {{ pchk.expand ? 'Colapsar' : 'Expandir' }}
                                        </button>
                                        </td>
                                    </tr>
                                    <!-- Linha Expandida -->
                                    <tr v-if="pchk.expand" class="expanded-row">
                                        <td colspan="6">
                                        <div class="bene-listagem-cont">
                                            <div class="bene-listagem scroll-brown">
                                                <div class="table-container">
                                                    <table>
                                                        <thead>
                                                            <tr class="tbl-lista-head">
                                                                <th> Venda n° </th>
                                                                <th> Vendedor </th>
                                                                <th> Beneficiario </th>
                                                                <th> Certificado </th>
                                                                <th> Valor Venda </th>
                                                                <th> Despesa </th>
                                                                <th> aliq.Bene. </th>
                                                                <th> aliq.Vend. </th>
                                                                <th> Parte Beneficiario </th>
                                                                <th> Parte Vendedor </th>
                                                                <th> Orteco </th>
                                                                <th> Data </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr class="tbl-lista-body" v-for="(list, listIndex) in pchk.listagem" :key="listIndex">
                                                                <td> {{ list.venda }} </td>
                                                                <td> {{ list.vendedor }}</td>
                                                                <td> {{ list.beneficiario }}</td>
                                                                <td> {{ list.cartao }}</td>
                                                                <td> {{ list.valor }}</td>
                                                                <td> {{ list.despesa }}</td>
                                                                <td> {{ list.bene_pcent }}</td>
                                                                <td> {{ list.vend_pcent }}</td>
                                                                <td> {{ list.vlr_bene }}</td>
                                                                <td> {{ list.vlr_vend }}</td>
                                                                <td> {{ list.vlr_empresa }}</td>
                                                                <td> {{ list.data }}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        </td>
                                    </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="paybutton i2 grid3-1 soft-panel">
                        <div>
                            <div> Vendedores Pagos: {{ Payment.totalVendasPC[0] }}</div>
                            <div> Vendedores não Pagos: {{ Payment.totalVendasPC[1] }} </div>
                        </div>
                        <button @click="Payment.moveAllToPendingPay('VEND')"> &#10094; Vendedores não pagos </button>
                    </div>
                </div>
            </div>
            <div class="paybutton grid1-2 soft-panel">
                <div>
                    <div> Total Pago: {{ (Number(Payment.totalVendasPC[0]) + Number(Payment.totalVendasPC[2])).toFixed(2) }} </div>
                    <div> Total não Pago: {{ (Number(Payment.totalVendasPC[1]) + Number(Payment.totalVendasPC[3])).toFixed(2) }} </div>
                </div>
                <button @click="Payment.moveAllToPendingPay('ALL')"> &#10094; Todos os não pagos </button>
            </div>
        </div>
    </div>
</template>

<script>
import Main from '../frontend/scripts/Janelas/main/Main';
import Payment from '../frontend/scripts/Janelas/payment/Payment';
import { prepareObjArrToCSV, generateCSV, numToStr } from '../frontend/scripts/utils';
import router from "@/router";

export default {
	data() {
		return {
            router,
            Main,

            Payment,
            payouts: Payment.payouts_,
            paychecks: Payment.paychecks_,
            pendingPays: Payment.pendingPays_,
            loadingPC: Payment.loadingPC_,
            loadingPO: Payment.loadingPO_,

            excelCol_pc: {
                borv: 'Tipo',
                idpc: 'ID',
                login: 'Pessoa',
                valor: 'Valor Total',
                qnt: 'Quantidade',
                pago: 'Pago'
            },
		};
	},
    methods: {
        objArrToCSV2(a,b){
            let newObjects = [];

            a.forEach(e => {
                newObjects.push({
                    borv: e.borv == 'BENE' ? "beneficiario" : "vendedor",
                    idpc: e.idpc,
                    login: e.login,
                    valor: numToStr(Number(e.valor)),
                    qnt: e.listagem.length,
                    pago: e.pago ? "sim" : "não"
                });
            });


            console.log(this.newObjects);
            const str_header = "inicio;fim\n" + Payment.datas.in + ";" + Payment.datas.fi + "\n\n";
            const str_body = prepareObjArrToCSV(newObjects,b);

            generateCSV(str_header + str_body, "pagamentos");
        },
    }
}
</script>

<style>
@import '../frontend/styles/paymentpage.css';
</style>