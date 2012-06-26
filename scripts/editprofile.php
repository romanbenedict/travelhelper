<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
$id = $_POST['id'];
$fname = $_POST['fname'];
$lname = $_POST['lname'];
$age =  $_POST['age']; 
$sex = $_POST['sex'];
$email = $_POST['email'];
$hometown = $_POST['hometown'];
$biog = $_POST['biog'];
$passport = $_POST['passport'];
$freqflyer = $_POST['freqflyer'];
$twitter = $_POST['twitter'];

mysql_query("UPDATE `test`.`profile` SET `fname` = '$fname', `lname` = '$lname', `age`='$age', `sex`='$sex', `email`='$email', `hometown`='$hometown', `biog`='$biog', `passport` = '$passport', `freqflyer` = '$freqflyer', `twitter`='$twitter' WHERE `profile`.`id` = $id;")
or die(mysql_error());  

echo "Update made successfully. You may now close this window. ";