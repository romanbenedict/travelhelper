Are You Sure you Want to Delete?
<table border="1px">

  <tr height="17">
    <td>Name</td>
    <td>Date</td>
    <td>From:</td>
    <td>To</td>
    <td>Debit</td>
    <td>Credit</td>
    <td>Transfer</td>
    <td>Notes</td>
  </tr>
<?php
$paymentid = $_GET['id'];
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM payment WHERE paymentid='$paymentid'") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
$row = mysql_fetch_array( $result );
	// Print out the contents of each row into a table
echo "<tr><td>";
echo $row['name'];
echo "</td><td>";
echo $row['paydate'];
echo "</td><td>";
echo $row['payfrom'];
echo "</td><td>";
echo $row['payto'] ;
echo "</td><td>";
echo $row['debit'] ;
echo "</td><td>";
echo $row['credit'];
echo "</td><td>";
echo $row['transfer'];
echo "</td><td>";
echo $row['notes'];
echo "</td></tr>";

?>

</table>
<a href="deletepayment.php?id=<?php echo $paymentid ?>" >Yes, Delete!</a>
