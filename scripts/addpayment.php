<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

$name = $_POST['name'];
$date = $_POST['date'];
$from = $_POST['from'];
$to =  $_POST['to']; 
$debit = $_POST['debit'];
$credit = $_POST['credit'];
$transfer = $_POST['transfer'];
$notes = $_POST['notes'];

mysql_query("INSERT INTO payment
(name, paydate, payfrom, payto, debit, credit, transfer, notes) VALUES(
'$name', '$date', '$from', '$to', '$debit', '$credit', '$transfer', '$notes')")
or die(mysql_error());  

/*CREATE TABLE payment(
paymentid INT NOT NULL AUTO_INCREMENT ,
name VARCHAR( 20 ) ,
date VARCHAR( 12 ) ,
from VARCHAR( 12 ) ,
to VARCHAR( 12 ) ,
debit VARCHAR( 10 ) ,
credit VARCHAR( 10 ) ,
transfer VARCHAR( 10 ) ,
notes VARCHAR( 400 ) ,
PRIMARY KEY ( paymentid )
)*/?>