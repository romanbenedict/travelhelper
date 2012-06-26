<?php
include('config.php') 

//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

$result = mysql_query("SELECT * FROM lodging") 
or die(mysql_error());  
echo "[";
while($row = mysql_fetch_array( $result )) {

$placeid = "lodge".
$row['lodgingid'];
$title = "Lodging: ". 
$row['lodgingname'];
$start = $row['lodgingarrivedate'].
"T".
$row['lodgingarrivetime'].
"Z";
$end = $row['lodgingdeparturedate'].
"T".
$row['lodgingdeparturetime'].
"Z";
$url = "showlodging.php?id=".
$row['lodgingid'];
$bookingmade=$row['bookingmade'];
if($bookingmade=='Yes')
	$editable='false';
elseif($bookingmade=='No')
	$editable='true';

echo json_encode(array(
	
		"id" => $placeid,
		'title' => $title,
		'className' => 'calendarlodging',
		'start' => $start,
		'end' => $end,
		'editable' => $editable,
		'allDay' => false,
		'url' => $url

	));
echo ",";
};

$row= NULL;
$result= NULL;
$result = mysql_query("SELECT * FROM travel") 
or die(mysql_error());  

while($row = mysql_fetch_array( $result )) {
$travelid= "travel".$row['tripid'];
//$address = $row['traveldepartairport'];
$title = "Travel:".
$row['travelfrom'];
//$row['traveldepartairport'].
$start = $row['traveldepartdate'].
"T".
$row['traveldeparttime'].
"Z";
$end =  $row['travelarrivedate'];
"T".
$row['travelarrivetime'].
"Z";
//$row['travelarriveairport'].
$url = "showtravel.php?id=".
$row['tripid'];
$bookingmade=$row['bookingmade'];
if($bookingmade=='Yes')
	$editable='false';
elseif($bookingmade=='No')
	$editable='true';
	
echo json_encode(array(
	
		"id" => $travelid,
		'title' => $title,
		'className' => 'calendartravel',
		'start' => $start,
		'end' => $end,
		'editable' => $editable,
		'allDay' => false,
		'url' => $url

	));

echo ",";
};
$result = mysql_query("SELECT * FROM event") 
or die(mysql_error());  

while($row = mysql_fetch_array( $result )) {

//$address = $row['eventaddress'];
$placeid = "event".$row['eventid'];
$title = "Event: ". 
$row['eventname'];
$start = $row['eventdate'].
"T".
$row['eventstarttime'].
"Z";
$end = $row['eventdate'].
"T".
$row['eventendtime'].
"Z";
$url = "showevent.php?id=".
$row['eventid'];
$bookingmade=$row['bookingmade'];
if($bookingmade=='Yes')
	$editable='false';
elseif($bookingmade=='No')
	$editable='true';

echo json_encode(array(
	
		"id" => $eventid,
		'title' => $title,
		'className' => 'calendarevent',
		'start' => $start,
		'end' => $end,
		'editable' => $editable,
		'allDay' => false,
		'url' => $url
	));
echo ",";
};
echo "{}]";	

?>