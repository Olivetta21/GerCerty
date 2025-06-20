import Janela from '../Janela';

class Other extends Janela {
    static _nome = 'Outra';

    
    static get nome(){return this._nome}

    static entrando() {
        console.log('Janela Other foi aberta.');
    }
  
    static saindo() {
        console.log('Janela Other foi fechada.');
    }
}

export default Other;