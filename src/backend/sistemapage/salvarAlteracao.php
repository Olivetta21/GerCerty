<?php
include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];
$user_permissions = getUserPermissions($credentials);

verifPerm(10, $user_permissions);

if (isset($_POST['usuario'])){
    $usuario = json_decode($_POST['usuario'], true);
    if (!in_array(11, $user_permissions)){
        unset($usuario['pi_perm']);
        unset($usuario['gp_perm']);
    }


    try {
        $pdo->beginTransaction();

        //grupo de permissoes
        if (isset($usuario['gp_perm'])){
            $sql_grupo = "select gi.id
                from grupo_usuario_info gi
                join grupo_usuario g on g.id = gi.id
                where g.usuario_login = :login;
            ";
            $stmt_grupo = $pdo->prepare($sql_grupo);
            $stmt_grupo->bindParam(":login", $usuario['login'], PDO::PARAM_STR);
            $stmt_grupo->execute();
            $res_grupo = $stmt_grupo->fetchAll(PDO::FETCH_COLUMN);

            //separar entre qual grupo var ser removido e qual vai ser adicionado.           
            $para_adicionar = array_values(array_diff($usuario['gp_perm'], $res_grupo));
            $para_remover = array_values(array_diff($res_grupo, $usuario['gp_perm']));

            //removendo
            if (count($para_remover) > 0) {
                $params = [$usuario['login']];
                $remover_placeholder = [];

                foreach($para_remover as $re) {
                    $remover_placeholder[] = '?';
                    $params[] = $re;
                }

                $sql_remover = "
                    delete from grupo_usuario where usuario_login = ? and id in (".implode(',',$remover_placeholder).");
                ";
                $stmt_remover = $pdo->prepare($sql_remover);
                //$stmt_remover->bindParam(":login", $usuario['login'], PDO::PARAM_STR);
                $res_rem = $stmt_remover->execute([...$params]);

                if (count($para_remover) !== $stmt_remover->rowCount()) {
                    $pdo->rollBack();
                    echo correctJson("erro", "a quantidade de grupos deletados difere da quantidade de grupos informados");
                    exit;
                }
            }
            
            if (count($para_adicionar) > 0) {
                $params = [];
                $adicionar_placeholder = [];

                foreach ($para_adicionar as $pa) {
                    $adicionar_placeholder[] = '(?,?)';
                    $params[] = $usuario['login'];
                    $params[] = $pa;
                }

                $sql_adicionar = "
                    insert into grupo_usuario (usuario_login, id) values ".implode(',', $adicionar_placeholder).";
                ";

                $stmt_adicionar = $pdo->prepare($sql_adicionar);
                $res_adi = $stmt_adicionar->execute([...$params]);

                if (count($para_adicionar) !== $stmt_adicionar->rowCount()) {
                    $pdo->rollBack();
                    echo correctJson("erro", "a quantidade de grupos adicionados difere da quantidade de grupos informados");
                    exit;
                }
            }
        }



        //permissoes individuais
        if (isset($usuario['pi_perm'])) {
            $sql_perm = "select perm
                from permissoes
                where usuario_login = :login;
            ";
            $stmt_perm = $pdo->prepare($sql_perm);
            $stmt_perm->bindParam(":login", $usuario['login'], PDO::PARAM_STR);
            $stmt_perm->execute();
            $res_perm = $stmt_perm->fetchAll(PDO::FETCH_COLUMN);

            $para_adicionar = array_values(array_diff($usuario['pi_perm'], $res_perm));
            $para_remover = array_values(array_diff($res_perm, $usuario['pi_perm']));

            //removendo
            if (count($para_remover) > 0) {
                $params = [$usuario['login']];
                $remover_placeholder = [];

                foreach($para_remover as $re) {
                    $remover_placeholder[] = '?';
                    $params[] = $re;
                }

                $sql_remover = "
                    delete from permissoes where usuario_login = ? and perm in (".implode(',', $remover_placeholder).");
                ";

                $stmt_remover = $pdo->prepare($sql_remover);
                $stmt_remover->execute([...$params]);

                if (count($para_remover) !== $stmt_remover->rowCount()) {
                    $pdo->rollBack();
                    echo correctJson("erro", "a quantidade de permissoes removidas difere da quantidade de permissoes informadas");
                    exit;
                }
            }

            //adicionando
            if ($para_adicionar) {
                $params = [];
                $adicionar_placeholder = [];
                
                foreach($para_adicionar as $pa) {
                    $adicionar_placeholder[] = '(?,?)';
                    $params[] = $usuario['login'];
                    $params[] = $pa;
                }

                $sql_adicionar = "
                    insert into permissoes (usuario_login, perm) values ".implode(',',$adicionar_placeholder).";
                ";

                $stmt_adicionar = $pdo->prepare($sql_adicionar);
                $stmt_adicionar->execute([...$params]);

                if (count($para_adicionar) !== $stmt_adicionar->rowCount()) {
                    $pdo->rollBack();
                    echo correctJson("erro", "a quantidade de permissoes adiconadas difere da quantidade de permissoes informadas");
                    exit;
                }
            }
        }
        
        
        //propriedades do usuario
        $sql = "update usuario set ".($usuario['senha'] ? 'senha = :senha,' : ' ')."nome = :nome,
            bene_comiss = :bene_comiss,
            vend_comiss = :vend_comiss
            where login = :login;
        ";
        $stmt = $pdo->prepare($sql);
        ($usuario['senha']) ? $stmt->bindParam(":senha", $usuario['senha'], PDO::PARAM_STR) : 0;
        $stmt->bindParam(":nome", $usuario['nome'], PDO::PARAM_STR);
        $stmt->bindParam(":bene_comiss", $usuario['bene_comiss'], PDO::PARAM_STR);
        $stmt->bindParam(":vend_comiss", $usuario['vend_comiss'], PDO::PARAM_STR);
        $stmt->bindParam(":login", $usuario['login'], PDO::PARAM_STR);
        $res = $stmt->execute();

        
        if ($stmt->rowCount() !== 1) {
            $pdo->rollBack();
            echo correctJson("erro", "a quantidade de usuarios alterados difere difere de 1");
            exit;
        }

        //se nao saiu ate aqui, é porque deu tudo certo.
        $pdo->commit();
        echo correctJson("success", "usuario alterado com sucesso!");
        exit;
    } catch (PDOException $e) {
        if ($pdo->inTransaction()){
            $pdo->rollBack();
        }
        echo correctJson("error", $e->getMessage());
        exit;
    }
}
else {
    echo correctJson("error", "usuario não fornecido");
    exit;
}


echo correctJson("error", "fim de linha");
exit;
?>