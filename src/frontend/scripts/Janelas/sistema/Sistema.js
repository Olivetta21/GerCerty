import { ref } from "vue";
import { tratarRetornosApi } from "../../commonactions";
import { fetchJson } from "../../fetcher";
import Janela from "../Janela";
import { addToast } from "../../toastNotification";
import Login from "../login/Login";

class Sistema extends Janela {
    static nome = "Sistema";

    static pesqUser = '';

    static _configurando = ref('');
    static get configurando_(){return this._configurando}
    static get configurando(){return this._configurando.value}
    static set configurando(arg){this.configurando_.value = arg}

    static _usuariosSistemas = ref([]);
    static get usuariosSistemas_(){return this._usuariosSistemas}
    static get usuariosSistemas(){return this._usuariosSistemas.value}
    static set usuariosSistemas(arg){this.usuariosSistemas_.value = arg}

    static _gruposPerms = ref([]);
    static get gruposPerms_(){return this._gruposPerms}
    static get gruposPerms(){return this._gruposPerms.value}
    static set gruposPerms(arg){this.gruposPerms_.value = arg}
	
	static _permsIndiv = ref([]);
    static get permsIndiv_(){return this._permsIndiv}
    static get permsIndiv(){return this._permsIndiv.value}
    static set permsIndiv(arg){this.permsIndiv_.value = arg}

    static entrando() {
        this.getPermissoes();
    }

    static saindo (){

    }

    static async getPermissoes(){
        const data = await fetchJson("/sistemapage/getPermissions.php", null);

        if (data['grupos'] && data['perms']){
            this.gruposPerms = data['grupos'];
            this.permsIndiv = data['perms'];
        }
        else tratarRetornosApi(data, "getPermissoes");
    }





    //for groups-------------------------------------------------------------------------------------------------------------------
    static loadGruposNoUsuario(u_idx){
        if (this.usuariosSistemas[u_idx].gp_perm == null){
            this.usuariosSistemas[u_idx].gp_perm = [];
        }

        if (Array.isArray(this.usuariosSistemas[u_idx].gp_perm)){
            let newGps = structuredClone(this.gruposPerms); //copiar todos os grupos existentes para dentro do usuario.

            this.usuariosSistemas[u_idx].gp_perm.forEach(user_gp => {
                for (const grupo of newGps){
                    if (user_gp.db && user_gp.id === grupo.id) {
                        grupo.db = true; //pra saber qual grupo veio do banco.
                        grupo.integrante = true; //se no vetor de grupos do usuario ja tiver algum id, marcar ele como "integrante".
                        break;
                    }
                }
            });

            this.usuariosSistemas[u_idx].gp_perm = newGps;
            this.usuariosSistemas[u_idx].gp_verificado = true;
        }
        else addToast("loadGruposNoUsuario", "nao é array", "error", true);
    }
    static grupoIntegranteSwap(uidx, gidx){
        let grupo = this.usuariosSistemas[uidx].gp_perm[gidx];
        if (!grupo) {
            addToast("alterar grupo", "indice nao encontrado", "error", true);
            return;
        }

        if (grupo.integrante) { //se no estiver marcado como integrante significa que o usuario quer remove-lo
            delete grupo.integrante;
        }
        else { //se nao, ele quer adiciona-lo
            grupo.integrante = true;
        }
    }    
    static mostrarGruposDoUsuario(u_idx) {
        //Gambiarra, o nome so aparece no vetor de grupos quando o calculo foi feito. então se nao tiver o nome, fazer o calculo antes.
        if (!this.usuariosSistemas[u_idx].gp_perm || !this.usuariosSistemas[u_idx].gp_verificado) this.loadGruposNoUsuario(u_idx);
        this.usuariosSistemas[u_idx].verPermType = 'G';
    }
    //#for groups----------------------------------------------------------------------------------------------------------------------













    //for perms----------------------------------------------------------------------------------------------------------------------
    static loadPermIndivNoUsuario(u_idx){
        if (this.usuariosSistemas[u_idx].pi_perm == null){
            this.usuariosSistemas[u_idx].pi_perm = [];
        }        

        if (Array.isArray(this.usuariosSistemas[u_idx].pi_perm)){
            let newPis = structuredClone(this.permsIndiv); //copiar todos os grupos existentes para dentro do usuario.

            this.usuariosSistemas[u_idx].pi_perm.forEach(user_pi => {
                for (const perm of newPis) {
                    if (user_pi.db && user_pi.id === perm.id) {
                        perm.db = true; //pra saber qual grupo veio do banco.
                        perm.integrante = true; //se no vetor de grupos do usuario ja tiver algum id, marcar ele como "integrante".
                        break;
                    }
                }
            });

            this.usuariosSistemas[u_idx].pi_perm = newPis;
            this.usuariosSistemas[u_idx].pi_verificado = true;
        }
        else addToast("loadPermIndivNoUsuario", "nao é array", "error", true);
    }    
    static permIndivSwap(uidx, pidx){
        let perm = this.usuariosSistemas[uidx].pi_perm[pidx];
        if (!perm) {
            addToast("alterar permissao", "indice nao encontrado", "error", true);
            return;
        }

        if (perm.integrante) { //se no estiver marcado como integrante significa que o usuario quer remove-lo
            delete perm.integrante;
        }
        else { //se nao, ele quer adiciona-lo
            perm.integrante = true;
        }
    } 
    static mostrarPermIndivDoUsuario(u_idx) {
        if (!this.usuariosSistemas[u_idx].pi_perm || !this.usuariosSistemas[u_idx].pi_verificado) this.loadPermIndivNoUsuario(u_idx);
        this.usuariosSistemas[u_idx].verPermType = 'P';
    }
    //#for perms---------------------------------------------------------------------------------------------------------------------



    static async getUsuarios() {
        const data = await fetchJson("/sistemapage/getUsuarios.php", [{"h":"nomesearch","b":this.pesqUser}]);

        if (data['usuarios']){
            this.usuariosSistemas = data['usuarios'];
        }
        else tratarRetornosApi(data, "getUserSistemas");
    }

    static async salvarAlteracao(uidx){
        addToast("salvar", "salvando...", "info");

        const u = this.usuariosSistemas[uidx];

        let newU = {
            login: u.login,
            nome: u.nome,
            senha: u.senha,
            bene_comiss: u.bene_comiss,
            vend_comiss: u.vend_comiss          
        }

        if (Login.verifPerm(11)) {
            if (u.pi_perm && u.pi_verificado){
                newU.pi_perm = [];

                u.pi_perm.forEach(pi => {
                    if (pi.integrante) newU.pi_perm.push(pi.id);
                });
            }
            if (u.gp_perm && u.gp_verificado) {
                newU.gp_perm = [];

                u.gp_perm.forEach(gp => {
                    if (gp.integrante) newU.gp_perm.push(gp.id);
                });
            }
        }
        
        console.log(newU);

        const data = await fetchJson("/sistemapage/salvarAlteracao.php", [{"h":"usuario","b":newU}]);

        if (data['success']){
            addToast("Informação de usuario", "salvo com sucesso!", "success");
        }
        else tratarRetornosApi(data, "salvarAlteracao");
    }

}

export default Sistema;