<template>
    <div id="telasistemaholder">
        <div id="tsh-header" >
            <button class="whitesoftshadow" @click="router.go(-1)"> &#10094; </button>
            <div class="whitesoftshadow"> Sistema </div>
        </div>
        <div id="tsh-opcoescont" class="whitesoftshadow"> 
            <div @click="Sistema.configurando = 'usuarios'" > Usuarios </div>    
            <div @click="Sistema.configurando = 'grupos'"> Grupos </div>
        </div>
        <div id="tsh-config" class="scroll-blue">
            <div v-if="Sistema.configurando === 'usuarios'">                
                <div class="pesquisausuariosistema whitesoftshadow">
                    <span> Usuario </span>
                    <input v-model="Sistema.pesqUser" type="text" placeholder="nome do usuario" />
                    <button @click="Sistema.getUsuarios()"> pesquisar </button>
                </div>

                <div v-for="(u, uindex) in Sistema.usuariosSistemas" :key="uindex">
                    <div v-if="!u.modificandoAgora" @click="u.modificandoAgora = true" class="whitesoftshadow"> {{ u.nome }}</div>
                    <div v-else class="tsh-userconf whitesoftshadow">
                        <div class="tsh-uc-cred"> 
                            <div>
                                <div> Login </div>
                                <div> {{ u.login }} </div>
                            </div>
                            <div>
                                <div> Senha </div>
                                <input type="password" placeholder="senha" v-model="u.senha">
                            </div>
                            <div @click="u.modificandoAgora = false" class="close"> &times; </div>
                        </div>
                        <div class="tsh-uc-infos">
                            <div class="tsh-uc-i-input">
                                <div>
                                    <div> Nome </div>
                                    <input type="text" placeholder="nome do usuario" v-model="u.nome">
                                </div>
                                <div>
                                    <div> Comissao de Venda </div>
                                    <input type="text" placeholder="porcentagem" v-model="u.vend_comiss">
                                </div>
                                <div>
                                    <div> Comissao de Beneficio </div>
                                    <input type="text" placeholder="porcentagem" v-model="u.bene_comiss">
                                </div>
                                <button @click="Sistema.mostrarGruposDoUsuario(uindex)"
                                        @dblclick="Sistema.loadGruposNoUsuario(uindex)"> Grupos de permissão </button>
                                <button @click="Sistema.mostrarPermIndivDoUsuario(uindex)"
                                        @dblclick="Sistema.loadPermIndivNoUsuario(uindex)"> Permissões individuais </button>
                            </div>

                            <div v-if="u.verPermType === 'G'" class="tsh-uc-i-perms">
                                <div class="tsh-uc-i-p-head">
                                    GRUPOS DE PERMISSÕES
                                </div>
                                <div v-if="u.gp_perm" class="tsh-uc-i-p-body scroll-brown">
                                    <div v-for="(gp, gindex) in u.gp_perm" :key="gindex"
                                        :class="gp.integrante ? 'bg-green' : ''" 
                                        @click="Sistema.grupoIntegranteSwap(uindex, gindex)"
                                    > {{ gp.nome }} </div>
                                </div>
                            </div>
                            
                            <div v-else-if="u.verPermType === 'P'" class="tsh-uc-i-perms">
                                <div class="tsh-uc-i-p-head">
                                    PERMISSÕES INDIVIDUAIS
                                </div>
                                <div v-if="u.pi_perm" class="tsh-uc-i-p-body scroll-brown">
                                    <div v-for="(pi, pindex) in u.pi_perm" :key="pindex"
                                        :class="pi.integrante ? 'bg-green' : ''" 
                                        @click="Sistema.permIndivSwap(uindex, pindex)"
                                    > {{ pi.perm }} </div>
                                </div>
                            </div>

                            <div v-else class="tsh-uc-i-perms">                        
                                <div class="tsh-uc-i-p-head">
                                    PERMISSÕES
                                </div>
                                <div class="tsh-uc-i-p-body scroll-brown">
                                    <div> selecione </div>
                                </div>
                            </div>

                            <div @click="Sistema.salvarAlteracao(uindex)" class="tsh-uc-i-save paybutton">
                                <div> Salvar </div>
                            </div>
                        </div>
                    </div>                    
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Sistema from '@/frontend/scripts/Janelas/sistema/Sistema';
import router from '@/router';

export default {
    data() {
        return {
            router,
            Sistema,


            usuariosSistemas: Sistema.usuariosSistemas_
        }
    }
}

</script>


<style>
@import "../../src/frontend/styles/sistemapage.css";
</style>

