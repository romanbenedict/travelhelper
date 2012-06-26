<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
$eventid = $_GET['id'];
// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM event WHERE eventid='$eventid'") 
or die(mysql_error());  

$row = mysql_fetch_array( $result );
$traveller = unserialize($row['travellerid']);
	// Print out the contents of each row into a table
echo "<form action='scripts/editevent.php' method='post' enctype='multipart/form-data'><label>Lodging:<input type='text' name='eventname' value='";
echo $row['eventname'];
echo "'>";
echo "<p>Address:<input type='text' name='eventaddress' value='";
echo $row['eventaddress'];
echo "'>Date<input type='text' name='eventdate' value='";
echo $row['eventdate'];
echo "'>Start:<input type='text' name='eventstarttime' value='";
echo $row['eventstarttime'];
echo "'>End:<input type='text' name='eventendtime' value='" ;
echo $row['eventendtime'];
echo "'></p><p>Description:<input type='text' name='eventdescription' value='";
echo $row['eventdescription'];
echo "'></label></p><p>Travellers:";
$travellerarray = unserialize($row['travellerid']);
$i=0;
foreach($travellerarray as $person){
	$row5 = mysql_fetch_array(mysql_query("SELECT fname, lname FROM profile WHERE id=$person"));
	echo "<input type=checkbox name='travellerid[]' value='".$person."'>".$row5['fname']." ".$row5['lname'];
	echo "<br/>";
	$i= $i+1;	
};
echo "'/> </label></p><p>Booking Details</p><table><tr><td>Confirmation Number</td><td><input name='bookingconfirmation' value='";
echo $row['bookingconfirmation'];
echo "' type='text' /></td><td>Booking Phone:</td><td><input name='bookingphone' value='";
echo $row['bookingphone'];
echo "' type='text' /></td></tr><tr><td>Booking Site Name:</td><td><input name='bookingagent' value='";
echo $row['bookingagent'];
echo "' type='text' /></td><td>Booking Email:</td><td><input name='bookingemail'  value='";
echo $row['bookingemail'];
echo "' type='text' /></td></tr><tr><td>Booking Site URL:</td><td><input name='bookingagenturl' value='";
echo $row['bookingagenturl'];
echo "' type='text' /></td><td>Booking Rate:</td><td><input name='bookingrate' type='text' value='";
echo $row['bookingrate'];
echo "' size='10' /><select name='bookingcurrency'></select></td></tr><tr><td>Booking Reference #:</td><td><input name='bookingreference' value='";
echo $row['bookingreference'];
echo "' type='text' /></td><td>Total Cost:</td><td><input name='bookingtotal' value='";
echo $row['bookingtotal'];
echo "' type='text' /></td></tr><tr><td>Purchased?</td><td><input name='bookingmade' value='Yes' type='radio' />Yes<input name='bookingmade' value='No' type='radio' />No</td><td>Date purchased/due </td><td><input name='bookingdate' class='datepicker' type='text' size='10' value='";
echo $row['bookingdate'];
echo "'/></td></tr><tr><td>Policies/Notes:</td><td colspan='3'><textarea name='bookingnotes' cols='65' rows='6'>";
echo $row['bookingnotes'];
echo "</textarea></td></tr></table><p><input type='hidden' name='eventid' value='";
echo $row['eventid'];
echo "'><input type='submit' name='Submit' value='Edit Event' /></p><a href='scripts/epicdeleter.php?type=event&id=";
echo $row['eventid'];
echo "' >Delete</a></form>";
?>
