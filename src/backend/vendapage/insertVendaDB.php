<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

$user_permissions = getUserPermissions($credentials);
verifPerm(1, $user_permissions);


$params = '';
$params = $params . (isset($_POST['vendcomiss']) ? '1' : '0');
$params = $params . (isset($_POST['cert']) ? '1' : '0');
$params = $params . (isset($_POST['versao']) ? '1' : '0');
$params = $params . (isset($_POST['valor']) ? '1' : '0');
$params = $params . (isset($_POST['despesa']) ? '1' : '0');
$params = $params . (isset($_POST['newvenc']) ? '1' : '0');
$params = $params . (isset($_POST['newloca']) ? '1' : '0');
$params = $params . (isset($_POST['cron_agnd_id']) ? '1' : '0');
$params = $params . (isset($_POST['benecomiss']) ? '1' : '0');


if ($params === "111111111") {

    $vendedor = $credentials['usuario'];;
    $vendcomiss = json_decode($_POST['vendcomiss'], true);
    $cert = json_decode($_POST['cert'], true);
    $versao = json_decode($_POST['versao'], true);
    $valor = json_decode($_POST['valor'], true);
    $despesa = json_decode($_POST['despesa'], true);
    $cron_agnd_id = json_decode($_POST['cron_agnd_id'], true);
    $benecomiss = json_decode($_POST['benecomiss'], true);
    $newvenc = json_decode($_POST['newvenc'], true);
    $newloca = json_decode($_POST['newloca'], true);
    $newversao = $versao + 1;


    $sqlvenda = "
        insert into venda (vend_login, vend_comiss, cert_codi, cert_versao, valor, despesa, cron_agnd, bene_comiss) values
        (:vendedor, :vendcomiss, :cert, :versao, :valor, :despesa, :cron_agnd_id, :benecomiss);
    ";

    $sqlcert = "
        update certificado set vencimento = :newvenc, local = :newloca, versao = :newversao where codi = :cert and versao = :versao;
    ";

    try {

        //ver se alguem agendou momento antes de apertar o botao vender.
        if (!$cron_agnd_id) {
            $sql_teste = "select 1 from cronograma where cert_codi = :cert and cert_versao = :versao and type = 'AGND';";

            $stmt_test = $pdo->prepare($sql_teste);
            $stmt_test->bindParam(":cert", $cert, PDO::PARAM_INT);
            $stmt_test->bindParam(":versao", $versao, PDO::PARAM_INT);
            $res = $stmt_test->execute();

            if ($stmt_test->rowCount() > 0){
                echo correctJson("error", "venda cancelada, pois foi detectado um agendamento");
                exit;
            }
        }

        $pdo->beginTransaction();

        // Preparando a venda
        $stmtV = $pdo->prepare($sqlvenda);
        $stmtV->bindParam(':vendedor', $vendedor, PDO::PARAM_STR);
        $stmtV->bindParam(':vendcomiss', $vendcomiss, PDO::PARAM_STR);
        $stmtV->bindParam(':cert', $cert, PDO::PARAM_STR);
        $stmtV->bindParam(':versao', $versao, PDO::PARAM_STR);
        $stmtV->bindParam(':valor', $valor, PDO::PARAM_STR);
        $stmtV->bindParam(':despesa', $despesa, PDO::PARAM_STR);
        $stmtV->bindParam(':cron_agnd_id', $cron_agnd_id, PDO::PARAM_STR);
        $stmtV->bindParam(':benecomiss', $benecomiss, PDO::PARAM_STR);
        $vendaOK = $stmtV->execute();    

        // Preparando a atualizacao do certificado
        $stmtC = $pdo->prepare($sqlcert);
        $stmtC->bindParam(':newvenc', $newvenc, PDO::PARAM_STR);
        $stmtC->bindParam(':newloca', $newloca, PDO::PARAM_STR);
        $stmtC->bindParam(':newversao', $newversao, PDO::PARAM_STR);
        $stmtC->bindParam(':cert', $cert, PDO::PARAM_STR);
        $stmtC->bindParam(':versao', $versao, PDO::PARAM_STR);
        $atualizaCertOK = $stmtC->execute();

        if ($vendaOK && $atualizaCertOK && $stmtC->rowCount() === 1) {
            addAtualizacao("C1", $cert, $credentials);

            $pdo->commit();
            echo correctJson2(["success" => true]);
            exit;
        }
        
        $pdo->rollBack();
        echo correctJson("error", "venda ou atualizacao nao realizada");
        exit;
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo correctJson("error", "erro ao realizar venda" . $e->getMessage());
        exit;
    }
}


echo correctJson("error", "parametros incorretos para realizar a venda ->" . $params);
exit;
?>