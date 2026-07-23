import { ref } from "vue";
import Janela from "../Janela";
import { fetchJson } from "../../fetcher";
import { addToast } from "../../toastNotification";
import { validarTelefone } from "../../utils";

class Contatos extends Janela {
    static nome = 'Contatos';

    static _searchQuery = ref('');
    static _contacts = ref([]);
    static _isLoading = ref(false);

    // Modal state
    static _isAddModalOpen = ref(false);
    static _newContactName = ref('');
    static _newContactPhone = ref('');

    static get searchQuery_() { return this._searchQuery; }
    static get searchQuery() { return this._searchQuery.value; }
    static set searchQuery(val) { this._searchQuery.value = val; }

    static get contacts_() { return this._contacts; }
    static get contacts() { return this._contacts.value; }
    static set contacts(val) { this._contacts.value = val; }

    static get isLoading_() { return this._isLoading; }
    static get isLoading() { return this._isLoading.value; }
    static set isLoading(val) { this._isLoading.value = val; }

    static get isAddModalOpen_() { return this._isAddModalOpen; }
    static get isAddModalOpen() { return this._isAddModalOpen.value; }
    static set isAddModalOpen(val) { this._isAddModalOpen.value = val; }

    static get newContactName_() { return this._newContactName; }
    static get newContactName() { return this._newContactName.value; }
    static set newContactName(val) { this._newContactName.value = val; }

    static get newContactPhone_() { return this._newContactPhone; }
    static get newContactPhone() { return this._newContactPhone.value; }
    static set newContactPhone(val) { this._newContactPhone.value = val; }

    static async searchContacts() {
        if (!this.searchQuery || this.searchQuery.trim() === '') {
            this.contacts = [];
            return;
        }

        this.isLoading = true;

        try {
            const data = await fetchJson('/mainpage/getNumbers.php', [{ "h": "nome", "b": this.searchQuery }]);

            if (data && data.numeros) {
                this.contacts = data.numeros.map((c, index) => ({
                    id: c.id || index,
                    name: c.cliente || 'Desconhecido',
                    phone: c.telefone || c.numero || 'Sem número',
                    original: c.original || '',
                    isOriginalVisible: false,
                    isPhoneValid: validarTelefone(c.telefone || c.numero || '')
                }));
            } else {
                this.contacts = [];
            }
        } catch (error) {
            console.error("Erro ao buscar contatos:", error);
            this.contacts = [];
        } finally {
            this.isLoading = false;
        }
    }

    static openAddContact() {
        this.isAddModalOpen = true;
    }

    static closeAddContact() {
        this.isAddModalOpen = false;
        this.newContactName = '';
        this.newContactPhone = '';
    }

    static async sendWhatsapp(contato) {
        const nome_cliente = contato.name;
        const telefone = contato.phone;

        if (!validarTelefone(telefone)) {
            if (!confirm("Possivelmente o telefone:\n" + telefone + "\n Está incorreto, quer tentar enviar mensagem mesmo assim?")) {
                return;
            }
        }

        const data = await fetchJson('/mainpage/getNumbers.php', [{ "h": "info", "b": `ctt: ${nome_cliente} - ${telefone}` }]);
        if (!data || !data.info || data.info !== `ctt: ${nome_cliente} - ${telefone}`) {
            addToast("sendWhats", "Erro ao notificar cliente", "error");
            return;
        }

        const link = `https://api.whatsapp.com/send?phone=55${telefone}`;

        window.open(link, '_blank');
    }

    static async saveNewContact() {
        if (!this.newContactName || this.newContactName.trim() === '') {
            addToast("Erro", "Nome do contato não pode estar vazio.", "error");
            return;
        }
        if (!this.newContactPhone || this.newContactPhone.trim() === '') {
            addToast("Erro", "Número do contato não pode estar vazio.", "error");
            return;
        }

        try {
            const payload = {
                "nome_cliente": this.newContactName,
                "numero": this.newContactPhone
            };
            const result = await fetchJson("/mainpage/setCertNumber.php", [{ "h": "add_contato", "b": payload }]);

            if (result && result.success) {
                addToast("Sucesso", "Contato adicionado com sucesso!", "success");

                //adiciona na lista com id qualquer
                this.contacts = [...this.contacts, {
                    id: result.id,
                    name: this.newContactName,
                    phone: this.newContactPhone,
                    original: 'localmente adicionado',
                    isOriginalVisible: false,
                    isPhoneValid: validarTelefone(this.newContactPhone)
                }];
                this.closeAddContact();

                // Opcional: Se a barra de pesquisa estiver preenchida com parte do nome, refazer busca
                if (this.searchQuery && this.newContactName.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                    this.searchContacts();
                }
            } else {
                addToast("Erro", "Erro ao adicionar contato: " + (result.error || "Desconhecido"), "error");
            }
        } catch (error) {
            console.error("Erro ao salvar contato:", error);
            addToast("Erro", "Ocorreu um erro ao tentar salvar o contato.", "error");
        }
    }


    static async editContact(contact) {
        if (!contact.name || contact.name.trim() === '') {
            addToast("Erro", "Nome do contato não pode estar vazio.", "error");
            return;
        }
        if (!contact.phone || contact.phone.trim() === '') {
            addToast("Erro", "Número do contato não pode estar vazio.", "error");
            return;
        }

        try {
            const payload = {
                "id": contact.id,
                "nome_cliente": contact.name,
                "numero": contact.phone
            };
            const result = await fetchJson("/mainpage/setCertNumber.php", [{ "h": "edit_contato", "b": payload }]);

            if (result && result.success) {
                addToast("Sucesso", "Contato editado com sucesso!", "success");

                //Edita o contato localmente
                const index = this.contacts.findIndex(c => c.id === contact.id);
                let originalContact = { ...this.contacts[index] };
                originalContact.name = contact.name;
                originalContact.phone = contact.phone;
                originalContact.isPhoneValid = validarTelefone(contact.phone);

                if (index !== -1) {
                    this.contacts[index] = {...originalContact};
                }

            } else {
                addToast("Erro", "Erro ao editar contato: " + (result.error || "Desconhecido"), "error");
            }
        } catch (error) {
            console.error("Erro ao editar contato:", error);
            addToast("Erro", "Ocorreu um erro ao tentar editar o contato.", "error");
        }

    }

    static async deleteContact(contact) {
        if (!confirm("Tem certeza que deseja apagar o contato? \n" + contact.name + " - " + contact.phone)) {
            return;
        }

        try {
            const payload = {
                "id": contact.id,
            };
            const result = await fetchJson("/mainpage/setCertNumber.php", [{ "h": "delete_contato", "b": payload }]);

            if (result && result.success) {
                addToast("Sucesso", "Contato apagado com sucesso!", "success");

                //remove da lista
                this.contacts = this.contacts.filter(c => c.id !== contact.id);
            } else {
                addToast("Erro", "Erro ao apagar contato: " + (result.error || "Desconhecido"), "error");
            }
        } catch (error) {
            console.error("Erro ao apagar contato:", error);
            addToast("Erro", "Ocorreu um erro ao tentar apagar o contato.", "error");
        }

    }
}

export default Contatos;