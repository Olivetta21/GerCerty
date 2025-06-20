<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];
$user_permissions = getUserPermissions($credentials);

verifPerm(9, $user_permissions);


if (isset($_POST['cron_id'])) {
    // Dados a serem inseridos
    $cron_id = json_decode($_POST['cron_id'], true);
    $safe_login = $credentials['usuario'];;


    // Verificar se esse usuario pode deletar esse cronograma.
    $sql = "
        select cr.id, ce.codi
            from cronograma cr
            join certificado ce on ce.codi = cert_codi and ce.versao = cr.cert_versao
            where cr.type != 'REVL' and cr.usuario_login = :login and cr.id = :cron_id;
    ";

    try {
        // Verificação
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':cron_id', $cron_id, PDO::PARAM_INT);
        $stmt->bindParam(':login', $safe_login, PDO::PARAM_STR);
        $stmt->execute();

        $res = $stmt->fetchAll(PDO::FETCH_ASSOC)[0];
        
        if ($res != null){ //se encontrou, pode deletar.
            $sql_del = "delete from cronograma where id = ".$res['id'].";";

            $res_del = $pdo->exec($sql_del);
            
            if ($res_del > 0) {
                addAtualizacao("C2", $res['codi'], $credentials);
                echo correctJson2(["success" => true]);
                exit;
            }

            echo correctJson("error", "problema no sql_del");
            exit;
        }
        
        echo correctJson("error", "res nulo, cronograma ja deletado?");
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
      

echo correctJson("error", "nao foi possivel se conectar ao banco");
exit;

?>
