<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
$travellerid = $_GET['id'];
// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM profile WHERE id=$travellerid") 
or die(mysql_error());  

$row = mysql_fetch_array( $result );
	// Print out the contents of each row into a table
echo "<div class='travelcard ui-widget-content ui-corner-all' style='padding:5px; margin:10px'><form method='post' action='scripts/editprofile.php'";
echo "<h2 class='ui-widget-header ui-corner-all' style='padding:3px'><input type='text' name='fname' value='";
echo $row['fname'];
echo "'>&nbsp;<input type='text' name='lname' value='";
echo $row['lname'];
echo "'></h2>";
echo "<p>";
echo "<input type='text' name='email' value='";
echo $row['email'];
echo "'><input type='text' name='twitter' value='";
echo $row['twitter'];
echo "'></p><p><input type='text' name='age' value='";
echo $row['age'] ;
echo "'>&nbsp;<em>year old</em>&nbsp;<input type='text' name='sex' value='";
echo $row['sex'] ;
echo "'>&nbsp;<em>from</em>&nbsp;<input type='text' name='hometown' value='" ;
echo $row['hometown'];
echo "'></p>";
echo "<p>Passport:<input type='text' name='passport' value='";
echo $row['passport'] ;
echo "'><br />";
echo "Frequent Flyer:<input type='text' name='freqflyer' value='" ;
echo $row['freqflyer'];
echo "'></p><p><em>Biography:<input type='text' name='biog' value='";
echo $row['biog'];
echo "'></em></p><input type='hidden' name='id' value='";
echo $row['id'];
echo "'><input type='submit' name='submit' value='Update'></p></form><a href='scripts/epicdeleter.php?type=profile&id=";
echo $row['id'];
echo "' >Delete</a></div>";
?>