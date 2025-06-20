export function formatarData(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda, se necessário
    const dia = String(data.getDate()).padStart(2, '0'); // Adiciona zero à esquerda, se necessário

    return `${ano}-${mes}-${dia}`;
}

export function floatData(mod) {
    let data = new Date(Date.now());
    data.setDate(data.getDate() + mod);
    return formatarData(data);
}

export function daysToExpire(data_str){
    const data = new Date(data_str);
    const hoje = new Date();

    const diffMs = data - hoje;

    //a diferencia é em ms, convertendo em dias fica:
    return Math.floor(diffMs / 86400000);
}

export function getMonthInterval(data, isInicio){

    if (isInicio) {
        const inicio = data;
        inicio.setDate(1);
        return formatarData(inicio);
    }


    const fim = data;
    fim.setMonth(fim.getMonth() + 1);
    fim.setDate(0);
    return formatarData(fim);
}

export function sleep(ms) {
    if (ms > 0) return new Promise(resolve => setTimeout(resolve, ms));
}

export function prepareObjArrToCSV(conteudo, colunas) {
    if (!Array.isArray(conteudo) || !conteudo.length || !colunas ) return;

    const selectedColumns = Object.keys(colunas);
    const headers = selectedColumns.map(col => colunas[col]);
    const rows = conteudo.map(obj => selectedColumns.map(col => obj[col]));
    //selectedColumns:
    //  [idpc, login, valor]
    //data:
    //  [{ idpc: 1, borv: 'BEçNE', login: 'admin', pago: false, valor: '2.25' },
    //  { idpc: 7, borv: 'VEND', login: 'admçin', pago: false, valor: '126.88' }]
    //result:
    //  [[1, admin, 2.25], [7, admçin, 126.88]]

    const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');

    return csvContent;
}

export function generateCSV(csvContent, titulo){
    if (!titulo) titulo = 'sem_titulo';

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', titulo+'.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function numToStr(num){
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}