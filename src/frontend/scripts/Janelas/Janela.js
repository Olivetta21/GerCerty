export default class Janela {
    constructor() {
        if (this.constructor === Janela) {
            throw new Error('A classe "Janela" não pode ser instanciada diretamente.');
        }
    }

    static get nome(){
        throw new Error('O método "get nome" deve ser implementado.');
    }
  
    static entrando() {
        throw new Error('O método "entrando" deve ser implementado.');
    }
  
    static saindo() {
        throw new Error('O método "saindo" deve ser implementado.');
    }

}
  