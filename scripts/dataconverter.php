<?php 
$fileAsArray = Array();

if (($handle = fopen("../data/airportsimple.csv", "r")) !== FALSE) {
while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
$fileAsArray[] = $data;
}
fclose($handle);
}

die(json_encode($fileAsArray));

?>