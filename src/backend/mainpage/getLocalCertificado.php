<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

$user_permissions = getUserPermissions($credentials);
verifPerm(8, $user_permissions);


if (isset($_POST['cert_codi'])){
    $codigo = json_decode($_POST['cert_codi'], true);

    $sql = "
        select local from certificado where codi = :codigo;
    ";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(":codigo", $codigo, PDO::PARAM_INT);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($res){
            echo correctJson("local", $res[0]['local']);
            exit;
        }
    } catch (PDOException $e){
        echo correctJson("error", $e->getMessage());
        exit;
    }

    echo correctJson("warn", "sem retornos");
    exit;
}

echo correctJson("error", "codigo não definido");
exit;
?>