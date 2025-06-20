<?php
include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];
$user_permissions = getUserPermissions($credentials);

verifPerm(11, $user_permissions);

$sql_gp = "
    select id, nome from grupo_usuario_info;
";
$sql_pi = "
    select id, perm from tipos_permissao;
";

try {
    $stmt_gp = $pdo->query($sql_gp);
    $stmt_pi = $pdo->query($sql_pi);

    $res_gp = $stmt_gp->fetchAll(PDO::FETCH_ASSOC);
    $res_pi = $stmt_pi->fetchAll(PDO::FETCH_ASSOC);

    echo correctJson2(["grupos"=>$res_gp,"perms"=>$res_pi]);
    exit;
} catch (PDOException $e){
    echo correctJson("error", $e->getMessage());
    exit;
}


echo correctJson("error", "fim de linha");
exit;
?>