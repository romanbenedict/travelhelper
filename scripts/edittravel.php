<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

//core information
$tripid = $_POST['tripid'];
$travelfrom = $_POST['travelfrom'];
$travelto = $_POST['travelto'];
$traveldate = $_POST['traveldate'];

//Trip Details passed as Array (unlimited legs)
$travelairline =  $_POST['travelairline']; 
$travelroute = $_POST['travelroute'];
$traveldepartairport = $_POST['traveldepartairport'];
$traveldepartdate = $_POST['traveldepartdate'];
$traveldeparttime = $_POST['traveldeparttime'];
$travelarriveairport = $_POST['travelarriveairport'];
$travelarrivedate = $_POST['travelarrivedate'];
$travelarrivetime = $_POST['travelarrivetime'];
$travelclass = $_POST['travelclass'];

//Traveller Passed as Array
$travellerid = serialize($_POST['travellerid']);
$travellerticket = serialize($_POST['travellerticket']);
$travellerseat = serialize($_POST['travellerseat']);

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
mysql_query("UPDATE travel SET `travelfrom`='$travelfrom',
 `travelto`='$travelto', 
 `traveldate`='$traveldate', 
 `travelairline`='$travelairline', 
 `travelroute`='$travelroute', 
 `traveldepartairport`='$traveldepartairport', 
 `traveldepartdate`='$traveldepartdate', 
 `traveldeparttime`='$traveldeparttime', 
 `travelarriveairport`='$travelarriveairport', 
 `travelarrivedate`='$travelarrivedate', 
 `travelarrivetime`='$travelarrivetime', 
 `travelclass`='$travelclass', 
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
 WHERE `tripid` = '$tripid;'")
or die(mysql_error()); 
echo mysql_error(); 
?>