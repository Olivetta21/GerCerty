import Janela from '../Janela.js';
import {fetchJson} from '../../fetcher.js';
//import { ref } from 'vue';
import { addToast } from '../../toastNotification.js';
import { noPermissionMsg, tratarRetornosApi } from "../../commonactions";

import { Chart, registerables } from "chart.js";
import { getMonthInterval, sleep } from '../../utils.js';
import { ref } from 'vue';
import Login from '../login/Login.js';
Chart.register(...registerables);

class Relatorio extends Janela {
    static nome = 'Relatorio';

    static _agndsRealizados = ref([]);
    static _pagtosRecebidos = ref([]);    
    static _datas = ref({
        in: getMonthInterval(new Date(Date.now()), true),
        fi: getMonthInterval(new Date(Date.now()), false)
    });
    static rels = {"CrMaEx":null, "CeMaUs":null, "MaLuBe":null, "outro":null};

    static get agndsRealizados_(){return this._agndsRealizados}
    static get agndsRealizados(){return this._agndsRealizados.value}
    
    static get pagtosRecebidos_(){return this._pagtosRecebidos}
    static get pagtosRecebidos(){return this._pagtosRecebidos.value}
    
    static get datas_(){return this._datas}
    static get datas(){return this._datas.value}

    static set agndsRealizados(arg){this._agndsRealizados.value = arg}
    static set pagtosRecebidos(arg){this._pagtosRecebidos.value = arg}

    static entrando() {
        
    }
    static saindo() {
        
    }


    static async getRelatorios(tipo, aditParams){
        if (!tipo) {
            addToast("getRelatorio", "especifique o tipo!", "error");
            return null;
        }

        switch (tipo) {
            case 'AgBeFi': 
            case 'PaFeBe': if (!Login.verifPerm(5)) {noPermissionMsg("Relatorio", 5); return null;} break;
            case 'CrMaEx': 
            case 'CeMaUs': 
            case 'MaLuBe': if (!Login.verifPerm(4)) {noPermissionMsg("Relatorio", 4); return null;} break;
        }


        let arg = [{"h":"tipo","b":tipo}, {"h":"data","b":[this.datas.in, this.datas.fi]}];

        if (Array.isArray(aditParams)) {
            aditParams.forEach(a => {
                arg.push(a);
            });
        }

        let data = await fetchJson('/relatoriopage/getRelatorios.php', arg);

        if (data['relatorio']) {
            return data['relatorio'];
        }
        else if (data['nenhum']){
            addToast("Relatorio", "nenhum dado retornado", "warn");
        }
        else tratarRetornosApi(data, "Relatorios");

        return null;
    }

    static async setRelAgBeFi(idpagto){
        if (idpagto){
            idpagto = [{"h":"pagto_id","b":idpagto}];
        }

        this.agndsRealizados = [];
        this.agndsRealizados = await this.getRelatorios('AgBeFi', idpagto);
    }
    
    static async setRelPaFeBe(){
        this.pagtosRecebidos = [];
        this.pagtosRecebidos = await this.getRelatorios('PaFeBe');
    }

