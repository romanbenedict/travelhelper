<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

//core information
$traveltype = $_POST['type'];
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
mysql_query("INSERT INTO travel 
(type, travelfrom, travelto, traveldate, travelairline, travelroute, traveldepartairport, traveldepartdate, traveldeparttime, travelarriveairport, travelarrivedate, travelarrivetime, travelclass, travellerid, travellerticket, travellerseat, bookingconfirmation, bookingagent, bookingagenturl, bookingphone, bookingemail, bookingrate, bookingcurrency, bookingtotal, bookingmade, bookingdate, bookingnotes, bookingreference) VALUES(
'$traveltype', '$travelfrom', '$travelto', '$traveldate', '$travelairline', '$travelroute', '$traveldepartairport', '$traveldepartdate', '$traveldeparttime', '$travelarriveairport', '$travelarrivedate', '$travelarrivetime', '$travelclass', '$travellerid', '$travellerticket', '$travellerseat', '$bookingconfirmation', '$bookingagent', '$bookingagenturl', '$bookingphone', '$bookingemail', '$bookingrate', '$bookingcurrency', '$bookingtotal', '$bookingmade', '$bookingdate', '$bookingnotes', '$bookingreference')")
or die(mysql_error()); 
echo mysql_error(); 
?>