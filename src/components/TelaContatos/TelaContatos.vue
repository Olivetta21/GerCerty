<template>
    <div class="contactspage">
        <div class="ctt-header">
            <h2 class="ctt-title">Contatos</h2>
            <form @submit.prevent="Contatos.searchContacts()" class="header-actions">
                <input type="text" v-model="searchQuery" placeholder="Pesquisar contatos..." class="search-input" />
                <button type="submit" class="btn-search">
                    &#128269; Buscar
                </button>
                <button type="button" v-if="Login.verifPerm(16)" @click="Contatos.openAddContact()" class="btn-add">
                    <span>+</span> Novo Contato
                </button>
            </form>
        </div>
        <div class="ctt-body scroll-blue">
            <div v-if="isLoading" class="loading-indicator soft-panel" style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100px;">
                <div class="spinner" style="border: 4px solid rgba(0,0,0,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #007bff; animation: spin 1s linear infinite;"></div>
                <p style="margin-top:10px; color:#666;">Buscando...</p>
            </div>
            <table v-else class="contacts-table outside">
                <thead>
                    <tr>
                        <th>Contato</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="contact in contacts" :key="contact.name">
                        <td>
                            <table class="contacts-table inside">
                                <thead>
                                    <tr>
                                        <th>{{ contact.name }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="c in contact.contacts" :key="c.id">
                                        <td>
                                            <div>
                                                <button v-if="validarTelefone(c.phone) === 'phone'" type="button" @click="Contatos.sendWhatsapp(c)">
                                                    <span> 📞 </span>
                                                </button>
                                                <button v-else-if="validarTelefone(c.phone) === 'email'" type="button" @click="Contatos.sendEmail(c)">
                                                    <span> 📨 </span>
                                                </button>
                                                <button v-else type="button" @click="c.isOriginalVisible = !c.isOriginalVisible">
                                                    <span> 🔍 </span>
                                                </button>
                                                <button v-if="Login.verifPerm(15)" type="button" @click="startEditing(c)">
                                                    <span> ✏️ </span>
                                                </button>
                                                <button v-if="Login.verifPerm(17)" type="button" @click="Contatos.deleteContact(c)">
                                                    <span> 🗑️ </span>
                                                </button>
                                            </div>
                                            <div v-if="c.isOriginalVisible" class="client-contact ctt-original-info">
                                                <div class="ctt-number">{{ c.original.replace(/;+/g, "\n") }}</div>
                                            </div>
                                            <div v-else class="client-contact">
                                                <div class="ctt-number">{{ c.phone }}</div>
                                            </div>
                                            <div>
                                                <button v-if="validarTelefone(c.phone)" type="button" @click="c.isOriginalVisible = !c.isOriginalVisible">
                                                    <span> 🔍 </span>
                                                </button>
                                            </div>                            
                                        </td>
                                    </tr>
                                </tbody>
                            </table>                      
                        </td>
                    </tr>
                    <tr v-if="!contacts || contacts.length === 0">
                        <td colspan="2" class="no-results">Nenhum contato encontrado. Utilize a busca acima.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Add Contact Modal -->
        <div v-if="isAddModalOpen" class="modal-overlay">
            <div class="modal-content">
                <h3>Novo Contato</h3>
                <form @submit.prevent="Contatos.saveNewContact()">
                    <div class="form-group">
                        <label>Nome do Cliente</label>
                        <input type="text" v-model="newContactName" placeholder="Ex: João da Silva" required />
                    </div>
                    <div class="form-group">
                        <label>Contato do cliente</label>
                        <input type="tel" v-model="newContactPhone" :class="{'numero-errado': !validarTelefone(newContactPhone)}" required />
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-cancel" @click="Contatos.closeAddContact()">Cancelar</button>
                        <button type="submit" class="btn-confirm">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
        <!-- Edit Contact Modal -->
        <div v-if="isEditModalOpen" class="modal-overlay">
            <div class="modal-content">
                <h3>Editando o Contato: {{editing_contact.old_name}}</h3>
                <form @submit.prevent="Contatos.editContact(editing_contact); cancelEditing()">
                    <div class="form-group">
                        <label>Nome do Cliente</label>
                        <input type="text" v-model="editing_contact.name" placeholder="Ex: João da Silva" required />
                    </div>
                    <div class="form-group">
                        <label>Contato do cliente</label>
                            <input type="tel" :class="{'numero-errado': !validarTelefone(editing_contact.phone)}"  v-model="editing_contact.phone" required />
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-cancel" @click="cancelEditing()">Cancelar</button>
                        <button type="submit" class="btn-confirm">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { validarContato } from '@/frontend/scripts/utils';
import Contatos from '../../frontend/scripts/Janelas/contatos/Contatos';
import Login from '@/frontend/scripts/Janelas/login/Login';

export default {
    name: 'TelaContatos',
    data() {
        return {
            Login,
            Contatos,
            searchQuery: Contatos.searchQuery_,
            contacts: Contatos.contacts_,
            isLoading: Contatos.isLoading_,
            isAddModalOpen: Contatos.isAddModalOpen_,
            newContactName: Contatos.newContactName_,
            newContactPhone: Contatos.newContactPhone_,
            validarTelefone: validarContato,

            isEditModalOpen: false,
            editing_contact: null,
        }
    },
    methods: {
        startEditing(contact) {
            this.isEditModalOpen = true;
            this.editing_contact = {...contact};
            this.editing_contact.old_name = this.editing_contact.name 
        },
        cancelEditing() {
            this.isEditModalOpen = false;
            this.editing_contact = null;
        }
    }
}
</script>

<style scoped>
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.contactspage {
    margin: 5px;
    padding: 5px;
    background-color: var(--fundo-principal-claro);
    display: flex;
    flex-direction: column;
    height: calc(100% - 10px);
    min-width: 525px;
}

.ctt-header {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
}

.header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.search-input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s;
}

