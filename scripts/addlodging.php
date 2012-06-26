<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
//create db
/*CREATE TABLE lodging(
lodgingid INT NOT NULL AUTO_INCREMENT ,
lodgingname VARCHAR( 20 ) ,
lodgingarrivedate VARCHAR( 12 ) ,
lodgingarrivetime VARCHAR( 12 ) ,
lodgingdeparturedate VARCHAR( 12 ) ,
lodgingdeparturetime VARCHAR( 12 ) ,
lodgingrooms VARCHAR( 5 ) ,
travellerid VARCHAR( 30 ) ,
bookingconfirmation VARCHAR( 20 ) ,
bookingagent VARCHAR( 25 ) ,
bookingagenturl VARCHAR( 25 ) ,
bookingref VARCHAR( 25 ) ,
bookingphone VARCHAR( 15 ) ,
bookingemail VARCHAR( 25 ) ,
bookingrate VARCHAR( 25 ) ,
bookingcurrency VARCHAR( 4 ) ,
bookingtotal VARCHAR( 10 ) ,
$bookingmade VARCHAR( 5 ) ,
$bookingdate DATE,
$bookingnotes VARCHAR( 400 ) ,
$bookingreference VARCHAR( 50 ) ,
PRIMARY KEY ( lodgingid )
)*/
//core information
$lodgingname = $_POST['lodgingname'];


//Trip Details passed as Array (unlimited legs)
$lodgingaddress =  $_POST['lodgingaddress']; 

$lodgingarrivedate = $_POST['lodgingarrivedate'];
$lodgingarrivetime = $_POST['lodgingarrivetime'];
$lodgingdeparturedate = $_POST['lodgingdeparturedate'];
$lodgingdeparturetime = $_POST['lodgingdeparturetime'];

$lodgingrooms = $_POST['lodgingrooms'];

//Traveller Passed as Array
$travellerid = serialize($_POST['travellerid']);


//Booking Information
$bookingconfirmation = $_POST['bookingconfirmation'];
$bookingagent = $_POST['bookingagent'];
$bookingagenturl = $_POST['bookingagenturl'];
$bookingphone = $_POST['bookingphone'];
$bookingemail = $_POST['bookingemail'];
$bookingrate = $_POST['bookingrate'];
$bookingcurrency = $_POST['bookingcurrency'];
$bookingtotal = $_POST['bookingtotal'];
$bookingmade = $_POST['bookingmade'];
$bookingdate = $_POST['bookingdate'];
$bookingnotes = $_POST['bookingnotes'];
$bookingreference = $_POST['bookingreference'];


//insert
mysql_query("INSERT INTO lodging 
(lodgingname, lodgingaddress, lodgingarrivedate, lodgingarrivetime, lodgingdeparturedate, lodgingdeparturetime, lodgingrooms, travellerid, bookingconfirmation, bookingagent, bookingagenturl, bookingphone, bookingemail, bookingrate, bookingcurrency, bookingtotal, bookingmade, bookingdate, bookingnotes, bookingreference) VALUES(
'$lodgingname', '$lodgingaddress', '$lodgingarrivedate', '$lodgingarrivetime', '$lodgingdeparturedate', '$lodgingdeparturetime', '$lodgingrooms', '$travellerid', '$bookingconfirmation', '$bookingagent', '$bookingagenturl', '$bookingphone', '$bookingemail', '$bookingrate', '$bookingcurrency', '$bookingtotal', '$bookingmade', '$bookingdate', '$bookingnotes', '$bookingreference')")
or die(mysql_error()); 
echo mysql_error(); 
?>