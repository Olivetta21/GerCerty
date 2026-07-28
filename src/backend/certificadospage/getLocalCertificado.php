<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

$user_permissions = getUserPermissions($credentials);
verifPerm(8, $user_permissions);


if (isset($_POST['cert_codi'])){
    $cert_codi = json_decode($_POST['cert_codi'], true);


     try {
        $pdo->beginTransaction();
        
        $sql = "select fn_insert_cronograma(:cert_codi, :usuario_login, (select versao from certificado where codi = :cert_codi), 'REVL', '');";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':cert_codi', $cert_codi, PDO::PARAM_STR);
        $stmt->bindParam(':usuario_login', $credentials['usuario'], PDO::PARAM_STR);
        
        $stmt->execute();

        if ($stmt->rowCount() != 1) {
            $pdo->rollback();
		    echo correctJson2(["error" => "não inseriu corretamente"]);
            exit;
        }

        $sql = "
            update certificado set emusopor = coalesce(emusopor, :usuario_login) where codi = :cert_codi returning local;
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(":cert_codi", $cert_codi, PDO::PARAM_INT);
        $stmt->bindParam(":usuario_login", $credentials['usuario'], PDO::PARAM_STR);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($res){            
            addAtualizacao("C2", $cert_codi, $credentials);
            $pdo->commit();
            echo correctJson("local", $res[0]['local']);
            exit;
        }

        $pdo->rollBack();
        echo correctJson("error", "nenhum local retornado");
        exit;

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo correctJson("error", "erro ao recuperar local: " . $e->getMessage());
        exit;
    }




    echo correctJson("warn", "sem retornos");
    exit;
}

echo correctJson("error", "codigo não definido");
exit;
?>