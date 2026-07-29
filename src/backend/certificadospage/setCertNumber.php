<?php
include "../funcs.php";

$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

function insertNovoTelefone($credentials, $nome_cliente, $numero, $anotacao = '') {
    try {
        $pdo = $credentials['pdo'];
        $sql = "INSERT INTO telefones_clientes (cliente, numero, original, prioridade, quem_inseriu, anotacao) VALUES (upper(:cliente), :numero, :original, :prioridade, :quem_inseriu, :anotacao) RETURNING id";
        $stmt = $pdo->prepare($sql);
        //returnJson(["erro"=>"nsei"]);
        
        $stmt->execute([
            ':cliente' => $nome_cliente,
            ':numero' => $numero,
            ':original' => "contatos(".$credentials['usuario'].")",
            ':prioridade' => 1,
            ':quem_inseriu' => $credentials['usuario'],
            ':anotacao' => $anotacao,
        ]);
        if ($stmt->rowCount() === 1) {
            $id = $stmt->fetch(PDO::FETCH_ASSOC)['id'];
            return ["success" => "Número inserido com sucesso", "id" => $id];
        } else {
            return ["error" => "Erro ao inserir número na tabela telefones_clientes"];
        }
    } catch (Exception $e) {
        return ["error" => $e->getMessage()];
    }
}

function updateCertNumber($credentials, $cert_codigo, $numero, $anotacao = '') {
    $pdo = $credentials['pdo'];

    try {
        $pdo->beginTransaction();
        $sql = "INSERT INTO telefones_clientes (cliente, numero, original, prioridade, quem_inseriu, anotacao) VALUES ((select nome from certificado where codi = :cert_codigo), :numero, :original, :prioridade, :quem_inseriu, :anotacao)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':cert_codigo' => $cert_codigo,
            ':numero' => $numero,
            ':original' => "certificados(".$credentials['usuario'].")",
            ':prioridade' => 1,
            ':quem_inseriu' => $credentials['usuario'],
            ':anotacao' => $anotacao,
        ]);
        if ($stmt->rowCount() === 1) {
            $sql = "update certificado set telefone_whatsapp = :numero where codi = :cert_codigo";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':cert_codigo' => $cert_codigo,
                ':numero' => $numero,
            ]);
            if ($stmt->rowCount() === 1) {
                $pdo->commit();
                return ["success" => "Número atualizado com sucesso"];
            } else {
                $pdo->rollBack();
                return ["error" => "Erro ao atualizar número"];
            }
        } else {
            $pdo->rollBack();
            return ["error" => "Erro ao inserir número na tabela telefones_clientes"];
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        return ["error" => $e->getMessage()];
    }
}

function updateTelefone($credentials, $id, $nome_cliente, $numero, $anotacao = '') {
    try {
        $pdo = $credentials['pdo'];
        $pdo->beginTransaction();

        $sqlSelect = "SELECT * FROM telefones_clientes WHERE id = :id";
        $stmtSelect = $pdo->prepare($sqlSelect);
        $stmtSelect->execute([
            ':id' => $id,
        ]);
        $contato = $stmtSelect->fetch(PDO::FETCH_ASSOC);

        if (!$contato) {
            return ["error" => "Contato não encontrado"];
        }

        $sql = "UPDATE telefones_clientes SET cliente = upper(:cliente), numero = :numero, quem_inseriu = :quem_inseriu, anotacao = :anotacao WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':cliente' => $nome_cliente,
            ':numero' => $numero,
            ':quem_inseriu' => $credentials['usuario'],
            ':anotacao' => $anotacao,
            ':id' => $id,
        ]);
        if ($stmt->rowCount() === 1) {
            auditar($credentials, "Adualizou Contato", "id: ".$id.";nome_antes: ".$contato['cliente'].";numero_antes: ".$contato['numero']."");
            $pdo->commit();
            return ["success" => "Contato atualizado com sucesso"];
        } else {
            $pdo->rollBack();
            return ["error" => "Erro ao atualizar contato"];
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        return ["error" => $e->getMessage()];
    }
}

function deleteTelefone($credentials, $id) {
    try {
        $pdo = $credentials['pdo'];
        $pdo->beginTransaction();

        $sqlSelect = "SELECT * FROM telefones_clientes WHERE id = :id";
        $stmtSelect = $pdo->prepare($sqlSelect);
        $stmtSelect->execute([
            ':id' => $id,
        ]);
        $contato = $stmtSelect->fetch(PDO::FETCH_ASSOC);

        if (!$contato) {
            return ["error" => "Contato não encontrado"];
        }

        auditar($credentials, "Removeu Contato", "id: ".$id.";nome: ".$contato['cliente'].";numero: ".$contato['numero'].";original: ".$contato['original']);

        $sql = "DELETE FROM telefones_clientes WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $id,
        ]);
        if ($stmt->rowCount() === 1) {
            $pdo->commit();
            return ["success" => "Contato apagado com sucesso"];
        } else {
            $pdo->rollBack();
            return ["error" => "Erro ao apagar contato"];
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        return ["error" => $e->getMessage()];
    }
}

$user_permissions = getUserPermissions($credentials);

if (isset($_POST['set_numero'])){
    $dados = json_decode($_POST['set_numero'], true);
    $resultado = updateCertNumber($credentials, $dados['cert_codigo'], removerEspacos($dados['numero']));

    if (isset($resultado["success"])) {
        echo correctJson2(["success" => $resultado]);
        exit;
    } else {
        echo correctJson2(["error" => $resultado]);
        exit;
    }
} else if (isset($_POST['add_contato'])) {
    verifPerm(16, $user_permissions);

    $dados = json_decode($_POST['add_contato'], true);
    $resultado = insertNovoTelefone($credentials, removerAcentos($dados['nome_cliente']), $dados['numero'], $dados['anotacao'] ?? '');
    if (isset($resultado["success"])) {
        addAtualizacao("CTTA", explode(' ', trim($dados['nome_cliente']))[0] ?? '', $credentials);
        echo correctJson2(["success" => $resultado['success'], "id" => $resultado['id']]);
        exit;
    } else {
        echo correctJson2(["error" => $resultado]);
        exit;
    }
} else if (isset($_POST['edit_contato'])) {
    verifPerm(15, $user_permissions);

    $dados = json_decode($_POST['edit_contato'], true);
    $resultado = updateTelefone($credentials, $dados['id'], removerAcentos($dados['nome_cliente']), $dados['numero'], $dados['anotacao'] ?? '');
    if (isset($resultado["success"])) {
        addAtualizacao("CTTE", explode(' ', trim($dados['nome_cliente']))[0] ?? '', $credentials);
        echo correctJson2(["success" => $resultado]);
        exit;
    } else {
        echo correctJson2(["error" => $resultado]);
        exit;
    }
} else if (isset($_POST['delete_contato'])) {
    verifPerm(17, $user_permissions);

    $dados = json_decode($_POST['delete_contato'], true);
    $resultado = deleteTelefone($credentials, $dados['id']);
    if (isset($resultado["success"])) {
        echo correctJson2(["success" => $resultado]);
        exit;
    } else {
        echo correctJson2(["error" => $resultado]);
        exit;
    }
}

echo correctJson2(["warn" => "sem parametro"]);
exit;
?>