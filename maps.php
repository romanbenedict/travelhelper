<?php
include 'login/dbc.php';
page_protect();
?>
<html>
<head>
<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script> 
<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script>  
<script type="text/javascript" src="js/jquery.gomap-1.2.1.min.js"></script> 

<style> 
#map { 
    width:100%; 
    height:100%; 
} 
</style> 
<script>
$(function() { 
    $("#map").goMap({
		address: 'London, UK', 
        zoom: 5,  
        markers: [
<?php
include('config.php'); 
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

$result = mysql_query("SELECT * FROM lodging") 
or die(mysql_error());  

while($row = mysql_fetch_array( $result )) {

$address = $row['lodgingaddress'];
$placeid = $row['lodgingid'];
$html = "<em>Lodging: ". 
$row['lodgingname'].
"</em>".
"<p>Address:</br>".
$row['lodgingaddress'].
"</p><p>Arrive:".
$row['lodgingarrivedate'].
"&nbsp; at &nbsp;".
$row['lodgingarrivetime'].
"</p><p>Depart: &nbsp;".
$row['lodgingdeparturedate'].
"&nbsp; at &nbsp;" .
$row['lodgingdeparturetime'].
"</p><p>".
$row['lodgingrooms'] .
"room(s), costing".
$row['bookingtotal'].
"</p><p>Notes:</br>".
$row['bookingnotes'].
"</p>";	

echo json_encode(array(
	
		'address' => $address,
		'id' => $placeid,
    	'html' => $html,

	));
echo ",";
};

$row= NULL;
$result= NULL;
$result = mysql_query("SELECT * FROM travel") 
or die(mysql_error());  

while($row = mysql_fetch_array( $result )) {

$address1 = $row['traveldepartairport'];
$html1 = "<em>Travel: from".
$row['travelfrom'].
"</em>".
"<p>From:".
$row['traveldepartairport'].
"&nbsp; on".
$row['traveldepartdate'].
"&nbsp; on".
$row['traveldeparttime'].
"</p><p>To: &nbsp;".
$row['travelarriveairport'].
"<p>Carrier:".
$row['travelairline'].
"</p><p>".
$row['bookingnotes'].
"</p>";

$address2 = $row['travelarriveairport'];
$html2 = "<em>Travel: to".
$row['travelto'].
"</em>".
"<p>Arrive at:".
$row['travelarriveairport'].
"&nbsp; on".
$row['travelarrivedate'].
"&nbsp; on".
$row['travelarrivetime'].
"</p><p>From: &nbsp;".
$row['traveldepartairport'].
"<p>Carrier:".
$row['travelairline'].
"</p><p>".
$row['bookingnotes'].
"</p>";

echo json_encode(array(
	
		'address' => $address1,
    	'html' => $html1,

	));
	echo ",";
echo json_encode(array(
	
		'address' => $address2,
    	'html' => $html2,

	));
echo ",";
};
$result = mysql_query("SELECT * FROM event") 
or die(mysql_error());  

while($row = mysql_fetch_array( $result )) {

$address = $row['eventaddress'];
$placeid = $row['eventid'];
$html = "<em>Event:&nbsp; ". 
$row['eventname'].
"</em>".
"<p>Address:</br>".
$row['eventaddress'].
"</p><p>Date:".
$row['eventdate'].
"&nbsp; from &nbsp;".
$row['eventstarttime'].
"&nbsp; at &nbsp;" .
$row['eventendtime'].
"</p><p>".
"Total Cost".
$row['bookingtotal'].
"</p><p>Participating:".
$row['travellerid'].
"</p><p>Notes:</br>".
$row['bookingnotes'].
"</p>";	

echo json_encode(array(
	
		'address' => $address,
		'id' => $placeid,
    	'html' => $html,

	));
echo ",";
};
		?>], 
        maptype: 'ROADMAP', 
    }); 
}); 
</script>
</head>
<body>
<div id="map"></div>
</body>
</html>