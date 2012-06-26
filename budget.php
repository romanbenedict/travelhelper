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
	<link type="text/css" href="jquery/development-bundle/demos/demos.css" rel="stylesheet" /> 
	<script>
	// increase the default animation speed to exaggerate the effect
	$.fx.speeds._default = 1000;
	$(function() {
		$( "#paymentform" ).dialog({
			autoOpen: false,
			show: "blind",
			hide: "blind"
		});

		$( "#addpayment" ).click(function() {
			$( "#paymentform" ).dialog( "open" );
			return false;
		});
	});
	</script> 
    <script>
	$(function() {
		$( ".datepicker" ).datepicker();
	});
	</script>
	<script type="text/javascript"> 
	$(function() {
		$("button").button();
	});
	</script>
<title>Budget</title></head>
<body>
<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
?>
<h3>Expenses</h3>
<table border="1px">
<tr><em><td>Item</td><td>Category</td><td>Travellers:</td><td>Cost:</td><td>Total Cost</td><td>Paid?</td></em></tr>
<?php 
// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM travel") 
or die(mysql_error());  
// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<tr>";
echo "<td>";
echo  "From &nbsp;";
echo $row['travelfrom'];
echo "&nbsp; to &nbsp;";
echo $row['travelto'];
echo "&nbsp;on&nbsp;";
echo $row['travelairline'] ;
echo "</td>";
echo "<td>Transport</td>";
echo "<td>";
$travellerarray = unserialize($row['travellerid']);
foreach($travellerarray as $person){
	$row5 = mysql_fetch_array(mysql_query("SELECT fname, lname FROM profile WHERE id=$person"));
	echo $row5['fname'].", ";
};
echo "</td><td>";
echo $row['bookingrate'];
echo $row['bookingcurrency'];
echo "</td><td class='cost'>";
echo $row['bookingtotal'];
echo "</td><td>";
echo $row['bookingmade'];
echo "</td></tr>";
} unset($row, $result);
// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM lodging") 
or die(mysql_error());  
// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<tr>";
echo "<td>";
echo $row['lodgingname'];
echo "&nbsp; at &nbsp;";
echo $row['lodgingaddress'];
echo "</td>";
echo "<td>Lodging</td>";
echo "<td>";
$travellerarray = unserialize($row['travellerid']);
foreach($travellerarray as $person){
	$row5 = mysql_fetch_array(mysql_query("SELECT fname, lname FROM profile WHERE id=$person"));
	echo $row5['fname'].", ";
};
echo "</td><td>";
echo $row['bookingrate'];
echo $row['bookingcurrency'];
echo "</td><td class='cost'>";
echo $row['bookingtotal'];
echo "</td><td>";
echo $row['bookingmade'];
echo "</td></tr>";

} ;
unset($row, $result);
// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM event") 
or die(mysql_error());  
// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<tr>";
echo "<td>";
echo $row['eventname'];
echo "&nbsp; at &nbsp;";
echo $row['eventaddress'];
echo "</td>";
echo "<td>Event</td>";
echo "<td>";
$travellerarray = unserialize($row['travellerid']);
foreach($travellerarray as $person){
	$row5 = mysql_fetch_array(mysql_query("SELECT fname, lname FROM profile WHERE id=$person"));
	echo $row5['fname'].", ";
};
echo "</td><td>";
echo $row['bookingrate'];
echo $row['bookingcurrency'];
echo "</td><td class='cost'>";
echo $row['bookingtotal'];
echo "</td><td>";
echo $row['bookingmade'];
echo "</td></tr>";

} ;
?>
<tr ><td colspan="3" rowspan="2"></td>
<td>Total</td>
<td ><?php
// Make a MySQL Connection

$query1 = "SELECT SUM(bookingtotal) as totalSum FROM travel"; 
$result1 = mysql_query($query1) or die(mysql_error());	 
$row1 = mysql_fetch_array($result1);
	$traveltotal = $row1['totalSum'];
	
$query2 = "SELECT SUM(bookingtotal) as totalSum FROM event"; 
$result2 = mysql_query($query2) or die(mysql_error());	 
$row2 = mysql_fetch_array($result2);
	$eventtotal = $row2['totalSum'];

	

$query3 = "SELECT SUM(bookingtotal) as totalSum FROM lodging"; 
$result3 = mysql_query($query3) or die(mysql_error());	 
$row3 = mysql_fetch_array($result3);
	$lodgingtotal = $row3['totalSum'];

