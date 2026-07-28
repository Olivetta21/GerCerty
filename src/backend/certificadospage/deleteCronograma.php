<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];
$user_permissions = getUserPermissions($credentials);

verifPerm(9, $user_permissions);


if (isset($_POST['cron_id'])) {
    $cron_id = json_decode($_POST['cron_id'], true);

    
    try {
        $sql = "select type, usuario_login from cronograma where id = :cron_id and type in ('AGND', 'NOTF', 'PRBL');";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':cron_id', $cron_id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() != 1) {
            echo correctJson("error", "Cronograma não encontrado ou não é do tipo permitido para exclusão");
            exit;
        }

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row['usuario_login'] !== $credentials['usuario']) {
            echo correctJson("error", "Você não é o proprietário deste cronograma");
            exit;
        }

        $sql = "select cert_codi from fn_delete_cronograma(:cron_id);";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':cron_id', $cron_id, PDO::PARAM_INT);
        $stmt->execute();

        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($stmt->rowCount() > 0) {
            addAtualizacao("C2", $res[0]['cert_codi'], $credentials);
            echo correctJson2(["success" => true]);
            exit;
        }
        
        echo correctJson("error", "Nenhum cronograma foi deletado");
        exit;

    } catch (PDOException $e) {   
        echo correctJson("error", "erro ao deletar cronograma" . $e->getMessage());
        exit;
    }
} 
else {
    echo correctJson("error", "o cron_id nao foi fornecido");
    exit;
}
      

echo correctJson("error", "endline");
exit;
?>
