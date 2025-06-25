<template>
    <div id="logincontainer">
        <form @submit.prevent id="loginform">
            <p> Login </p>
            <input v-model="Login.login" name="login" placeholder="digite seu login" required>
            <input v-model="Login.password" name="senha" type="password" placeholder="digite sua senha" required>
            <button v-if="!Login.loadingVerificando" @click="Login.verifLogin()"> entrar </button>
            <div v-else class="loading-indicator"> 
                <div class="spinner"> </div>    
            </div>
        </form>
    </div>
</template>

<script>
    import Login from '../frontend/scripts/Janelas/login/Login';

    export default {
        data() {
            return {
                Login
            }
        }
    }
</script>

<style>
@import '../../src/frontend/styles/login.css';  /* loginpage */
</style>