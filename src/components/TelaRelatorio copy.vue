<template>
    <div id="relatorioholder">
        <div class="agndvenda scroll-brown">
            <div class="agndsearch whitesoftshadow">
                <button class="agndsearch-typeof"> TIPO </button>
                <div class="agndsearch-datesearch"> 
                    <input v-model="dtin" type="date" placeholder="inicio" />
                    <span> - </span>
                    <input v-model="dtfi" type="date" placeholder="fim" />
                    <button @click="Relatorio.setRelAgBeFi()"> Mostrar </button>
                </div>
            </div>
            <div class="agndtable whitesoftshadow scroll-brown"> 
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
                            <tr :class="[rt.pago ? 'underline-green' : rt.venda ? 'underline-orange' : 'underline-red']" v-for="(rt, index) in Relatorio.relsTable" :key="index">
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
        <div class="relgraficoscont scroll-brown">
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
    </div>
</template>


<script>
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import Relatorio from "../frontend/scripts/Janelas/relatorio/Relatorio";

export default {
    data() {
        return {
            Relatorio,

            dtin: '2020-01-01',
            dtfi: '2024-12-31'
        };
    },
    mounted() {
        Relatorio.startResizeListener();

        Relatorio.iniciarRelCrMaEx(this.$refs.cronoMaisExecutados);
        Relatorio.iniciarRelCeMaUs(this.$refs.certMaisUsados);
        Relatorio.iniciarRelMaLuBe(this.$refs.maioresLucrosBenefs);
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