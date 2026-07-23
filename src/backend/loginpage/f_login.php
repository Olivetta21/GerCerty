<?php

function selectUsuarioPorSenha($pdo, $login, $senha, $tipo = "senha") {
    $cli_Ip = getClientIp();
    $localIp = $_ENV['LOCAL_IP'];
    $verifyString = $_ENV['VERIFY_STRING'];

    
	//Acessos externos:
	if ($cli_Ip !== $localIp && $tipo !== "token") {; 
		if (strpos($senha, $verifyString) === false){
			return false;
		} else {
			$senha = str_replace($verifyString, '', $senha);
		}
	}
    
    $stmt = $pdo->prepare("SELECT * FROM fn_do_user_login(:login, :senha, :ip, :tipo)");
    
    $stmt->execute([
        "login"=>$login,
        "senha"=>$senha,
        "ip"=>$cli_Ip,
        "tipo"=>$tipo
    ]);
    
    if ($stmt->rowCount() === 1) {
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    else {
        return false;
    }
}

function insertAccess_Token($pdo, $usuario_login) {
    $stmt = $pdo->prepare("insert into usuario_access_token(token, usuario_login, expires_at) values (:token, :usuario_login, now() + interval '1 day')");
    $new_access_token = getRandomHex();
    $stmt->execute([
        "token"=>$new_access_token,
        "usuario_login"=>$usuario_login
    ]);
    if ($stmt->rowCount() > 0) {
        return $new_access_token;
    } else {
        return false;
    }
}

function selectPermissoesDoUsuario($pdo, $usuario_login) {
    $permissoes = getUserPermissions(["pdo"=>$pdo, "usuario"=>$usuario_login]);

    if (count($permissoes) > 0) {
        return $permissoes;
    } else {
        return false;
    }
}

function selectUsuarioPorToken($pdo, $access_token) {
    $stmt = $pdo->prepare("select login, senha from usuario where login = (select login from getUsuarioByToken(:access_token))");
    $stmt->execute([
        "access_token"=> $access_token
    ]);
    if ($stmt->rowCount() === 1) {
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        return selectUsuarioPorSenha($pdo, $res['login'], $res['senha'], "token");
    } else {
        return false;
    }
}

function fazerLogin($login, $senha) {
    $pdo = null;
    try {
        $pdo = getDataBase();
        $pdo->beginTransaction();
        
        $usuario = selectUsuarioPorSenha($pdo, $login, $senha);
        if (!$usuario) return ["error"=> errorMessage("Usuario não encontrado", "login=". $login ."")];
        
        $access_token = insertAccess_Token($pdo, $usuario['login']);
        if (!$access_token) return ["error"=> errorMessage("access_token não adicionado", "usuario=". $usuario ."")];

        $permissoes = selectPermissoesDoUsuario($pdo, $usuario["login"]);
        if (!$permissoes) return ["error"=> errorMessage("Erro ao recuperar permissões", "usuario=". $usuario ."")];
        
        $usuario['access_token'] = $access_token;
        $usuario['permissoes'] = $permissoes;

        $pdo->commit();
        return ["success"=>true, "usuario"=>$usuario];
    } catch (Exception $e) {
        if ($pdo?->inTransaction()) {
            $pdo->rollBack();
        }
        return ["error"=> errorMessage("Exceção ao fazer login", $e->getMessage())];
    }
}

function testAccessToken($access_token) {
    $pdo = null;
    try {
        $pdo = getDataBase();

        $usuario = selectUsuarioPorToken($pdo, $access_token);
        if (!$usuario) return ["error"=> errorMessage("Access_token inválido", "access_token=" . $access_token ."")];
        
        $permissoes = selectPermissoesDoUsuario($pdo, $usuario["login"]);
        if (!$permissoes) return ["error"=> errorMessage("Erro ao recuperar permissões", "usuario=". $usuario ."")];
        
        $usuario['access_token'] = $access_token;
        $usuario['permissoes'] = $permissoes;

        return ["success"=>true, "usuario"=>$usuario];
    } catch (Exception $e) {
        return ["error"=> errorMessage("Exceção ao testar access_token", $e->getMessage())];
    }
}