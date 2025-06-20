import Login from "./Janelas/login/Login";
import pgUpdates from "./pagesUpdates";
import { addToast } from "./toastNotification";

export function noPermissionMsg(dequem, perm){
    if (!dequem) dequem = '';
    addToast(dequem + " Você não tem permissão!", "Permissão exigida: " + perm, "error", true);
}

export function tratarRetornosApi(retorno, dequem) {
    if (!dequem) dequem = '';

    if (retorno['error']){
        addToast(dequem, retorno['error'], "error", true);
    }
    else if (retorno['warn']){
        addToast(dequem, retorno['warn'], "warn");
    }
    else if (retorno['nopermission']){
        noPermissionMsg(dequem, retorno['nopermission']);
    }
    else if (retorno['invalid_token']){
        Login.sessaoExpirada = true;
        pgUpdates.stop();
        document.title = "Sessão expirada!";
        addToast("Sessão expirada!","Refaça o login.", "error");
    }
    else {
        addToast(dequem + ' desconhecido', retorno , "error", true);
    }
}