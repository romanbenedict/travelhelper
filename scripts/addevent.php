<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
//create db
/*CREATE TABLE lodging(
eventid INT NOT NULL AUTO_INCREMENT ,
eventname VARCHAR( 25 ) ,
eventdate VARCHAR( 12 ) ,
eventstarttime VARCHAR( 12 ) ,
eventendtime VARCHAR( 12 ) ,
eventdescription VARCHAR( 500 ) ,
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
PRIMARY KEY ( eventid )
)*/
//core information
$eventname = $_POST['eventname'];


//Trip Details passed as Array (unlimited legs)
$eventaddress =  $_POST['eventaddress']; 

$eventdate = $_POST['eventdate'];
$eventstarttime = $_POST['eventstarttime'];
$eventendtime = $_POST['eventendtime'];

$eventdescription = $_POST['eventdescription'];

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
mysql_query("INSERT INTO event 
(eventname, eventaddress, eventdate, eventstarttime, eventendtime, eventdescription, travellerid, bookingconfirmation, bookingagent, bookingagenturl, bookingphone, bookingemail, bookingrate, bookingcurrency, bookingtotal, bookingmade, bookingdate, bookingnotes, bookingreference) VALUES(
'$eventname', '$eventaddress', '$eventdate', '$eventstarttime', '$eventendtime', '$eventdescription', '$travellerid', '$bookingconfirmation', '$bookingagent', '$bookingagenturl', '$bookingphone', '$bookingemail', '$bookingrate', '$bookingcurrency', '$bookingtotal', '$bookingmade', '$bookingdate', '$bookingnotes', '$bookingreference')")
or die(mysql_error()); 
echo mysql_error(); 
?>
