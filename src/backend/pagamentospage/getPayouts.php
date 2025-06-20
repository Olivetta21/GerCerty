<?php
include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];
$user_permissions = getUserPermissions($credentials);
verifPerm(3, $user_permissions);


//--Selecionar uma relacao dos pagamentos com as vendas, somente o total do pagamento.
$sql1 = "
SELECT 
    pp.id AS pay_id, TO_CHAR(pp.data, 'DD/MM/YYYY HH24:MI') as data,
    round(SUM(CASE WHEN p.isvendedor THEN (1-v.bene_comiss) * (v.valor - v.despesa) * v.vend_comiss else (v.valor - v.despesa) * v.bene_comiss END), 2) AS total
	from pagamento_info pp 
	join pagamento p on pp.id = p.id
	JOIN venda v ON v.id = p.venda_id
	GROUP BY pp.id;
";



try {
	$stmt1 = $pdo->query($sql1);
	$r1 = $stmt1->fetchAll(PDO::FETCH_ASSOC);

    if ($r1) {
        echo correctJson2(["payouts" => $r1, "TK" => $_SESSION['csrf_token']]);
        exit;
    }
    else {
        echo correctJson2(["warn" => "nenhum pagamento encontrado"]);
        exit;
    }

} catch (PDOException $e) {   
	echo correctJson("error", "erro ao recuperar os payouts" . $e->getMessage());
	exit;
}
?>
