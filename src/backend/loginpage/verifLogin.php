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

    $token = genTK();
    
    try {
        $pdo->beginTransaction();

        // Using the new fn_do_user_login function
        $sql = "SELECT * FROM fn_do_user_login(:login, :senha, :ip, :token)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':login', $login, PDO::PARAM_STR);
        $stmt->bindParam(':senha', $password, PDO::PARAM_STR);
        $stmt->bindParam(':ip', $cli_Ip, PDO::PARAM_STR);
        $stmt->bindParam(':token', $token, PDO::PARAM_STR);
        $stmt->execute();
        $loginResult = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($loginResult) {
            $user_permissions = getUserPermissions(["pdo"=>$pdo, "usuario"=>$loginResult['login']]);
            
            $credential = [
                'login' => $loginResult['login'],
                'nome' => $loginResult['nome'],
                'senha' => $loginResult['senha'],
                'vend_comiss' => $loginResult['vend_comiss']
            ];
            
            $last_login = $loginResult['last_login'] ?: 'nunca';
            
            $pdo->commit();
            echo correctJson2(["credent" => $credential, "user_permissions" => $user_permissions, "LKU" => $loginResult['last_update'], "TK" => $loginResult['token'], "last_login" => $last_login]);
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
