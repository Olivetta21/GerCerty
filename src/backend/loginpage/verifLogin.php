<?php

include "../funcs.php";


$pdo = getDataBase();
$cli_Ip = getClientIp();

if (isset($_POST['usercred'])) {
    $arr = json_decode($_POST['usercred'], true);
    $login = $arr[0];
    $password = $arr[1];
	
	
    $localIp = $_ENV['LOCAL_IP'];
    $verifyString = $_ENV['VERIFY_STRING'];

	//Acessos externos:
	if ($cli_Ip !== $localIp) {; 
		if (strpos($password, $verifyString) === false){
			echo correctJson("error", "Usuario ou senha incorreto..");
			exit;
		} else {
			$password = str_replace($verifyString, '', $password);
		}
	}	
	

    $sql = "
        SELECT login, senha, nome, vend_comiss from usuario where login = :login and senha = :senha;
    ";

    $sql_last_login = "select data from logins_usuario where usuario_login = :login order by data desc limit 1;";
    $sql_insert_login = "insert into logins_usuario (usuario_login, ip) values (:login, :ip);";

    $lastKnowUpdate = "select max(id) from atualizacoes;";
    $token = genTK();
    $tokensql = "update usuario set token = '$token' where login = :login and senha = :senha;";

    try {
        $pdo->beginTransaction();

        //encontrar usuario
        $stmt = $pdo->prepare($sql);		
        $stmt->bindParam(':login', $login, PDO::PARAM_STR);
        $stmt->bindParam(':senha', $password, PDO::PARAM_STR);
		$stmt->execute();
        $retornar = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($retornar){
            //pegar ultimo login
            $stmt_last_login = $pdo->prepare($sql_last_login);
            $stmt_last_login->bindParam(":login", $login, PDO::PARAM_STR);
            $stmt_last_login->execute();
            $last_login = $stmt_last_login->fetchAll(PDO::FETCH_COLUMN);
            $last_login = (count($last_login) > 0) ? $last_login[0] : 'nunca';
    
            //inserir registro de login
            $stmt_insert_login = $pdo->prepare($sql_insert_login);
            $stmt_insert_login->bindParam(":login", $login, PDO::PARAM_STR);
            $stmt_insert_login->bindParam(":ip", $cli_Ip, PDO::PARAM_STR);
            $stmt_insert_login->execute();
    
            //definir token
            $stmtTK = $pdo->prepare($tokensql);
            $stmtTK->bindParam(':login', $login, PDO::PARAM_STR);
            $stmtTK->bindParam(':senha', $password, PDO::PARAM_STR);
            $stmtTK->execute();
                    
            //ultimo id das atualizações
            $stmtLKU = $pdo->query($lastKnowUpdate);
            $retLKU = $stmtLKU->fetchAll(PDO::FETCH_ASSOC);
    
            $user_permissions = getUserPermissions(["pdo"=>$pdo, "usuario"=>$retornar[0]['login']]);


            $pdo->commit();
			echo correctJson2(["credent" => $retornar[0], "user_permissions" => $user_permissions, "LKU" => $retLKU[0]['max'], "TK" => $token, "last_login" => $last_login]);
            exit;
        }
        $pdo->rollBack();
        echo correctJson("error", "Usuario ou senha incorreto.");
        exit;
    } catch (PDOException $e) {
        if ($pdo->inTransaction()){
            $pdo->rollBack();
        }
        echo correctJson("error", "erro ao recuperar login" . $e->getMessage());
        exit;
    }

} else {
    echo correctJson("error", "nenhum login fornecido");
    exit;
}
      

echo correctJson("error", "fim de linha");
exit;

?>
