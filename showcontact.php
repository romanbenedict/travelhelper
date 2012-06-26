<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
$contactid = $_GET['id'];
// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM contacts WHERE contactid='$contactid'") 
or die(mysql_error());  

$row = mysql_fetch_array( $result );
	// Print out the contents of each row into a table
echo "<form action='scripts/editcontact.php' method='post' enctype='multipart/form-data'><label>Contact Name:<input type='text' name='name' value='";
echo $row['name'];
echo "'>";
echo "<p>Address:<input type='text' name='address' value='";
echo $row['address'];
echo "'>Email:<input type='text' name='email' value='";
echo $row['email'];
echo "'>Phone:<input type='text' name='phone' value='";
echo $row['phone'];
echo "'>Notes:<input type='text' name='notes' value='" ;
echo $row['notes'];
echo "'><input type='hidden' name='contactid' value='";
echo $row['contactid'];
echo "'><input type='submit' name='Submit' value='Edit Contact' /></p><a href='scripts/epicdeleter.php?type=contact&id=";
echo $row['contactid'];
echo "' >Delete</a></form>";
?>
