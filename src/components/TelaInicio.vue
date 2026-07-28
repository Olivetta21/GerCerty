<template>
    <div id="tela-navegador">

        <div class="card" @click="$router.push('certificados')" style="background-image: url('/api/imagens/certificado.png');">
            <button>Certificados</button>
        </div>

        <div class="card" @click="$router.push('contatos') "  style="background-image: url('/api/imagens/telefone.png');">
            <button>Contatos</button>
        </div>

    </div>
</template>

<script>

export default {
    name: 'TelaInicio'
}
</script>

<style scoped>
    #tela-navegador {
        width: 100%;
        height: 100%;
        overflow: auto;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        background-color: var(--fundo-principal-claro);
        gap: 15px;
    }

    .card {
        width: 200px;
        aspect-ratio: 1/1;

        font-size: 16px;
        cursor: pointer;

        border: none;
        border-radius: 10px;

        background-color: white;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;

        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        
        align-content: end;
    }

    .card:hover {
        transform: scale(1.1);
        box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.3);
    }

    button {
        background-color: var(--fundo-secundario);
        color: var(--fundo-azul);
        border: none;
    }

    button:hover {
        background-color: unset;
        color: unset;
    }

</style>