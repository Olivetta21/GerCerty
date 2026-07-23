<?php

require __DIR__ . "/../funcs.php";
require __DIR__ . "/f_login.php";

if (isset($_POST["logoff"])) {
    resetAccessToken();
    returnJson(["logoff" => true]);
}
else if (isset($_POST['usercred'])) {
    $arr = json_decode($_POST['usercred'], true);
    $login = $arr[0];
    $senha = $arr[1];
	
    $result = fazerLogin($login, $senha);
    if (isset($result['usuario']) && isset($result['usuario']['access_token'])) {
        $access_token = $result['usuario']['access_token'];
        if (!empty(trim($access_token))) {
            setcookie("access_token", $access_token, time() + (60 * 60 * 24), "/");
        }
    }

    returnJson($result);
}
else if (isset($_POST["access_token"])) {
    $access_token = json_decode($_POST["access_token"], true);
    
    returnJson(testAccessToken($access_token));
}
else {
    returnJson(["error" => errorMessage("Dados inválidos", [$_POST, $_COOKIE, $_REQUEST])]);
}