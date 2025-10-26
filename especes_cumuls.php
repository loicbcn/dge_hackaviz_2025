<?php
// include('lib/domparser/simple_html_dom.php');

header('Content-Type: text/html; charset=utf-8');
date_default_timezone_set ('Europe/Paris');
ini_set('memory_limit','-1');
set_time_limit (7200);
// Voir toutes les erreurs
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Créer un tableau des departements/ annees / mois
$obsids = [13,20,29];

$dept_dates = [];
foreach ( $obsids as $d ) {
    for ($a = 2012; $a <= 2022; $a++) {
        for ($m = 1; $m <= 12; $m++) {
            if ( $m < 10 ) {
                $m = '0' . $m;
            }
            $dept_dates[] = ['oid' => (string) $d, 'a'=> (string) $a, 'm' => (string) $m];
        }
    }
}


// lire le json issu de la requête donnant, par département, annee mois, le nombre d'espèces obervées,
// les espèces (array), le nombre d'observations, les observateurs (aryay) 
$data_json = file_get_contents('data/especes_by_obs_mois.json');
$data = json_decode($data_json, true);

// stocker la donnée dans un tableau associatif dont la clef correspond aux valeurs du tableau $dept_dates
$datakeys = [];
$obsids = [];
foreach ($data as $kd => $d) {
    $datakeys[$d['obsid'].'_'.$d['annee'] . '_' . $d['mois']] = $d;
    if ( array_key_exists($d['obsid'], $obsids) === false ) {
        $obsids[$d['obsid']] = $d['obsid'];
    }
}


// pour chaque valeur de $dept_dates (dept_annee_mois), stocker le nombre de nouvelles espèces observées chaque mois, et le nombre cumulé d'espèces observées
$cumul_especes = [];
$cumul_observer = [];
$cumul_observation = 0;
$result = [];
$last_dept = '0';
foreach ( $dept_dates as $d ) {
    if ( $last_dept != '0' && $d['oid'] != $last_dept ) {
        $cumul_especes = [];
        $cumul_observation = 0;
    }
    $current_key =  $d['oid'] .'_'. $d['a'] .'_'. $d['m'];
    $one = [
        'oid' => $d['oid'],
        'annee' => $d['a'],
        'mois' => $d['m'] < 10 ? '0'. $d['m'] : $d['m'],
        'especes_mois' => 0,
        'cumul_especes' => count($cumul_especes),
        'observations_mois' => 0,
        'cumul_observations' => $cumul_observation
    ];
    if ( array_key_exists($current_key, $datakeys) === false) {
        $result[] = $one;
    } else {
        $new_especes_mois = [];
        $new_observer_mois = [];
        $data_mois = $datakeys[$current_key];
        foreach ( $data_mois['especes'] as $dm ) {
            if ( !in_array($dm, $cumul_especes) ) {
                $new_especes_mois[] = $dm;
            } 
        }

        $one['especes_mois'] = count($new_especes_mois);
        $one['observations_mois'] = $data_mois['nb_observations'];
        $cumul_observation += $data_mois['nb_observations'];
        $one['cumul_observations'] = $cumul_observation;
        $merge = array_merge($cumul_especes, $new_especes_mois);
        $cumul_especes = $merge;

        $one['cumul_especes'] = count($cumul_especes);
 
        $result[] = $one;
    }
    $last_dept = $d['oid'];
}

file_put_contents('data/dept_annees_mois_stats.json', json_encode($result));


