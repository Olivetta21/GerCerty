<?php
include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];
$user_permissions = getUserPermissions($credentials);


$filter_user_sql = 'login = :login';
$filter_perm_sql = 'p.usuario_login = :login';

$nomesearch = null;

if (isset($_POST['nomesearch'])) {
    $nomesearch = json_decode($_POST['nomesearch'], true);

    if ($nomesearch != null && in_array(10, $user_permissions)){ //se o usuario nao tiver permissao para modificar outros usuario, retornar somente o proprio.
        $filter_user_sql = 'upper(nome) like :nomesearch';
        $filter_perm_sql = 'upper(u.nome) like :nomesearch';
    }
    else $nomesearch = null;
}
$sql_user = "select login, null as senha, nome, bene_comiss, vend_comiss from usuario where $filter_user_sql order by nome;";
$sql_grupo = "
    select gi.id, p.usuario_login as login
        from grupo_usuario_info gi
        join grupo_usuario p on p.id = gi.id
        join usuario u on u.login = p.usuario_login
        where $filter_perm_sql;
";
$sql_perm = "
    select p.perm, p.usuario_login as login
        from permissoes p
        join usuario u on u.login = p.usuario_login
        where $filter_perm_sql;
";


try {
    $stmt_user = $pdo->prepare($sql_user);
    $stmt_grupo = $pdo->prepare($sql_grupo);
    $stmt_perm = $pdo->prepare($sql_perm);

    if ($nomesearch != null) {
        $upper_nome = strtoupper("%$nome%");
        $stmt_user->bindParam(":nomesearch", $upper_nome, PDO::PARAM_STR);
        $stmt_grupo->bindParam(":nomesearch", $upper_nome, PDO::PARAM_STR);
        $stmt_perm->bindParam(":nomesearch", $upper_nome, PDO::PARAM_STR);
    } else {
        $stmt_user->bindParam(":login", $credentials['usuario'], PDO::PARAM_STR);
        $stmt_grupo->bindParam(":login", $credentials['usuario'], PDO::PARAM_STR);
        $stmt_perm->bindParam(":login", $credentials['usuario'], PDO::PARAM_STR);
    }

    $stmt_user->execute();
    $stmt_grupo->execute();
    $stmt_perm->execute();

    $res_user = $stmt_user->fetchAll(PDO::FETCH_ASSOC);
    $res_grupo = $stmt_grupo->fetchAll(PDO::FETCH_ASSOC);
    $res_perm = $stmt_perm->fetchAll(PDO::FETCH_ASSOC);
    
    if (in_array(11, $user_permissions)){
        //colocar os grupos em seus respectivos usuarios.
        foreach ($res_grupo as $gp){
            foreach ($res_user as &$u){
                if ($u['login'] === $gp['login']){
                    $u['gp_perm'][] = ["id"=>$gp['id'], "db"=>true];
                    break;
                }
            }
        }

        //colocar as permissoes individuais em seus respectivos usuarios.
        foreach ($res_perm as $pi){
            foreach($res_user as &$u){
                if ($u['login'] === $pi['login']){
                    $u['pi_perm'][] = ["id"=>$pi['perm'], "db"=>true];
                    break;
                }
            }
        }
    }

    if ($res_user){
        echo correctJson2(["usuarios"=>$res_user]);
        exit;
    }

    echo correctJson("warn", "nenhum dado");
    exit;
} catch (PDOException $e){
    echo correctJson("error", $e->getMessage());
    exit;
}

echo correctJson("error", "fim de linha");
exit;
?>