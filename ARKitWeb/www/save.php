<?php

if (!file_exists('data')) {
    mkdir('data', 0777, true);
}

$file0 = 'data/native.json';
$file1 = 'data/client.json';

file_put_contents($file0, json_encode($_POST['native']));
file_put_contents($file1, json_encode($_POST['client']));

$arr = array(
	'status'=>'success'
);

echo json_encode($arr);
