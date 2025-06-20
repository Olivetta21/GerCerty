<?php
include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

$user_permissions = getUserPermissions($credentials);
verifPerm(3, $user_permissions);

$sql1FilterA = '';
$sql1FilterB = '';
$sql2Filter = '';
$filterSet = 0;
$vars = [];



if (isset($_POST['id_pagto'])) {
    $filterSet = 1;
    $vars = json_decode($_POST['id_pagto'], true);
    $sql1FilterA = 'where p.id = :var0';
    $sql1FilterB = 'where p.id = :var0';
    $sql2Filter = 'where :var0 in (pv.id, pb.id)';
}
else if (isset($_POST['data_venda'])) {
    $filterSet = 2;
    $vars = json_decode($_POST['data_venda'], true);
    $sql1FilterA = 'where date(v.data) between :var0 and :var1';
    $sql1FilterB = 'where date(v.data) between :var0 and :var1';
    $sql2Filter = 'where date(v.data) between :var0 and :var1';
}


//--Selecionar os beneficientes e os vendedores pagos e nao pagos, com seus valores, agrupado
$sql1 = "
select ROW_NUMBER() OVER (ORDER BY borv) AS IDPC, borv, login, pago, round(sum(valor), 2) as valor from
(
select
	case when p.id is null then false else true end as pago,
	u.login,
	'VEND' as borv,
	(1-v.bene_comiss) * (v.valor - v.despesa) * v.vend_comiss as valor
	from venda v
	join usuario u on u.login = v.vend_login
	left join pagamento p on p.venda_id = v.id and p.isvendedor = true
    $sql1FilterA

union ALL

select
	case when p.id is null then false else true end as pago,
	u.login,
	'BENE' as borv,
	v.bene_comiss * (v.valor - v.despesa) as valor
	from venda v
	join cronograma cr on cr.id = v.cron_agnd
	join usuario u on u.login = cr.usuario_login
	left join pagamento p on p.venda_id = v.id and p.isvendedor = false
    $sql1FilterB
)
group by borv, login, pago;
";

//--Selecionar todas as vendas em um periodo.
$sql2 = "
	select v.id as venda, us.login as beneficiario, ve.login as vendedor, c.nome cartao, v.valor, v.despesa,
	case when pb.id is not null then true else false end as pagto_bene,
	v.bene_comiss as bene_pcent, round(v.bene_comiss * (v.valor - v.despesa), 2) as vlr_bene,
	case when pv.id is not null then true else false end as pagto_vend,
	v.vend_comiss as vend_pcent, round((1-v.bene_comiss) * (v.valor - v.despesa) * v.vend_comiss, 2) as vlr_vend,
	round((1-v.bene_comiss) * (v.valor - v.despesa) * (1-v.vend_comiss), 2) as vlr_empresa,
	date(v.data) as data
	from venda v
	join certificado c on c.codi = v.cert_codi
	join usuario ve on ve.login = v.vend_login
	left join pagamento pv on pv.venda_id = v.id and pv.isvendedor = true
	left join pagamento pb on pb.venda_id = v.id and pb.isvendedor = false
	left join cronograma cr on cr.id = v.cron_agnd
	left join usuario us on us.login = cr.usuario_login
    $sql2Filter
";


 try {    
    $stmt1 = $pdo->prepare($sql1);
    $stmt2 = $pdo->prepare($sql2);
    if ($filterSet === 1){
        $stmt1->bindParam(':var0', $vars[0], PDO::PARAM_INT);
        $stmt2->bindParam(':var0', $vars[0], PDO::PARAM_INT);
    }
    else if ($filterSet === 2){
        $stmt1->bindParam(':var0', $vars[0], PDO::PARAM_STR);
        $stmt1->bindParam(':var1', $vars[1], PDO::PARAM_STR);
        $stmt2->bindParam(':var0', $vars[0], PDO::PARAM_STR);
        $stmt2->bindParam(':var1', $vars[1], PDO::PARAM_STR);
    }
    else if ($filterSet != 0) {
        echo correctJson("error", "filtro nao reconhecido!");
        exit;
    }

    $stmt1->execute();
    $stmt2->execute();
    
	$r1 = $stmt1->fetchAll(PDO::FETCH_ASSOC);
    $r2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {   
	echo correctJson("error", "erro ao recuperar pagamentos dos beneficiarios e vendedores" . $e->getMessage());
	exit;
}

// Guardar todas as vendas em seus respectivos grupos.
foreach ($r2 as $c) {
    $nomeBene = $c['beneficiario'];
    $benePagto = $c['pagto_bene'] ? true : false;
    $foundBene = false;
	
    $nomeVend = $c['vendedor'];
    $vendPagto = $c['pagto_vend'] ? true : false;
    $foundVend = false;

    // Iterar sobre o array $r1
    foreach ($r1 as &$e) {  // Usar referência para modificar diretamente o array $r1	
        if (!$foundBene && $e['borv'] == 'BENE') {
            if ($e['login'] === $nomeBene && $e['pago'] === $benePagto) {
                $e['listagem'][] = $c;  // Adicionar à lista de cada beneficiário
                $foundBene = true;
            }
        } elseif (!$foundVend && $e['borv'] == 'VEND') {
            if ($e['login'] === $nomeVend && $e['pago'] === $vendPagto) {
                $e['listagem'][] = $c;  // Adicionar à lista de cada vendedor
                $foundVend = true;
            }
        }

        // Se ambos encontrados, sai do loop
        if ($foundBene && $foundVend) {
            break;
        }
    }
}

	
echo correctJson2(["paychecks" => $r1]);
exit;
?>
