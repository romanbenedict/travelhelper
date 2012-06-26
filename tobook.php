<?php
include 'login/dbc.php';
page_protect();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
	<link type="text/css" href="css/humanity/jquery-ui-1.8.5.custom.css" rel="stylesheet" /> 
	<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script> 
	<script type="text/javascript" src="js/jquery-ui-1.8.5.custom.min.js"></script>
	<script type="text/javascript" src="js/jquery.tinysort.min.js"></script> 
	<link type="text/css" href="jquery/development-bundle/demos/demos.css" rel="stylesheet" /> 
<script>
$(document).ready(function(){
	$("div#container>.travelcard").tsort({attr:"name"});
  });
</script>
<title>Schedule</title></head>
<body>
<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
?>
<h2>Booking List</h2>
<div id="container" style="width:80%; float:left">
<?php
// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM travel WHERE bookingmade='No'") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<div class='travelcard ui-widget-content ui-corner-all' style='padding:5px; margin:10px' name='";
echo $row['bookingdate'];
echo "'> <h2 class='ui-widget-header ui-corner-all' style='padding:3px'>Travel: from ";
echo $row['travelfrom'];
echo " to ";
echo $row['travelto'];
echo "</h2>";
echo "<table><tr>";
echo "<td>";
echo "<p>From: ";
echo $row['traveldepartairport'];
echo " on ";
echo $row['traveldepartdate'];
echo " at ";
echo $row['traveldeparttime'];
echo "</p><p>To: ";
echo $row['travelarriveairport'] ;
echo " on ";
echo $row['travelarrivedate'] ;
echo " at " ;
echo $row['travelarrivetime'];
echo "</p>";
echo "<p>Carrier: ";
echo $row['travelairline'] ;
echo "<br />";
echo "Route: " ;
echo $row['travelroute'];
echo "</p><p>Travelling: ";
$travellerarray = unserialize($row['travellerid']);
$travellerticket = unserialize($row['travellerticket']);
$travellerseat = unserialize($row['travellerseat']);
$i=0;
foreach($travellerarray as $person){
	$row5 = mysql_fetch_array(mysql_query("SELECT fname, lname FROM profile WHERE id=$person"));
	echo $row5['fname']." ".$row5['lname'];
	echo "| Ticket: ".$travellerticket[$i]." Seat: ".$travellerseat[$i];
	echo "<br/>";
	$i= $i+1;	
};
echo "</p><p>";
echo $row['bookingnotes'];
echo "</p></td></tr></table>";
echo "Book by:";
echo $row['bookingdate'];
echo "</div>";
} 
?>
<?php
// Get all the data from the "lodging" table
$result = mysql_query("SELECT * FROM lodging WHERE bookingmade='No'") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<div class='travelcard ui-widget-content ui-corner-all' style='padding:5px; margin:10px' name='";
echo $row['bookingdate'];
echo "'> <h2 class='ui-widget-header ui-corner-all' style='padding:3px'>Lodging: ";
echo $row['lodgingname'];
echo "</h2><table><tr>";
echo "<td><p>Address:</br>";
echo $row['lodgingaddress'];
echo "</p><p>Arrive:";
echo $row['lodgingarrivedate'];
echo "&nbsp; at &nbsp;";
echo $row['lodgingarrivetime'];
echo "</p><p>Depart: &nbsp;";
echo $row['lodgingdeparturedate'] ;
echo "&nbsp; at &nbsp;" ;
echo $row['lodgingdeparturetime'];
echo "</p><p>";
echo $row['lodgingrooms'] ;
echo "room(s), costing";
echo $row['bookingtotal'];
echo "</p><p>Staying:";
$travellerarray = unserialize($row['travellerid']);
foreach($travellerarray as $person){
	$row5 = mysql_fetch_array(mysql_query("SELECT fname, lname FROM profile WHERE id=$person"));
	echo $row5['fname']." ".$row5['lname'];
	echo "<br/>";	
};
echo "</p><p>Notes:</br>";
echo $row['bookingnotes'];
echo "</p></td></tr></table>";
echo "Book by:";
echo $row['bookingdate'];
echo "</div>";

} 

?>
<?php
// Get all the data from the "event" table
$result = mysql_query("SELECT * FROM event WHERE bookingmade='No'") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<div class='travelcard ui-widget-content ui-corner-all' style='padding:5px; margin:10px' name='";
echo $row['bookingdate'];
echo "'> ";
echo "<h2 class='ui-widget-header ui-corner-all' style='padding:3px'>Event: ";
echo $row['eventname'];
echo "</h2><table><tr>";
echo "<td><p>Address:</br>";
echo $row['eventaddress'];
echo "</p><p>Date:";
echo $row['eventdate'];
echo "&nbsp; From &nbsp;";
echo $row['eventstarttime'];
echo "&nbsp; to &nbsp;" ;
echo $row['lodgingdeparturetime'];
echo "</p><p>";
echo $row['eventdescription'] ;

echo "</p><p>Attending:";
$travellerarray = unserialize($row['travellerid']);
foreach($travellerarray as $person){
	$row5 = mysql_fetch_array(mysql_query("SELECT fname, lname FROM profile WHERE id=$person"));
	echo $row5['fname']." ".$row5['lname'];
	echo "<br/>";	
};
echo "</br>Total Cost:";
echo $row['bookingtotal'];
echo "</p><p>Booking Notes:</br>";
echo $row['bookingnotes'];
echo "</p></td></tr></table>";
echo "Book by:";
echo $row['bookingdate'];
echo "</div>";

} 

?>
</div>
<div style="width:18%; float:right; position:absolute; right: 0px;">
  <p><img src="http://www.cheapflights.com.au/i/brands/img-ad-expdastr.gif" /></p>
  <p><img src="http://www.cheapflights.com.au/i/brands/img-ad-statrvl_2.gif" /></p>
  <p><img src="http://www.cheapflights.com.au/i/brands/img-ad-zujiau.gif" /></p>
  <p><img src="http://www.toimg.net/travel/images/logos/home.gif" /></p>
  <p>'etc</p>
  <p>and again   </p>
</div>
</body>