<?php
include 'login/dbc.php';
page_protect();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN""http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> 
<html> 
<head> 
	<link type="text/css" href="css/humanity/jquery-ui-1.8.5.custom.css" rel="stylesheet" /> 
		<link type="text/css" href="fullcalendar/fullcalendar.css" rel="stylesheet" /> 
	<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script> 
	<script type="text/javascript" src="js/jquery-ui-1.8.5.custom.min.js"></script> 
	<link type="text/css" href="jquery/development-bundle/demos/demos.css" rel="stylesheet" /> 
		<link type="text/css" href="css/typeclasses.css" rel="stylesheet" />
<script type='text/javascript' src="fullcalendar/fullcalendar.min.js"></script> 
<script type='text/javascript'> 
 
	$(document).ready(function() {
	
		var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();
		
		$('#calendar').fullCalendar({
			theme: true,
			firstDay: 1, 
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			},
			events: "calendarencoder.php",
			eventClick: function(event) {
        		if (event.url) {
            		window.open(event.url, 'toolbar=no', 'width=400', 'height=450');
            	return false;
        			}
    			},

	
		});
		
	});
 
</script>
<style type='text/css'> 
	#loading {
		position: absolute;
		top: 5px;
		right: 5px;
		}
 
	#calendar {
		width: 900px;
		margin: 0 auto;
		}
 
</style> 
</head> 
<body> 
<div id='loading' style='display:none'>loading...</div> 
<div id='calendar'></div>
<div id="footer" style="text-align:center">
<button id="addtravelbutton">Add New Travel</button>
<div id="addnewtravel" title="Add New Travel" class="travelcard ui-widget-content ui-corner-all" style="display:none">
<form action="scripts/addtravel.php" method="post" enctype="multipart/form-data" name="travel" id="travelform">
  <label>From:<input type="text" name="travelfrom" /></label>
    <label>To:<input type="text" name="travelto" /></label>
<label>On<input name="traveldate" class="datepicker" type="text" size="10" /></label> 
 
<p>Travellers (for each): 
<?php 
include('config.php'); 
$result = mysql_query("SELECT * FROM profile") 
or die(mysql_error());  
// keeps getting the next row until there are no more to get
while($travellerrow = mysql_fetch_array( $result )) {
	echo "<p><label><input type='checkbox' name='travellerid[]' value='".$travellerrow['id']."'>".$travellerrow['lname'].", ".$travellerrow['fname']."</label>";
	echo " | <label> Ticket Number: <input name='travellerticket[]' type='text' size='18'></label><label> Seat Number:<input name='travellerseat[]' type='text' size='5' /></label></p>";
};
?>
<p>Trip Details:</p>
<div id="tripdetails">
<label>Carrier:<input name="travelairline" id="travelairline" type="text" size="16" /></label> 
  <label> Flight/Route Number:<input type="text" name="travelroute" size="5"/></label>
  <label> Departure place:<input type="text" name="traveldepartairport" /></label>
<label> Arrival place:<input type="text" name="travelarriveairport" /></label>
 <br />
 <label>Depart Date:<input name="traveldepartdate" class="datepicker" type="text" size="10" /></label> 
 <label>Depart Time:<input name="traveldeparttime" class="timepicker" type="text" size="5"/></label>
<label>Arrive date:<input name="travelarrivedate" class="datepicker" type="text" size="10" /></label>
 <label>Arrive time:<input name="travelarrivetime" class="timepicker" type="text" size="5" /></label>
 <label>Class:<input name="travelclass" type="text" size="15" />
 </label>  </div>
	<script>
$(document).ready(function() {
		$( "#travelairline" ).autocomplete({
			source: "data/airports.json",
			minLength: 2
		});
	});
	</script>
<div id="addleg">Add extra leg</div>

<p>&nbsp; </p>
<p>Booking Details</p>
<table cellspacing="0" cellpadding="0">
  <tr>
    <td>Confirmation Number</td>
    <td><input name="bookingconfirmation" value="" type="text" /></td>
    <td>Booking  Phone:</td>
    <td><input name="bookingphone" value="" type="text" /></td>
  </tr>
  <tr>
    <td>Booking Site Name:</td>
    <td><input name="bookingagent" value="" type="text" /></td>
    <td>Booking Email:</td>
    <td><input name="bookingemail"  value="" type="text" /></td>
  </tr>
  <tr>
    <td>Booking Site URL:</td>
    <td><input name="bookingagenturl" value="" type="text" /></td>
    <td>Booking Rate:</td>
    <td><input name="bookingrate" type="text" value="" size="10" />
      <select name="bookingcurrency">
      </select>
      </td>
  </tr>
  <tr>
    <td>Booking Reference #:</td>
    <td><input name="bookingreference" value="" type="text" /></td>
    <td>Total Cost:</td>
    <td><input name="bookingtotal" value="" type="text" /></td>
  </tr>
  <tr>
    <td>Purchased?</td>
    <td><input name="bookingmade" value="Yes" type="radio" />
      Yes            &nbsp;
      <input name="bookingmade" value="No" type="radio" />
      No </td>
    <td>Date purchased/due </td>
    <td><input name="bookingdate" class="datepicker" type="text" size="10" /></td>
  </tr>
  <tr>
    <td>Policies/Notes::</td>
    <td colspan="3"><textarea name="bookingnotes" cols="65" rows="6"></textarea></td>
  </tr>
