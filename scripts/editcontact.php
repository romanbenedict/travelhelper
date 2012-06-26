<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

//core information
$contactid = $_POST['contactid'];
$name = $_POST['name'];
$address = $_POST['address'];
$email = $_POST['email'];

$phone = $_POST['phone'];
$notes = $_POST['notes'];


//insert
mysql_query("UPDATE contacts SET `name`='$name', 
 `address`='$address', 
 `email`='$email', 
 `phone`='$phone', 
 `notes`='$notes' 
 WHERE `contactid` = '$contactid'")
or die(mysql_error()); 
echo mysql_error(); 
?>