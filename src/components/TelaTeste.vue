<template> 
    <div id="princ">
        <div id="panel1"> 
            <p> Texto p1 </p>
            <button> Botão p1 </button>
        </div>
        <div id="panel2">
            <table>
                <thead>
                    <tr>
                        <th>Header 1</th>
                    </tr>
                </thead>
                <tbody v-for="i in [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]" :key="i">
                    <tr>
                        <td>{{ i }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
    #princ {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    #princ > div {
        border: 1px solid var(--cor-borda-escuro);
        width: 100%;
    }

    #panel1 {
        height: 80px;
    }

    #panel2 {
        flex: 1;
        overflow: auto; 
        height: calc(100% - 80px);
    }
</style>