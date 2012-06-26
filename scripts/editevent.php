<?php

include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

//core information
$eventid = $_POST['eventid'];
$eventname = $_POST['eventname'];
$eventaddress = $_POST['eventaddress'];
$eventdescription = $_POST['eventdescription'];

$eventdate = $_POST['eventdate'];
$eventstarttime = $_POST['eventstarttime'];
$eventendtime = $_POST['eventendtime'];


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
mysql_query("UPDATE event SET `eventname`='$eventname', 
 `eventaddress`='$eventaddress', 
 `eventdate`='$eventdate', 
 `eventstarttime`='$eventstarttime', 
 `eventendtime`='$eventendtime', 
 `eventdescription`='$eventdescription', 
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
 WHERE `eventid` = '$eventid'")
or die(mysql_error()); 
echo mysql_error(); 
?>