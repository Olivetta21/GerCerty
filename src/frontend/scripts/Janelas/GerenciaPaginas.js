import { ref } from 'vue';


import Login from './login/Login';
//import Main from './main/Main';
//import Other from './other/Other';
//import Janela from './Janela';


class GerenciaPaginas{    
    static _pgAtual = ref(null);
    static _historico = ref([]);

    static get historico_(){return this._historico}
    static get historico(){return this._historico.value}

    static _historicoPos = ref(0);

    static get historicoPos_(){return this._historicoPos}
    static get historicoPos(){return this._historicoPos.value}

    static set historicoPos(arg){this._historicoPos.value = arg}
    static set historico(arg){this._historico.value = arg}
    
    static get initPgAtual_(){
        this._pgAtual.value = Login;
        this.historicoPos = 0;
        this.historico = [Login];
        return this._pgAtual;
    }

    static clearHistorico(){
        this.historicoPos = 0;
        this.historico = [Login];
    }

    static addHistorico(newh){
        const already = this.historico.findIndex(a => a === newh);

        if (already > -1){ //se a pagina selecionada ja existir no vetor, use ela, ao invés de adicionar um novo historico.
            this.historico.splice(already + 1, this.historico.length - already - 1);
            this.historicoPos = already;
            return;
        }
        else if (this.historicoPos < this.historico.length - 1){ //se o usuario usa o botao back/next, o historico nao é deletado.
            //apaga o historico à frente
            this.historico.splice(this.historicoPos + 1, this.historico.length - this.historicoPos - 1);
        }

        this.historico.push(newh);
        this.historicoPos = this.historico.length - 1;
    }

    static jumpToThisPage(idx){
        this.historicoPos = idx;
        this.switchPG(this.historico[idx], true); //gambiarra :) a função addHistorico vai validar, e ao detectar que já existe ele ira fazer o trabalho sujo.
    }

    static back(){
        if (this.historico.length > 0 && this.historicoPos > 0) {
            this.historicoPos--;
            this.switchPG(this.historico[this.historicoPos], true);
        }
    }

    static next(){
        if (this.historico.length > 0 && this.historicoPos < this.historico.length - 1) {
            this.historicoPos++;
            this.switchPG(this.historico[this.historicoPos], true);
        }
    }
        
    static switchPG(to, ignH){
        try {
            this._pgAtual.value.saindo();
            to.entrando();
            this._pgAtual.value = to;

            if (!ignH) {
                this.addHistorico(this._pgAtual.value);
            }
        }
        catch (error) {
            console.error("no switchPG", error);
            console.warn("Voce tentou sair da janela: ", this._pgAtual.value, " para entrar em: ", to);
            this._pgAtual.value = null;
        }
    }
}

export default GerenciaPaginas;