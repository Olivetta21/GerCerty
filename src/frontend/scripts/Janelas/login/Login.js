import { ref } from 'vue';
import Janela from '../Janela';
import pgUpdates from '../../pagesUpdates';
import GerenciaPaginas from '../GerenciaPaginas';
import Main from '../main/Main';
import { addToast } from '../../toastNotification';
import { sleep } from '../../utils';
import { fetchJson } from '../../fetcher';
import { noPermissionMsg, tratarRetornosApi } from '../../commonactions';

class Login extends Janela {
    static nome = 'Login';

    static _login = ref('');
    static _password = ref('');
    static _aliqVend = 0.0;
    static _loadingVerificando = ref(false);
    static _sessaoExpirada = ref(false);

    static holdUserCred = {
        login: "",
        senha: ""
    }

    static _USERLOGGED = ref(false);
    static _USERNAME = '1';
    static USERLOGIN = '2';

    static user_permissions = [];
    static verifPerm(perm, msg) {
        let p = this.user_permissions.findIndex(up => up === perm) > -1 ? true : false;
        if (msg && !p) {
            noPermissionMsg(msg, perm);
        }
        return p;
    }

    static get login_() {return this._login}
    static get login() {return this._login.value}
    static get password_() {return this._password}
    static get password() {return this._password.value}
    static get loadingVerificando_() {return this._loadingVerificando}
    static get loadingVerificando() {return this._loadingVerificando.value}
    static get USERLOGGED_() {return this._USERLOGGED}
    static get USERLOGGED() {return this._USERLOGGED.value}
    static get aliqVend() {return this._aliqVend}
    static get USERNAME() {return this._USERNAME}
    static get sessaoExpirada_() {return this._sessaoExpirada}
    static get sessaoExpirada() {return this._sessaoExpirada.value}

    static set login(arg) {this._login.value = arg}
    static set password(arg) {this._password.value = arg}
    static set loadingVerificando(arg) {this._loadingVerificando.value = arg}
    static set USERNAME(arg) {this._USERNAME = arg}
    static set aliqVend(arg) {this._aliqVend = arg}
    static set USERLOGGED(arg) {this._USERLOGGED.value = arg}
    static set sessaoExpirada(arg) {this._sessaoExpirada.value = arg}

    static token = '';

    static entrando() {
        document.title = "Certificados";

        this.USERLOGGED = false;
        this.login = '';
        this.password = '';
        this.token = '';
        this.user_permissions = [];

        GerenciaPaginas.clearHistorico();

        pgUpdates.stop();
        console.log('Janela login foi aberta.');
    }
  
    static saindo() {
        this.password = '';
        console.log('Janela login foi fechada.');
    }


    static async reEnter(){
        if (GerenciaPaginas.historicoPos < 1) return;

        const to_back = GerenciaPaginas._pgAtual.value;

        GerenciaPaginas.switchPG(Login);
        this.login = this.holdUserCred.login;
        this.password = this.holdUserCred.senha;
        await this.verifLogin();

        if (to_back !== GerenciaPaginas._pgAtual.value) //neste momento o pgAtual é MainPage :)
            GerenciaPaginas.switchPG(to_back);
    }


    static async verifLogin() {
        if (!this.login || !this.password){
            addToast("LoginPage/verifLogin","Login inválido", "error");
            return;
        }
        
        this.loadingVerificando = true;
        let lastPrssdLoginTime = Date.now();

        const data = await fetchJson("/loginpage/verifLogin.php", [{"h":"usercred","b":[this.login, this.password]}]);

        if (data['credent']){
            const credent = data['credent'];

            this.user_permissions = (data['user_permissions']) ? data['user_permissions'] : [];

            this.USERLOGGED = true;
            this.USERNAME = credent['nome'].toUpperCase();                
            this.USERLOGIN = credent['login'];
            this.aliqVend = credent['vend_comiss'];
            this.token = data['TK'];
            
            data['LKU'] ? pgUpdates.start(data['LKU']) : pgUpdates.start(0);

            this.holdUserCred.login = this.login;
            this.holdUserCred.senha = this.password;
            GerenciaPaginas.switchPG(Main);							

            addToast('Bom dia', this.USERNAME + '!\nUltimo Login: ' + data['last_login'], 'success');
        }
        else tratarRetornosApi(data, "login");
        
        const diferenca = 1000 - (Date.now() - lastPrssdLoginTime);
        if (diferenca > 0) await sleep(diferenca);
        this.loadingVerificando = false;
    }
}

export default Login;