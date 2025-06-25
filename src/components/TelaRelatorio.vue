<template>
    <div id="relatorioholder">
        <div class="agndvenda scroll-brown">
            <div class="intervdatarelatorio">
                <button class="whitesoftshadow" @click="router.go(-1)"> &#10094; </button>
                <div class="whitesoftshadow">
                    <span> Seus dados de </span>
                    <input v-model="Relatorio.datas.in" type="date" placeholder="inicio" />
                    <span> a </span>
                    <input v-model="Relatorio.datas.fi" type="date" placeholder="fim" />
                </div>
            </div>
            <div class="blockwtitleatable agendsfeitos whitesoftshadow">
                <div class="agndfeitosearch">
                    <p> Agendamentos feito por você </p>
                    <button @click="Relatorio.setRelAgBeFi()"> Mostrar </button>
                    <p> </p>
                </div>
                <div class="agndfeitotable scroll-brown"> 
                    <div class="reltblcont">
                        <table>
                            <thead>
                                <tr>
                                    <th> Certificado </th>
                                    <th> Versao </th>
                                    <th> Data </th>
                                    <th> Venda </th>
                                    <th> Lucro </th>
                                    <th> Pago </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="[rt.pago ? 'underline-green' : rt.venda ? 'underline-orange' : 'underline-red']" v-for="(rt, index) in Relatorio.agndsRealizados" :key="index">
                                    <td> {{ rt.cert }} </td>
                                    <td> {{ rt.versao }} </td>
                                    <td> {{ rt.data }} </td>
                                    <td> {{ rt.venda }} </td>
                                    <td> {{ rt.lucro }} </td>
                                    <td> {{ rt.pago ? '✔' : ''}} </td>
                                </tr>
                            </tbody>
                        </table>    
                    </div>
                </div>
            </div>
            <div class="blockwtitleatable pagtorecebido whitesoftshadow">
                <div class="agndfeitosearch">
                    <p> Historico dos seus pagamentos </p>
                    <button @click="Relatorio.setRelPaFeBe()"> Mostrar </button>
                    <p> </p>
                </div>
                <div class="agndfeitotable scroll-brown"> 
                    <div class="reltblcont">
                        <table>
                            <thead>
                                <tr>
                                    <th> ID </th>
                                    <th> Data </th>
                                    <th> Valor </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(rt, index) in Relatorio.pagtosRecebidos" :key="index" @click="Relatorio.setRelAgBeFi(rt.id)">
                                    <td> {{ rt.id }} </td>
                                    <td> {{ rt.data }} </td>
                                    <td> {{ rt.valor }} </td>
                                </tr>
                            </tbody>
                        </table>    
                    </div>
                </div>
            </div>
        </div>
        <div v-if="Login.verifPerm(4)" class="relgraficoscont scroll-brown">
            <div class="whitesoftshadow bmv">
                <p> Ações mais executadas </p>
                <div>
                    <canvas ref="cronoMaisExecutados"> </canvas> 
                </div>
            </div>

            <div class="whitesoftshadow bmv">
                <p> Top 20 certificados mais visualizados </p>
                <div>
                    <canvas ref="certMaisUsados"> </canvas> 
                </div>
            </div>
            
            <div class="whitesoftshadow bmv">
                <p> Top 10 beneficiarios com maiores lucros </p>
                <div>
                    <canvas ref="maioresLucrosBenefs"> </canvas> 
                </div>
            </div>
        </div>
        <div v-else class="relgraficoscont scroll-brown">
            <div class="whitesoftshadow bmv"> 
                <h1> Você está sem permissão para ver os relatorios gerais neste momento. </h1>
                <h2> Peça à um administrador para que você consiga ver. </h2>
            </div>
        </div>
    </div>
</template>


<script>
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import Relatorio from "../frontend/scripts/Janelas/relatorio/Relatorio";
import Login from "../frontend/scripts/Janelas/login/Login";
import router from "@/router";

export default {
    data() {
        return {
            router,
            Relatorio,
            Login,
        };
    },
    mounted() {
        if (Login.verifPerm(4)){
            Relatorio.startResizeListener();

            Relatorio.iniciarRelCrMaEx(this.$refs.cronoMaisExecutados);
            Relatorio.iniciarRelCeMaUs(this.$refs.certMaisUsados);
            Relatorio.iniciarRelMaLuBe(this.$refs.maioresLucrosBenefs);
        }
    },
    beforeUnmount() {
        console.error("UNMOUNT");
        Relatorio.stopResizeListener();
        Relatorio.destroyAllRels();
    },
};
</script>

<style>
@import '../../src/frontend/styles/relatorio.css';  /* mainpage */
</style>