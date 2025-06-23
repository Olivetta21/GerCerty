<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];
$user_permissions = getUserPermissions($credentials);

verifPerm(9, $user_permissions);


if (isset($_POST['cron_id'])) {
    $cron_id = json_decode($_POST['cron_id'], true);

    $sql = "select cert_codi from fn_delete_cronograma(:cron_id);";

    try {
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