    static async iniciarRelCrMaEx(ctxCrMaEx){
        const infos = await this.getRelatorios("CrMaEx");

        if (!infos) return;

        this.rels.CrMaEx = new Chart(ctxCrMaEx, {
            type: "bar", // Tipo do gráfico
            data: {
            labels: infos.usuario,
            datasets: [
                {
                label: "Notificacao",
                data: infos.notf,
                backgroundColor: 'yellow', // Cor das barras
                borderWidth: 1,
                barThickness: 10,  // Define a espessura das barras
                categoryPercentage: 0.8,  // Controla o espaço entre as barras
                barPercentage: 0.5,  // Controla a largura da barra dentro de cada categoria
                },
                {
                label: "Agendamento",
                data: infos.agnd,
                backgroundColor: 'green', // Cor das barras
                borderWidth: 1,
                barThickness: 10,  // Define a espessura das barras
                categoryPercentage: 0.8,  // Controla o espaço entre as barras
                barPercentage: 0.5,  // Controla a largura da barra dentro de cada categoria
                },
                {
                label: "Avisos",
                data: infos.prbl,
                backgroundColor: 'red', // Cor das barras
                borderWidth: 1,
                barThickness: 10,  // Define a espessura das barras
                categoryPercentage: 0.8,  // Controla o espaço entre as barras
                barPercentage: 0.5,  // Controla a largura da barra dentro de cada categoria
                },
                {
                label: "Visualizacao",
                data: infos.revl,
                backgroundColor: 'blue', // Cor das barras
                borderWidth: 1,
                barThickness: 10,  // Define a espessura das barras
                categoryPercentage: 0.8,  // Controla o espaço entre as barras
                barPercentage: 0.5,  // Controla a largura da barra dentro de cada categoria
                },
            ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                    beginAtZero: true,
                    },
                },
            },
        });
    }


    static async iniciarRelCeMaUs(ctxCeMaUs){
        const infos = await this.getRelatorios("CeMaUs");

        if (!infos) return;

        this.rels.CeMaUs = new Chart(ctxCeMaUs, {
            type: "bar", // Tipo do gráfico
            data: {
            labels: infos.certificado,
            datasets: [
                {
                label: "Usos",
                data: infos.usos,
                backgroundColor: infos.usos.map(() => `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`), // Cor das barras
                borderWidth: 1,
                barThickness: 10,  // Define a espessura das barras
                categoryPercentage: 0.8,  // Controla o espaço entre as barras
                barPercentage: 0.5,  // Controla a largura da barra dentro de cada categoria
                }
            ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                    beginAtZero: true,
                    },
                },
            },
        });
    }

    static async iniciarRelMaLuBe(ctxMaLuBe){
        const infos = await this.getRelatorios("MaLuBe");
    
        if (!infos) return;

        this.rels.MaLuBe = new Chart(ctxMaLuBe, {
            type: "bar", // Tipo do gráfico
            data: {
            labels: infos.usuarios,
            datasets: [
                {
                label: "Confirmados",
                data: infos.lucros,
                backgroundColor: 'green',
                borderWidth: 1,
                barThickness: 10,  // Define a espessura das barras
                categoryPercentage: 0.8,  // Controla o espaço entre as barras
                barPercentage: 0.5,  // Controla a largura da barra dentro de cada categoria
                },
                {
                label: "Pendentes",
                data: infos.pends,
                backgroundColor: 'orange',
                borderWidth: 1,
                barThickness: 10,  // Define a espessura das barras
                categoryPercentage: 0.8,  // Controla o espaço entre as barras
                barPercentage: 0.5,  // Controla a largura da barra dentro de cada categoria
                }
            ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                    beginAtZero: true,
                    },
                },
            },
        });
    }

    static idOfResizeHandler = 0;
    static async resizeHandler(){
        const myId = ++this.idOfResizeHandler;
        await sleep(1000);
        if (myId !== this.idOfResizeHandler) return;

        if (!this.rels) {
            console.log("rels is not defined or null");
            return;
        }
    
        for (const key in this.rels) {            
            if (this.rels[key] instanceof Chart) {
                this.rels[key].resize();
            } else {
                console.log("not chart to resize");
            }
        }
    }
    static resizeHandler_event = null; //Pro addEventListener gravar o bind corretametne.
    
    static startResizeListener(){
        this.resizeHandler_event = this.resizeHandler.bind(this);
        window.addEventListener("resize", this.resizeHandler_event);
    }

    static stopResizeListener(){
        window.removeEventListener("resize", this.resizeHandler_event);
    }

    static destroyAllRels(){
        for (const key in this.rels){
            if (this.rels[key] instanceof Chart) this.rels[key].destroy();
        }
    }
}

export default Relatorio;