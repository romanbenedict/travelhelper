<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
$travelid = $_GET['id'];
// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM travel WHERE tripid=$travelid") 
or die(mysql_error());  

$row = mysql_fetch_array( $result );

	// Print out the contents of each row into a table
echo "<form action='scripts/edittravel.php' method='post' enctype='multipart/form-data'><label>From:<input type='text' name='travelfrom' value='";
echo $row['travelfrom'];
echo "'/></label><label>To:<input type='text' name='travelto' value='";
echo $row['travelto'];
echo "'/></label><label>On<input name='traveldate' class='datepicker' type='text' size='10' value='";
echo $row['traveldate'];
echo "'/></label><p>Trip Details:</p><label>Carrier:<input name='travelairline' type='text' size='16' value='";
echo $row['travelairline'];
echo "'/></label><label> Flight/Route Number:<input type='text' name='travelroute' size='5' value='";
echo $row['travelroute'];
echo "'/></label><label> Departure place:<input type='text' name='traveldepartairport' value='";
echo $row['traveldepartairport'];
echo "'/></label><label> Arrival place:<input type='text' name='travelarriveairport' value='";
echo $row['travelarriveairport'];
echo "'/></label><br /><label>Depart Date:<input name='traveldepartdate' class='datepicker' type='text' size='10' value='";
echo $row['traveldepartdate'];
echo "'/></label><label>Depart Time:<input name='traveldeparttime' type='text' size='5' value='";
echo $row['traveldeparttime'];
echo "'/></label><label>Arrive date:<input name='travelarrivedate' class='datepicker' type='text' size='10' value='";
echo $row['travelarrivedate'];
echo "'/></label><label>Arrive time:<input name='travelarrivetime' type='text' size='5' value='";
echo $row['travelarrivetime'];
echo "'/></label><label>Class:<input name='travelclass' type='text' size='15' value='";
echo $row['travelclass'];
echo "'/></p><p>Travelling:";
$travellerarray = unserialize($row['travellerid']);
$travellerticket = unserialize($row['travellerticket']);
$travellerseat = unserialize($row['travellerseat']);
$i=0;
foreach($travellerarray as $person){
	$row5 = mysql_fetch_array(mysql_query("SELECT fname, lname FROM profile WHERE id=$person"));
	echo "<input type='checkbox' name='travellerid[]' value='".$person."'>".$row5['fname']." ".$row5['lname'];
	echo "| Ticket: <input type='text' name='travellerticket[]' value='".$travellerticket[$i]."'/> Seat: <input type='text' name='travellerseat[]' value='".$travellerseat[$i];
	echo "'/><br/>";
	$i= $i+1;	
};
echo "</p><p>Booking Details</p><table><tr><td>Confirmation Number</td><td><input name='bookingconfirmation' value='";
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
echo "</textarea></td></tr></table><p><input type='hidden' name='tripid' value='";
echo $row['tripid'];
echo "'><input type='submit' name='Submit' value='Change Travel' /></p><a href='scripts/epicdeleter.php?type=travel&id=";
echo $row['tripid'];
echo "' >Delete</a></form>";
?>
