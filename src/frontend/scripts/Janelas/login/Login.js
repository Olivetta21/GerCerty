import { ref } from 'vue';
import Janela from '../Janela';
import pgUpdates from '../../pagesUpdates';
import Cookies from 'js-cookie';

import { addToast } from '../../toastNotification';
import { sleep } from '../../utils';
import { fetchJson } from '../../fetcher';
import { noPermissionMsg, tratarRetornosApi } from '../../commonactions';
import router from '@/router';

class Login extends Janela {
    static nome = 'Login';
    static login = "";

    static async before_enter() {
        await this.fazerLogoff();
        document.title = "Certificados";
        this.USERLOGGED = false;
        this.token = '';
        this.user_permissions = [];
        //router.replace({ name: 'login' });
        pgUpdates.stop();
        console.log('Janela login foi aberta.');
    }

    static after_leave() {
        this.password = '';
        console.log('Janela login foi fechada.');
    }

    static _aliqVend = 0.0;
    static _loadingVerificando = ref(false);
    static _sessaoExpirada = ref(false);

    static _USERLOGGED = ref(false);
    static _USERNAME = '';

    static user_permissions = [];
    static verifPerm(perm, msg) {
        let p = this.user_permissions.findIndex(up => up === perm) > -1 ? true : false;
        if (msg && !p) {
            noPermissionMsg(msg, perm);
        }
        return p;
    }

    static get loadingVerificando_() { return this._loadingVerificando }
    static get loadingVerificando() { return this._loadingVerificando.value }
    static get USERLOGGED_() { return this._USERLOGGED }
    static get USERLOGGED() { return this._USERLOGGED.value }
    static get aliqVend() { return this._aliqVend }
    static get USERNAME() { return this._USERNAME }
    static get sessaoExpirada_() { return this._sessaoExpirada }
    static get sessaoExpirada() { return this._sessaoExpirada.value }

    static set loadingVerificando(arg) { this._loadingVerificando.value = arg }
    static set USERNAME(arg) { this._USERNAME = arg }
    static set aliqVend(arg) { this._aliqVend = arg }
    static set USERLOGGED(arg) { this._USERLOGGED.value = arg }
    static set sessaoExpirada(arg) { this._sessaoExpirada.value = arg }

    static token = '';



    static async fazerLogoff() {
        let resp = null;
        if (Cookies.get('access_token')) {
            resp = await fetchJson("/loginpage/login.php", [{ "h": "logoff", "b": 1 }]);
        }

        return resp;
    }

    static setLogged(data, to = "inicio") {
        if (data['success']) {
            const usuario = data['usuario'];

            this.user_permissions = usuario['permissoes'] ?? [];

            this.USERLOGGED = true;
            this.USERNAME = usuario['nome'].toUpperCase();
            this.login = usuario['login'];
            this.aliqVend = usuario['vend_comiss'] ?? 0.0;
            this.token = usuario['access_token'];

            pgUpdates.start(usuario['last_update'] ?? 0);

            router.push({ name: to });

            addToast('Bom dia', this.USERNAME + '!\nUltimo Login: ' + usuario['last_login'], 'success');
            return true;
        }
        else tratarRetornosApi(data, "login");
        return false;
    }

    static async isAuthenticated(to) {
        if (this.USERLOGGED) {
            return true;
        } else {
            const access_token = Cookies.get('access_token');
            if (!access_token) return false;
            console.log("access_token do cookie:", access_token);


            const resp = await fetchJson("/loginpage/login.php", [{ "h": "access_token", "b": access_token }]);
            return this.setLogged(resp, to);
        }
    }

    static async fazerLogin(login, senha) {
        this.loadingVerificando = true;
        let lastPrssdLoginTime = Date.now();

        const resp = await fetchJson("/loginpage/login.php", [{ "h": "usercred", "b": [login, senha] }]);

        this.setLogged(resp);

        const diferenca = 1000 - (Date.now() - lastPrssdLoginTime);
        if (diferenca > 0) await sleep(diferenca);
        this.loadingVerificando = false;
    }

    static reEnter() {
        //const currentRoute = router.currentRoute.value;
        router.replace({ name: 'login' });
        //router.push(currentRoute);
    }
}

export default Login;