$overalltotal = $traveltotal + $eventtotal + $lodgingtotal ;
echo "$";
echo $overalltotal;
?></td>
<td><?php $querypaid = "SELECT SUM(debit) as totalSum FROM payment"; 
$resultpaid = mysql_query($querypaid) or die(mysql_error());	 
$rowpaid = mysql_fetch_array($resultpaid);
	$overallpaid = $rowpaid['totalSum'];
	$percentpaid = 100*$overallpaid/$overalltotal;
	echo round($percentpaid, 0);
	echo "%</td>"; ?></td>
</tr>
<tr>
<td>Total Paid </td>
<td><?php
echo "<td>";
	echo "$";
	echo $overallpaid;
	echo "</td>";
?></tr>
</table>
<h3>Travellers</h3>

<table border="1px">
<tr><td>I.D</td><td>Name</td><td>Age</td><td>Sex</td><td>Total Cost</td></tr>
<?php

// Make a MySQL Connection

$query = "SELECT COUNT(*) FROM profile;"; 
	 
$result = mysql_query($query) or die(mysql_error());

// Print out result
while($row = mysql_fetch_array($result)){
	$totaltravellers = $row['COUNT(*)'];
// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM profile") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<tr><td>";
echo $row['id'];
echo "</td><td>";
echo $row['fname'];
echo "&nbsp;";
echo $row['lname'];
echo "</td><td>";
echo $row['age'] ;
echo "</td><td>";
echo $row['sex'] ;
echo "</td><td>";
echo "$";
echo ($overalltotal)/($totaltravellers);
echo "</td></tr>";
};
?>
<tr><td><?php

	echo $totaltravellers;
};
?></td><td>Total Travellers</td></tr>
</table>
<h3>Payments Made</h3>
<div id="paymentbox"><table border="1px">

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
// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM payment") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
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
echo "</td><td>";
echo "<a onclick=window.open('scripts/showpayments.php?id=";
echo $row['paymentid'];
echo "','blank','toolbar=no,width=500,height=500,left=auto,right=auto') name='fullinfo' href='#'";
echo $row['paymentid'];
echo "'>Delete</a></td></tr>";
};
?>
  <tr>
    <td></td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>Totals</td>
        <td><?php $query1 = "SELECT SUM(debit) as totalSum FROM payment"; 
$result1 = mysql_query($query1) or die(mysql_error());	 
$row1 = mysql_fetch_array($result1);
	$traveltotal = $row1['totalSum'];
	echo "$";
	echo $traveltotal;?></td>
	<td><?php $query1 = "SELECT SUM(credit) as totalSum FROM payment"; 
$result1 = mysql_query($query1) or die(mysql_error());	 
$row1 = mysql_fetch_array($result1);
	$traveltotal = $row1['totalSum'];
	echo "$";
	echo $traveltotal;?></td>
    <td><?php $query1 = "SELECT SUM(transfer) as totalSum FROM payment"; 
$result1 = mysql_query($query1) or die(mysql_error());	 
$row1 = mysql_fetch_array($result1);
	$traveltotal = $row1['totalSum'];
	echo "$";
	echo $traveltotal;?></td>
    <td>&nbsp;</td>
  </tr>
</table>

</div>
<button id="addpayment" >Add Payment</button>
<div id="paymentform" title="Enter Payment"><form action="scripts/addpayment.php" method="post" id="formforpayment">
  <p><label>Transaction Name:<input type="text" name="name" id="name" /></label></p>
  <p><label>Transaction Date:<input type="text" class="datepicker" name="date" id="date" /></label></p>
  <p><label>Paid From:<input type="text" name="from" id="from" /></label></p>
  <p><label>Paid To:<input type="text" name="to" id="to"/></label></p>

    <input name="types" type="radio" value="debit" />
    Debit
	<input name="types" type="radio" value="credit" />
    Credit
	<input name="types" type="radio" value="transfer" />
    Transfer
<script>
	$(function() {
		$( "#types" ).buttonset();
	});
	</script>
  <script>
$('[name=types]').change(function() {
    var name_value = $(this).val();
    $('#amount').attr('name', name_value);
});
  </script>
    <p><label>Amount:<input type="text" name="debit" /></label></p>

  <p><label>Notes:<input type="text" name="notes" /></label></p>
  <input type="submit" value="Submit" />
</form></div>
</p>
<script type="text/javascript"> 
        // wait for the DOM to be loaded 
        $(document).ready(function() { 
            // bind 'myForm' and provide a simple callback function 
            $('#formforpayment').ajaxForm(function() { 
                $('#paymentform').dialog('close'); 
            }); 
        }); 
    </script>
</body>
</html>
