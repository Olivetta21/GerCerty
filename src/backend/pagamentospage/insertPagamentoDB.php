<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

$user_permissions = getUserPermissions($credentials);
verifPerm(2, $user_permissions);

if (isset($_POST['vendPays']) && isset($_POST['benePays'])) {

    $vendPays = json_decode($_POST['vendPays'], true);
    $benePays = json_decode($_POST['benePays'], true);
    $responsavel = $credentials['usuario'];;

    try {
        $pdo->beginTransaction();

        $stmt_pagamento_id = $pdo->query("select nextval('pagamento_info_id_seq') as newid");
        $pagamento_id = $stmt_pagamento_id->fetchAll(PDO::FETCH_ASSOC)[0]['newid'];        

        $sqlpagto = "
            insert into pagamento_info (id, usuario_login) values ($pagamento_id, :responsavel);
        ";
        // Preparando o pagamento info
        $stmtP = $pdo->prepare($sqlpagto);
        $stmtP->bindParam(':responsavel', $responsavel, PDO::PARAM_STR);
        $pagto_infoOK = $stmtP->execute();


        // inserindo pagamentos------------------
        $placeHolders = [];
        $valores = [];
        foreach ($vendPays as $index => $vp){
            $placeHolders[] = "(?,?,?)";
            $valores[] = $pagamento_id;
            $valores[] = $vp;
            $valores[] = 'true';
        }        
        foreach ($benePays as $index => $bp){
            $placeHolders[] = "(?,?,?)";
            $valores[] = $pagamento_id;
            $valores[] = $bp;
            $valores[] = 'false';
        }
        $sql_pgto = "insert into pagamento (id, venda_id, isvendedor) values " . implode(',', $placeHolders) . ";";

        //echo correctJson("error", [$placeHolders, $valores, $sql_pgto]);
        //exit;

        $stmt_pagto = $pdo->prepare($sql_pgto);
        $res_pagtoOK = $stmt_pagto->execute($valores);
        //----------------------------------------


        if ($pagto_infoOK && $res_pagtoOK && $stmt_pagto->rowCount() === count($vendPays) + count($benePays)) {            
            $pdo->commit();
            echo correctJson2(["success" => true]);
            exit;
        }
        
        $pdo->rollBack();
        echo correctJson("error", "pagamento nao realizado");
        exit;
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo correctJson("error", "erro ao realizar pagamento" . $e->getMessage());
        exit;
    }
}


echo correctJson("error", "parametros incorretos para realizar o pagamento");
exit;
?>