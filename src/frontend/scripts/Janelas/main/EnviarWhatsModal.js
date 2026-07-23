import { ref } from "vue";
import { fetchJson } from "../../fetcher";
import Login from "../login/Login";
import { validarTelefone } from "../../utils";
import { addToast } from "../../toastNotification";

//import Main from "./Main";
//import { addToast } from "../../toastNotification";
//import { fetchJson } from "../../fetcher";
//import { tratarRetornosApi } from "../../commonactions";
//import Login from "../login/Login";


class EnviarWhatsModal {
    static _isModalVisible = ref(false);

    static set isModalVisible(arg) { this._isModalVisible.value = arg }

    static get isModalVisible_() { return this._isModalVisible }
    static get isModalVisible() { return this._isModalVisible.value }

    static _certificado = ref(null);

    static set certificado(arg) { this._certificado.value = arg }

    static get certificado_() { return this._certificado }
    static get certificado() { return this._certificado.value }

    static _numeros = ref([]);

    static set numeros(arg) { this._numeros.value = arg }

    static get numeros_() { return this._numeros }
    static get numeros() { return this._numeros.value }


    static open(crt) {
        this.certificado = crt;
        this.isModalVisible = true;
        this.getAndSetNumeros(crt.nome);
    }

    static close() {
        this.isModalVisible = false;
    }

    static setNumeros(numeros) {
        this.numeros = numeros;
    }

    static async getNumbers(nome) {
        const result = await fetchJson("/mainpage/getNumbers.php", [{ "h": "nome", "b": nome }]);
        console.log(result.numeros);

        return result.numeros ?? [];
    }

    static async getAndSetNumeros(nome) {
        const numeros = await this.getNumbers(nome);
        this.setNumeros(numeros);
    }

    static async sendWhats(numero) {
        const crt = this.certificado;
        const telefone = numero ?? crt.telefone_whatsapp ?? null;
        if (!validarTelefone(telefone)) {
            if (!confirm("Possivelmente o telefone:\n" + telefone + "\n Está incorreto, quer tentar enviar mensagem mesmo assim?")) {
                return;
            }
        }
        const nomeCertificado = crt.nome;
        const dataVencimento = crt.venc;
        const nome_completo = Login.USERNAME.charAt(0).toUpperCase() + Login.USERNAME.slice(1).toLowerCase();
        const nomeAtendente = nome_completo.slice(0, nome_completo.indexOf(' '));
        const empresa = "Orteco Contabilidade";

        // Se não tiver telefone, retorna vazio
        if (!telefone) return "";

        const hoje = new Date();

        // Converte para Date caso venha string
        const vencimento = new Date(dataVencimento);
        const mes_venc = String(vencimento.getMonth() + 1).padStart(2, '0');
        const ano_venc = vencimento.getFullYear();
        const dia_venc = String(vencimento.getDate()).padStart(2, '0');

        const vencimentoFormatado = dia_venc + "/" + mes_venc + "/" + ano_venc;

        // Calcula diferença em dias
        const diffTime = vencimento - hoje;
        const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;

        const result = await fetchJson("/mainpage/getNumbers.php", [{ "h": "info", "b": `${nomeCertificado} - ${telefone}` }]);
        if (!result || !result.info || result.info !== `${nomeCertificado} - ${telefone}`) {
            addToast("sendWhats", "Erro ao notificar cliente", "error");
            return;
        }

        const status =
            diffDias < 0
                ? "vencido"
                : `vencendo dia ${vencimentoFormatado} (daqui a ${diffDias} dias)`;

        const instruir_combinar =
            nomeAtendente === "Ivan"
                ? "renovarmos me envie uma mensagem que combinamos"
                : "renovar envie uma mensagem para 67996021942 (Ivan) e combine";

        const mensagem = `Olá 😁 ${nomeAtendente} aqui da ${empresa}!\nPassando aqui para avisar que o certificado digital:\n*${nomeCertificado}*\nestá ${status}, para ${instruir_combinar} um horário 😉\n\n> _mensagem automática_`;

        const link = `https://api.whatsapp.com/send?phone=55${telefone}&text=${encodeURIComponent(mensagem)}`;

        window.open(link, '_blank');

        this.close();
    }

    static async setCertNumber(numero) {
        const result = await fetchJson("/mainpage/setCertNumber.php", [{ "h": "set_numero", "b": { "cert_codigo": this.certificado.id, "numero": numero } }]);
        console.log(result);
        if (result && result.success) {
            addToast("setCertNumber", "Número atualizado com sucesso!", "success");
        } else {
            addToast("setCertNumber", "Erro ao atualizar número!", "error");
        }
    }

}

export default EnviarWhatsModal;