</table>
<p>
  <label>
  <input type="checkbox" name="checkbox2" value="checkbox" />
  Add return trip</label>
  <input type="submit" name="Submit" value="Add Travel" />
</p>
</form></div>
<button id="addlodgingbutton">Add New Lodging</button>
<div id="addnewlodging" title="Add New Lodging" class="travelcard ui-widget-content ui-corner-all" style="display:none">
<form action="scripts/addlodging.php" method="post" enctype="multipart/form-data" name="travel" id="lodgingform">
  <label>Lodging Name: 
  <input type="text" name="lodgingname" />
  </label>
  <p>Staying: 
<?php 
$result = mysql_query("SELECT * FROM profile") 
or die(mysql_error());  
// keeps getting the next row until there are no more to get
while($travellerrow = mysql_fetch_array( $result )) {
	echo "<p><label><input type='checkbox' name='travellerid[]' value='".$travellerrow['id']."'>".$travellerrow['lname'].", ".$travellerrow['fname']."</label></p>";
};
?>
</p>
<p>Trip Details:</p>
<div id="tripdetails"><label>Address
  <input type="text" name="lodgingaddress" />
  </label>
 <label>Arrive date:
 <input name="lodgingarrivedate" class="datepicker" type="text" size="10" /></label> 
 <label>Arrive Time:<input name="lodgingarrivetime" class="timepicker" type="text" size="5"/></label>
 <label>Departure Date:<input name="lodgingdeparturedate" class="datepicker" type="text" size="10" /></label>
 <label>Departure Time:<input name="lodgingdeparturetime" class="timepicker" type="text" size="5" /></label>
 <label>No of Rooms:<input name="lodgingrooms" type="text" size="3" /></label> </div>
<p>Booking Details</p>
<table cellspacing="0" cellpadding="0">
  <tr>
    <td>Confirmation Number</td>
    <td><input name="bookingconfirmation" value="" type="text" /></td>
    <td>Booking  Phone:</td>
    <td><input name="bookingphone" value="" type="text" /></td>
  </tr>
  <tr>
    <td>Booking Site Name:</td>
    <td><input name="bookingagent" value="" type="text" /></td>
    <td>Booking Email:</td>
    <td><input name="bookingemail"  value="" type="text" /></td>
  </tr>
  <tr>
    <td>Booking Site URL:</td>
    <td><input name="bookingagenturl" value="" type="text" /></td>
    <td>Booking Rate:</td>
    <td><input name="bookingrate" type="text" value="" size="10" />
        <select name="select">
        </select>
    </td>
  </tr>
  <tr>
    <td>Booking Reference #:</td>
    <td><input name="bookingreference" value="" type="text" /></td>
    <td>Total Cost:</td>
    <td><input name="bookingtotal" value="" type="text" /></td>
  </tr>
  <tr>
    <td>Purchased?</td>
    <td><input name="bookingmade" value="Yes" type="radio" />
      Yes            &nbsp;
      <input name="bookingmade" value="No" type="radio" />
      No </td>
    <td>Date purchased/due </td>
    <td><input name="bookingdate" class="datepicker" type="text" size="10" /></td>
  </tr>
  <tr>
    <td>Policies/Notes::</td>
    <td colspan="3"><textarea name="bookingnotes" cols="65" rows="6"></textarea></td>
  </tr>
</table>
<p>
  <input type="submit" name="submitlodging" value="Add Lodging" />
</p>
</form></div>

  <button id="addeventbutton">Add New Event </button>
</p>
<div id="addnewevent" title="Add New Event/Activity"class="ui-widget-content ui-corner-all" style="display:none">  
  <form action="scripts/addevent.php" method="post" enctype="multipart/form-data" name="travel" id="eventform">
  <label>Lodging Name: 
  <input type="text" name="eventname" />
  </label>
  <p>Attending: 
