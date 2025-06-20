<template>
    <div class="vendacontainer">
        <div class="header">
            <button class="whitesoftshadow" @click="GerenciaPaginas.back()"> &#10094; </button>
            <div class="whitesoftshadow"> 
                Venda
            </div>
        </div>
        <div v-if="certsLoading" class="loading-indicator certs">
            <div class="spinner"> </div>
        </div>    
        <div v-else class="certs scroll-brown"> 
            <div class="c-head"> 
                <button @click="Venda.switchSearchType()"> Consulta por {{ Venda.tipoConsultName }}</button>
                <input v-if="tipoConsult == 3" type="text" name="certNomePesq" id="certNomePesq" v-model="certNomePesq">
                <button @click="Venda.searchCert()"> &#128269; </button>
            </div>
            <div class="c-table-holder scroll-brown"> 
                <div v-if="certs != null && certs.length > 0" class="c-table-cont"> 
                    <table class="c-table">
                        <thead>
                            <tr>
                                <th> nome </th>
                                <th> vencimento </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(c, index) in certs" :key="index" @click="Venda.loadInfoVenda(index)">
                                <td> {{ c.nome }} </td>
                                <td> {{ c.vencimento }} </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div v-if="InfV.loading" class="loading-indicator venda">
            <div class="spinner"></div>
        </div>
        <div v-else-if="!InfV.isVending" class="venda notvending">
            <div> Por favor, selecione um certificado. </div>
        </div>
        <div v-else class="venda scroll-brown">
            <div class="pessoa">
                <table>
                    <thead>
                        <tr>
                            <th> Quem </th>
                            <th> Nome </th>
                            <th> Aliquota </th>
                            <th> Parte </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="InfV.vendedor != null">
                            <td> vendedor </td>
                            <td> {{ InfV.nomeVend }} </td>
                            <td> <input type="number" min="0" max="1" step="0.01" name="aaa" id="aa1" placeholder="Aliquota Vendedor" v-model="InfV.aliqVend" @input="Venda.validateDecimal('aliqVend')"> </td>
                            <td> R$ {{ parteVend }} </td>
                        </tr>
                        <tr v-if="InfV.cron_agnd_id != null">
                            <td> beneficiario </td>
                            <td> {{ InfV.nomeBene }} </td>
                            <td> <input type="number" min="0" max="1" step="0.01" name="aaa" id="aa1" placeholder="Aliquota Beneficiario" v-model="InfV.aliqBene" @input="Venda.validateDecimal('aliqBene')"> </td>
                            <td> R$ {{ parteBene }} </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <hr>
            <div class="certificado">
                <div>
                    <div> Nome </div>
                    <div>{{ InfV.certNome }}</div>
                </div>
                <div>
                    <div> Versao </div>
                    <div>{{ InfV.certVersao }}</div>
                </div>
                <div>
                    <div> Vencimento </div>
                    <div>{{ InfV.actVenc }}</div>
                </div>
                <div>
                    <div> Nota </div>
                    <div>{{ InfV.notaCert }}</div>
                </div>
            </div>
            <hr>
            <div class="valores">
                <div>
                    <input type="number" min="0" max="999.99" step="0.01" name="aaa" id="aa1" placeholder="150,00" v-model="InfV.vlrDeVenda" @input="Venda.validateDecimal('vlrDeVenda')"> 
                    <p> valor venda </p>
                </div>
                <div>
                    <input type="number" min="0" max="999.99" step="0.01" name="aaa" id="aa1" placeholder="50,00" v-model="InfV.vlrDaDespesa" @input="Venda.validateDecimal('vlrDaDespesa')"> 
                    <p> despesas </p>
                </div>
                <div>  
                    <div> R$ {{ lucroLiquido }} </div>
                    <p> total </p>
                </div>
            </div>
            <hr>
            <div class="vempresa"> 
                <div>
                    <div> empresa </div>
                    <div> ORTECO </div>
                </div>
                <div>
                    <div> valor </div>
                    <div> {{ parteEmpresa }}</div>
                </div>
            </div>
            <hr>
            <div class="novos">
                <div>
                    <div>inicio vigência</div>
                    <div class="inicioVigencia"> <input type="date" name="aaa" id="aa1" placeholder="Inicio da validade" v-model="InfV.initValid"> </div>
                </div>
                <div>
                    <div>periodo validade</div>
                    <div class="periodoVigencia"> <input type="number" name="aaa" id="aa1" placeholder="Periodo de Vigência" v-model="InfV.periodoValid">  </div>
                </div>
                <div>
                    <div>final vigência</div>
                    <div class="finalVigencia"> {{ InfV.newVenc }} </div>
                </div>
                <div>
                    <div>local</div>
                    <div class="local"> <input type="text" name="aaa" id="aa1" placeholder="Novo Local" v-model="InfV.newLoca">  </div>
                </div>
            </div>
            <hr>
            <div class="footer">
                <button class="cancelar"> cancelar </button>
                <button class="confirmar" @click="Venda.vender()"> confirmar </button>
            </div>
        </div>
    </div>
</template>

<script>
import Venda from '../frontend/scripts/Janelas/venda/Venda';
import Login from '../frontend/scripts/Janelas/login/Login'
import GerenciaPaginas from '../frontend/scripts/Janelas/GerenciaPaginas';

//import { addToast } from '../frontend/scripts/toastNotification';


export default {
    data(){
        return {
            
            InfV: Venda.InfoVenda_,

            Login,
            GerenciaPaginas,

            Venda,
            certs: Venda.certs_,
            certsLoading: Venda.certsLoading_,
            certNomePesq: Venda.certNomePesq_,
            tipoConsult: Venda.tipoConsult_
        }
    },
    computed: {
        lucroLiquido() {return (this.InfV.vlrDeVenda - this.InfV.vlrDaDespesa).toFixed(2) },
        parteBene() {return (this.lucroLiquido * this.InfV.aliqBene).toFixed(2) },
        parteVend() {return ((this.lucroLiquido - this.parteBene) * this.InfV.aliqVend).toFixed(2) },
        parteEmpresa() {return (this.lucroLiquido - this.parteBene - this.parteVend).toFixed(2)}
    }
}
</script>

<style>
@import "../frontend/styles/venda.css";
</style>