import Janela from '../Janela';

class Other extends Janela {
    static _nome = 'Outra';


    static get nome() { return this._nome }


}

export default Other;