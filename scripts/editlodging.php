<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

//core information
$lodgingid = $_POST['lodgingid'];
$lodgingname = $_POST['lodgingname'];
$lodgingaddress = $_POST['lodgingaddress'];


$lodgingarrivedate = $_POST['lodgingarrivedate'];
$lodgingarrivetime = $_POST['lodgingarrivetime'];
$lodgingdepartdate = $_POST['lodgingdepartdate'];
$lodgingdeparttime = $_POST['lodgingdeparttime'];

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
mysql_query("UPDATE lodging SET `lodgingname`='$lodgingname', 
 `lodgingaddress`='$lodgingaddress', 
 `lodgingarrivedate`='$lodgingarrivedate', 
 `lodgingarrivetime`='$lodgingarrivetime', 
 `lodgingdeparturedate`='$lodgingdepartdate', 
 `lodgingdeparturetime`='$lodgingdeparttime', 
 `lodgingrooms`='$lodgingrooms', 
 `bookingconfirmation`='$bookingconfirmation', 
 `bookingagent`='$bookingagent', 
 `bookingagenturl`='$bookingagenturl', 
 `bookingphone`='$bookingphone', 
 `bookingemail`='$bookingemail', 
 `bookingrate`='$bookingrate', 
 `bookingcurrency`='$bookingcurrency', 
 `bookingtotal`='$bookingtotal', 
 `bookingmade`='$bookingmade', 
 `bookingdate`='$bookingdate', 
 `bookingnotes`='$bookingnotes', 
 `bookingreference`='$bookingreference' 
 WHERE `lodgingid` = '$lodgingid'")
or die(mysql_error()); 
echo mysql_error(); 
?>