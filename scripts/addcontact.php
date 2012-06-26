<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

$name = $_POST['name'];
$address = $_POST['address'];
$email =  $_POST['email']; 
$phone = $_POST['phone'];
$notes = $_POST['notes'];


mysql_query("INSERT INTO contacts
(name, address, email, phone, notes) VALUES(
'$name', '$address', '$email', '$phone', '$notes')")
or die(mysql_error());  
?>