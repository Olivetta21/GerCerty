<?php
include "../funcs.php";



$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

function buscarTelefonesPorNome($pdo, $nomePessoa) {
    // Separa o nome pelos espaços em branco e remove partes vazias
    $nomePessoa = strtoupper($nomePessoa);
    $partesNome = array_values(array_filter(explode(' ', trim($nomePessoa))));
    
    if (empty($partesNome)) {
        return [];
    }

    $primeiroNome = $partesNome[0];
    $outrosNomes = array_slice($partesNome, 1);

    //Exclui nomes pequenos que não dizem nada
    $excluir = ["DE", "DA", "DO", "E", "DO", "DOS", "DAS"];
    $outrosNomes = array_filter($outrosNomes, function($nome) use ($excluir) {
        return !in_array($nome, $excluir);
    });

    // Obrigatoriamente contém o primeiro nome
    $sql = "SELECT * FROM telefones_clientes WHERE cliente LIKE :primeiro_nome";
    $params = [':primeiro_nome' => '%' . $primeiroNome . '%'];

    // Se houver outros nomes, deve conter ao menos um deles
    if (!empty($outrosNomes)) {
        $condicoesOr = [];
        foreach ($outrosNomes as $index => $nome) {
            $paramName = ':outro_nome_' . $index;
            $condicoesOr[] = "cliente LIKE " . $paramName;
            $params[$paramName] = '%' . $nome . '%';
        }
        $sql .= " AND (" . implode(' OR ', $condicoesOr) . ")";
    }

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($resultados) > 1) {
            $nomesBusca = array_merge([$primeiroNome], $outrosNomes);

            usort($resultados, function($a, $b) use ($nomesBusca, $primeiroNome) {
                $scoreA = 0;
                $scoreB = 0;
                
                $clienteA = strtoupper($a['cliente']);
                $clienteB = strtoupper($b['cliente']);

                $posicoesA = [];
                $posicoesB = [];

                // 1. Especificidade (quantidade de nomes encontrados) e posições
                foreach ($nomesBusca as $nome) {
                    $posA = strpos($clienteA, $nome);
                    if ($posA !== false) {
                        $scoreA++;
                        $posicoesA[] = $posA;
                    }
                    
                    $posB = strpos($clienteB, $nome);
                    if ($posB !== false) {
                        $scoreB++;
                        $posicoesB[] = $posB;
                    }
                }

                if ($scoreA !== $scoreB) {
                    return $scoreB - $scoreA; // Ordem decrescente
                }

                // 2. Primeiro nome da pesquisa também ser o primeiro nome do cliente
                $partesA = array_values(array_filter(explode(' ', $clienteA)));
                $partesB = array_values(array_filter(explode(' ', $clienteB)));
                
                $primeiroA = !empty($partesA) ? $partesA[0] : '';
                $primeiroB = !empty($partesB) ? $partesB[0] : '';
                
                $scorePrimeiroA = ($primeiroA === $primeiroNome) ? 1 : 0;
                $scorePrimeiroB = ($primeiroB === $primeiroNome) ? 1 : 0;

                if ($scorePrimeiroA !== $scorePrimeiroB) {
                    return $scorePrimeiroB - $scorePrimeiroA; // Ordem decrescente
                }

                // 3. Ordem de todos os nomes da pesquisa (sequência)
                $scoreSeqA = 0;
                for ($i = 0; $i < count($posicoesA) - 1; $i++) {
                    if ($posicoesA[$i] < $posicoesA[$i+1]) $scoreSeqA++;
                }

                $scoreSeqB = 0;
                for ($i = 0; $i < count($posicoesB) - 1; $i++) {
                    if ($posicoesB[$i] < $posicoesB[$i+1]) $scoreSeqB++;
                }

                if ($scoreSeqA !== $scoreSeqB) {
                    return $scoreSeqB - $scoreSeqA; // Ordem decrescente
                }

                // 4. Ordem crescente de prioridade (quanto menor, mais importante)
                $priA = isset($a['prioridade']) ? (int)$a['prioridade'] : 9999;
                $priB = isset($b['prioridade']) ? (int)$b['prioridade'] : 9999;

                return $priA - $priB;
            });
        }

        return $resultados;
    } catch (PDOException $e) {
        // Pode ser tratado lançando a exceção novamente ou retornando falso/array vazio
        echo $e;
    }
}

/* Metodos utilizados para ordenação: 
1- Especificidade (scoreA / scoreB): O principal ainda é o número de nomes que deram "match".
Quanto mais pedaços do nome pesquisado existirem na string do banco de dados, melhor.
2- O primeiro nome bater (scorePrimeiroA / scorePrimeiroB): O código agora extrai a primeira
palavra do registro do cliente no banco de dados, e verifica se ela é exatamente igual ao
primeiro nome sendo pesquisado. Se for igual, esse registro ganha prioridade na frente dos
outros com a mesma especificidade.
3- Sequência Correta (scoreSeqA / scoreSeqB): O código guarda a posição (o índice na string)
onde ele encontrou cada palavra da pesquisa dentro do nome do cliente. Depois, ele vê quantos
desses nomes aparecem numa ordem crescente (um vindo depois do outro). Quanto mais na ordem
certa, maior a pontuação.
4-Grau de Prioridade (priA / priB): Por último, caso todas as pontuações acima empatem, ele
usa o valor da coluna prioridade (quanto menor o número, mais prioritário).
*/

if (isset($_POST['nome'])){
    $nome = json_decode($_POST['nome'], true);
    $nome = removerAcentos($nome);
    auditar($credentials, "Busca de Telefone", $nome);
    
    $resultado = buscarTelefonesPorNome($pdo, $nome);
    
    echo correctJson2(["numeros" => $resultado]);
    exit;
} else if (isset($_POST['info'])){
    $info = json_decode($_POST['info'], true);
    auditar($credentials, "Notificando Cliente", $info);
    
    returnJson(["info"=>$info]);
}

echo correctJson2(["warn" => "Nome ou numero não definido"]);
exit;
?>