<?php 
$result = mysql_query("SELECT * FROM profile") 
or die(mysql_error());  
// keeps getting the next row until there are no more to get
while($travellerrow = mysql_fetch_array( $result )) {
	echo "<p><label><input type='checkbox' name='travellerid[]' value='".$travellerrow['id']."'>".$travellerrow['lname'].", ".$travellerrow['fname']."</label></p>";
};
?>
</p>
<p>Trip Details:</p>
<label>Address
  <input type="text" name="eventaddress" />
  </label>
 <label>Date:
 <input name="eventdate" class="datepicker" type="text" size="10" /></label> 

 <label> Start Time:<input name="eventstarttime" class="timepicker" type="text" size="5"/></label>
 <label>Finish Time:
 <input name="eventendtime" class="timepicker" type="text" size="5" /></label>
 <br />
 Description<textarea name="eventdescription" style="height:80px; width:160px"></textarea>
 <p>Booking Details</p>
<table cellspacing="0" cellpadding="0">
  <tr>
    <td>Confirmation Number</td>
    <td><input name="bookingconfirmation" value="" type="text" /></td>
    <td>Booking  Phone:</td>
    <td><input name="bookingphone" value="" type="text" /></td>
  </tr>
  <tr>
    <td>Booking Site Name:</td>
    <td><input name="bookingagent" value="" type="text" /></td>
    <td>Booking Email:</td>
    <td><input name="bookingemail"  value="" type="text" /></td>
  </tr>
  <tr>
    <td>Booking Site URL:</td>
    <td><input name="bookingagenturl" value="" type="text" /></td>
    <td>Booking Rate:</td>
    <td><input name="bookingrate" type="text" value="" size="10" />
        <select name="select">
        </select>
    </td>
  </tr>
  <tr>
    <td>Booking Reference #:</td>
    <td><input name="bookingreference" value="" type="text" /></td>
    <td>Total Cost:</td>
    <td><input name="bookingtotal" value="" type="text" /></td>
  </tr>
  <tr>
    <td>Purchased?</td>
    <td><input name="bookingmade" value="Yes" type="radio" />
      Yes            &nbsp;
      <input name="bookingmade" value="No" type="radio" />
      No </td>
    <td>Date purchased/due </td>
    <td><input name="bookingdate" class="datepicker" type="text" size="10" /></td>
  </tr>
  <tr>
    <td>Policies/Notes::</td>
    <td colspan="3"><textarea name="bookingnotes" cols="65" rows="6"></textarea></td>
  </tr>
</table>
<p>
  <input type="submit" name="submitevent" value="Add Event" />
</p>
</form></div>
	<script>
	$(function() {
		$( "#addnewtravel" ).dialog({
			autoOpen: false,
			show: "blind",
			hide: "blind",
			minWidth: 600,
			modal: true
		});

		$( "#addtravelbutton" ).click(function() {
			$( "#addnewtravel" ).dialog( "open" );
			return false;
		});
	});
	</script> 
	<script>
	$(function() {
		$( "#addnewlodging" ).dialog({
			autoOpen: false,
			show: "blind",
			hide: "blind",
			minWidth: 600,
			modal:true
		});

		$( "#addlodgingbutton" ).click(function() {
			$( "#addnewlodging" ).dialog( "open" );
			return false;
		});
	});
	</script> 
	<script>
	$(function() {
		$( "#addnewevent" ).dialog({
			autoOpen: false,
			show: "blind",
			hide: "blind",
			minWidth: 600,
			modal: true
		});

		$( "#addeventbutton" ).click(function() {
			$( "#addnewevent" ).dialog( "open" );
			return false;
		});
	});
	</script> 
	<script type="text/javascript"> 
	$(function() {
		$("button").button();
	});
	</script> 
<p>All times are Local.</p></div>
<script type="text/javascript"> 
        // wait for the DOM to be loaded 
        $(document).ready(function() { 
            // bind 'myForm' and provide a simple callback function 
            $('#travelform').ajaxForm(function() { 
                $('#addnewtravel').dialog('close'); 
            }); 
        }); 
    </script>
<script type="text/javascript"> 
        // wait for the DOM to be loaded 
        $(document).ready(function() { 
            // bind 'myForm' and provide a simple callback function 
            $('#eventform').ajaxForm(function() { 
                $('#addnewevent').dialog('close'); 
            }); 
        }); 
    </script>
<script type="text/javascript"> 
        // wait for the DOM to be loaded 
        $(document).ready(function() { 
            // bind 'myForm' and provide a simple callback function 
            $('#lodgingform').ajaxForm(function() { 
                $('#addnewlodging').dialog('close'); 
            }); 
        }); 
    </script>
</body> 
</html> 