.search-input:focus {
    border-color: #007bff;
}

.btn-search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: #f8f9fa;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
}

.btn-search:hover {
    background-color: #e2e6ea;
}

.btn-search:active {
    transform: scale(0.98);
}

.btn-add {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
}

.btn-add:hover {
    background-color: #0056b3;
}

.btn-add:active {
    transform: scale(0.98);
}

.contacts-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.contacts-table.inside th {
    border-top: 1px solid var(--cor-borda-escuro);
}

tr {
    background-color: white;
    text-wrap: wrap;
}

td {
    border: none;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    gap: 10px;
    user-select: text;
}

.contacts-table.outside>tbody>tr>td {
    padding: 0 0 10px 0;
}
.contacts-table.outside>tbody>tr>td:hover {
    background-color: white;
}

.client-contact{
    flex: 1;
}
.client-contact.ctt-original-info {
    background-color: var(--cor-letra-claro);
}

.ctt-name {
    margin-bottom: 16px;
}
.ctt-number {
    white-space: break-spaces;
}

.contacts-table th, 
.contacts-table td {
    
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
}

.contacts-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
}

.contacts-table tbody tr:last-child td {
    border-bottom: none;
}

.contacts-table tbody tr:hover {
    background-color: var(--cor-letra-claro);
}

.no-results {
    text-align: center;
    color: #6c757d;
    padding: 30px !important;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 25px;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.modal-content h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
    color: #333;
}

.form-group {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
}

.form-group label {
    margin-bottom: 5px;
    font-weight: 500;
    font-size: 14px;
    color: #555;
}

.form-group input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 14px;
}

.form-group input:focus {
    border-color: #007bff;
    outline: none;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 25px;
}

.btn-cancel {
    padding: 8px 16px;
    background-color: #f1f3f5;
    color: #495057;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
}

.btn-cancel:hover {
    background-color: #e9ecef;
}

.btn-confirm {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
}

.btn-confirm:hover {
    background-color: #0056b3;
}


.numero-errado {
    border: 2px solid red !important;
}
</style>