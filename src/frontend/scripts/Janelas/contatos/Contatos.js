import { ref } from "vue";
import Janela from "../Janela";
import { fetchJson } from "../../fetcher";
import { addToast } from "../../toastNotification";
import { validarContato } from "../../utils";

class Contatos extends Janela {
    static nome = 'Contatos';

    static _searchQuery = ref('');
    static _contacts = ref(null); //Array de objetos {nome: ContatoNome, contatos: [array]}
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


    static insertContactInList(contact) {
        //se o contato já existe na lista, adiciona o contato mas agrupadamente
        let new_contacts_list = [...this.contacts];
        const existIndex = new_contacts_list.findIndex(group => group.name === contact.name);

        if (existIndex !== -1) {
            // Adiciona o novo contato ao array de contatos existentes
            new_contacts_list[existIndex].contacts.push(contact);
        } else {
            // Adiciona o novo contato como um novo grupo
            new_contacts_list.push({
                name: contact.name,
                contacts: [contact]
            });
        }

        this.contacts = new_contacts_list;
    }

    static setContactList(newContacts) {
        // Agrupa os contatos por nome
        const groupedContacts = newContacts.reduce((acc, contact) => {
            const existingGroup = acc.find(group => group.name === contact.name);
            if (existingGroup) {
                existingGroup.contacts.push(contact);
            } else {
                acc.push({
                    name: contact.name,
                    contacts: [contact]
                });
            }
            return acc;
        }, []);

        this.contacts = groupedContacts;
    }

    static findContactById(contactId) {
        for (const group of this.contacts) {
            const foundContact = group.contacts.find(c => c.id === contactId);
            if (foundContact) {
                return foundContact;
            }
        }
        return null; // Retorna null se não encontrar o contato
    }

    static findContactLocationById(contactId) {
        for (let groupIndex = 0; groupIndex < this.contacts.length; groupIndex++) {
            const group = this.contacts[groupIndex];
            const contactIndex = group.contacts.findIndex(c => c.id === contactId);
            if (contactIndex !== -1) {
                return { groupIndex, contactIndex };
            }
        }
        return null; // Retorna null se não encontrar o contato
    }


    static async searchContacts() {
        if (!this.searchQuery || this.searchQuery.trim() === '') {
            this.contacts = [];
            return;
        }

        this.isLoading = true;

        try {
            const data = await fetchJson('/certificadospage/getNumbers.php', [{ "h": "nome", "b": this.searchQuery }]);

            if (data && data.numeros) {
                const new_contacts = data.numeros.map((c, index) => ({
                    id: c.id || index,
                    name: c.cliente || 'Desconhecido',
                    phone: c.telefone || c.numero || 'Sem número',
                    original: c.original || '',
                    isOriginalVisible: false,
                    isPhoneValid: validarContato(c.telefone || c.numero || '')
                }));

                this.setContactList(new_contacts);
            } else {
                this.contacts = null;
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

        if (validarContato(telefone) !== 'phone') {
            if (!confirm("Possivelmente o telefone:\n" + telefone + "\n Está incorreto, quer tentar enviar mensagem mesmo assim?")) {
                return;
            }
        }

        const data = await fetchJson('/certificadospage/getNumbers.php', [{ "h": "info", "b": `ctt: ${nome_cliente} - ${telefone}` }]);
        if (!data || !data.info || data.info !== `ctt: ${nome_cliente} - ${telefone}`) {
            addToast("sendWhats", "Erro ao notificar cliente", "error");
            return;
        }

        const link = `https://api.whatsapp.com/send?phone=55${telefone}`;

        window.open(link, '_blank');
    }

    static async sendEmail(contato) {
        const nome_cliente = contato.name;
        const email = contato.phone;
        
        if (validarContato(email) !== 'email') {
            if (!confirm("Possivelmente o email:\n" + email + "\n Está incorreto, quer tentar enviar mensagem mesmo assim?")) {
                return;
            }
        }

        const data = await fetchJson('/certificadospage/getNumbers.php', [{ "h": "info", "b": `ctt: ${nome_cliente} - ${email}` }]);
        if (!data || !data.info || data.info !== `ctt: ${nome_cliente} - ${email}`) {
            addToast("sendEmail", "Erro ao notificar cliente", "error");
            return;
        }

        const link = `mailto:${email}?subject=Contato&body=Olá ${nome_cliente},`;

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
            const result = await fetchJson("/certificadospage/setCertNumber.php", [{ "h": "add_contato", "b": payload }]);

            if (result && result.success) {
                addToast("Sucesso", "Contato adicionado com sucesso!", "success");

                //adiciona na lista com id qualquer

                const newContact = {
                    id: result.id,
                    name: this.newContactName,
                    phone: this.newContactPhone,
                    original: 'localmente adicionado',
                    isOriginalVisible: false,
                    isPhoneValid: validarContato(this.newContactPhone)
                }
                this.insertContactInList(newContact);


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
            const result = await fetchJson("/certificadospage/setCertNumber.php", [{ "h": "edit_contato", "b": payload }]);

            if (result && result.success) {
                addToast("Sucesso", "Contato editado com sucesso!", "success");

                let updated_contact_list = [...this.contacts];
                const location = this.findContactLocationById(contact.id);
                if (location) {
                    const { groupIndex, contactIndex } = location;
                    updated_contact_list[groupIndex].contacts[contactIndex].name = contact.name;
                    updated_contact_list[groupIndex].contacts[contactIndex].phone = contact.phone;
                    updated_contact_list[groupIndex].contacts[contactIndex].isPhoneValid = validarContato(contact.phone);
                    this.contacts = updated_contact_list;
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
            const result = await fetchJson("/certificadospage/setCertNumber.php", [{ "h": "delete_contato", "b": payload }]);

            if (result && result.success) {
                addToast("Sucesso", "Contato apagado com sucesso!", "success");

                //remove da lista
                const location = this.findContactLocationById(contact.id);
                if (location) {
                    const { groupIndex, contactIndex } = location;
                    if (this.contacts[groupIndex].contacts.length === 1) {
                        // Se for o único contato do grupo, remove o grupo inteiro
                        this.contacts.splice(groupIndex, 1);
                    } else {
                        // Caso contrário, remove apenas o contato específico
                        this.contacts[groupIndex].contacts.splice(contactIndex, 1);
                    }
                }


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