import Shepherd from '../../../../../node_modules/shepherd.js';
import '../../../../../node_modules/shepherd.js/dist/css/shepherd.css';

export function startGeneralTour() {
    // Crie uma nova instância do Shepherd
    let tour = null;

    tour = new Shepherd.Tour({
        defaultStepOptions: {
            classes: 'shepherd-theme-arrows',
            scrollTo: { behavior: 'smooth', block: 'center' }
        },
        useModalOverlay: true,
    });

    
    // Adicione passos ao tour
    tour.addStep({
        id: 'step-0',
        text: 'Olá, este guia irá te mostrar o funcionamento básico do site.',
        buttons: [
        {
            text: 'OK',
            action: tour.next,
        },
        
        {
            text: 'Não quero',
            action: tour.complete,
        },
        ],
    });

    // Adicione passos ao tour
    tour.addStep({
        id: 'step-1',
        text: 'Digite o intervalo inicial dos vencimentos...',
        attachTo: {
        element: '.itvd.B', // Seletor do elemento
        on: 'bottom', // Posição da dica
        },
        buttons: [
        {
            text: 'Próximo',
            action: tour.next,
        },
        ],
    });

    tour.addStep({
        id: 'step-2',
        text: 'Agora, o intervalo final.',
        attachTo: {
        element: '.itvd.D',
        on: 'top',
        },
        buttons: [
        {
            text: 'Voltar',
            action: tour.back,
        },
        {
            text: 'Próximo',
            action: tour.next,
        },
        ],
    });

    tour.addStep({
        id: 'step-3',
        text: 'Faça a pesquisa',
        attachTo: {
        element: '.itvd.E',
        on: 'top',
        },
        buttons: [
        {
            text: 'Voltar',
            action: tour.back,
        },
        {
            text: 'Próximo',
            action: tour.next,
        },
        ],
    });

    
    tour.addStep({
        id: 'step-4',
        text: 'Se o cliente já foi notificado por alguém, essa coluna ficará marcada.',
        attachTo: {
        element: '#thNotfi',
        on: 'top',
        },
        buttons: [
        {
            text: 'Voltar',
            action: tour.back,
        },
        {
            text: 'Próximo',
            action: tour.next,
        },
        ],
    });
    
    
    tour.addStep({
        id: 'step-5',
        text: 'Se o cliente já foi agendado por alguém, essa coluna e a coluna de notificação ficarão marcadas.',
        attachTo: {
        element: '#thAgend',
        on: 'top',
        },
        buttons: [
        {
            text: 'Voltar',
            action: tour.back,
        },
        {
            text: 'Próximo',
            action: tour.next,
        },
        ],
    });
    
    tour.addStep({
        id: 'step-6',
        text: 'Se o certificado tiver algum problema ou aviso, essa coluna ficará marcada.',
        attachTo: {
        element: '#thAlert',
        on: 'top',
        },
        buttons: [
        {
            text: 'Voltar',
            action: tour.back,
        },
        {
            text: 'Próximo',
            action: tour.next,
        },
        ],
    });

    
    tour.addStep({
        id: 'step-7',
        text: 'Duplo clique em algum para ver as informações mais detalhadas',
        attachTo: {
        element: '#listacert',
        on: 'top',
        },
        buttons: [
        {
            text: 'Voltar',
            action: tour.back,
        },
        ],
        when: {
            show: () => {
                // Adiciona um listener para monitorar se o modal foi aberto
                const modalObserver = new MutationObserver(() => {
                    if (document.querySelector('.modal-content')) {
                    // Quando o modal estiver ativo, avança o tour
                    modalObserver.disconnect(); // Para de observar
                    tour.next(); // Vai para o próximo passo
                    }
                });

                // Observa mudanças no DOM para detectar a abertura do modal
                modalObserver.observe(document.body, { childList: true, subtree: true });
            },
        },
    });

    
    
    tour.addStep({
        id: 'step-8',
        text: 'Aqui, você pode ver as informações do certificado, além de poder adicionar avisos, informar que notificou o cliente, ou que agendou ele.',
        attachTo: {
        element: '.mmc-body-cert',
        on: 'top',
        },
        buttons: [
        {
            text: 'Próximo',
            action: tour.next,
        },
        ],
    });
    
    tour.addStep({
        id: 'step-9',
        text: 'Aqui, você pode ver o cronograma dessa versão do certificado, podendo também alterar a versão',
        attachTo: {
        element: '.mmc-crono-holder',
        on: 'top',
        },
        buttons: [
        {
            text: 'Voltar',
            action: tour.back,
        },
        {
            text: 'Finalizar',
            action: tour.complete,
        },
        ],
    });

    // Inicia o tour
    tour.start();
}