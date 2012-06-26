<?php
include 'login/dbc.php';
page_protect();
?>
<?php 
// take the row'ified data and columnize the array
function columnizeArray($csvarray) {
    $array = array();
    foreach($csvarray as $key=>$value) {
        // reparse into useful array data.
        if ($key == 0) {
            foreach ($value AS $key2=>$value2) {
                $array[$key2] = array();
                $array[$key2][] = $value2;
            }
        }else if ($key > 0){
            foreach ($value as $key3=>$value3) {
				$array[$key3][] = $value3;
				
            }
        }else{
        }
    }
    return $array;
}
function groupColumns($array = null) {
    $array2 = array();
    foreach ($array as $k=>$v) {
        // procss each column
        // $k = column number
        // $v = array of rows
        if ($k == 0) {}else{ // working on column 2 or higher
            $array2[$v[0]] = array();
            foreach ($array[0] as $k1=>$v1) {
                if ($v1 > 0) { // ignore the column heading
                    // store the first column variable in as the key.
                    // Store the value associated with this item as the value.
                    $array2[$v[0]][$v1] = $v[$k1];
                }
            }
     }
    }
    return $array2;
}


?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
	<link type="text/css" href="css/humanity/jquery-ui-1.8.5.custom.css" rel="stylesheet" /> 
	<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script> 
	<script type="text/javascript" src="js/jquery-ui-1.8.5.custom.min.js"></script> 
	<script type="text/javascript" src="js/jquery.tinysort.min.js"></script> 
	<script type="text/javascript" src="js/jquery-ui-timepicker-addon.js"></script>
	<script type="text/javascript" src="js/jquery.form.js"></script>
	<link type="text/css" href="jquery/development-bundle/demos/demos.css" rel="stylesheet" /> 
<title>Schedule</title></head>
<script type="text/javascript"> 
	$(function() {
		$("button, #addleg").button();
	});
	</script> 
<script>
$(document).ready(function(){
	$("div#container>.travelcard").tsort({attr:"name"});
  });
</script>
	<script>
	$(function() {
		$( "#addnewtravel" ).dialog({
			autoOpen: false,
			show: "blind",
			hide: "blind",
			minWidth: 600
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
			minWidth: 600
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
			minWidth: 600
		});

		$( "#addeventbutton" ).click(function() {
			$( "#addnewevent" ).dialog( "open" );
			return false;
		});
	});
	</script> 
  <script>
  $(document).ready(function() {
    $("#addleg").click(function () {
      $("#addleg2").show("slide", {}, 750);
    });
  });
  </script>
<script>
	$(function() {
		$( ".datepicker" ).datepicker({ dateFormat: 'yy-mm-dd'});
	});
		$(function() {
		$( ".timepicker" ).timepicker({stepMinute: 5});
	});
	</script>
<body>
<?php
include('config.php') 
?>
<h2>Schedule</h2>
<div id="container">
<?php
// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM travel") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<div class='travelcard ui-widget-content ui-corner-all' style='padding:5px; margin:10px' name='";
echo $row['traveldepartdate'];
echo "'>";
echo "<h2 class='ui-widget-header ui-corner-all' style='padding:3px'>Travel: from ";
echo $row['travelfrom'];
echo " to ";
echo $row['travelto'];
echo "</h2>";
echo "<table><tr><td>";

//}
if($row['weathertemp']==NULL && $row['weathericao']!=NULL){
//weather stuff
$weatherairport = $row['airporticao'];
$weatherdate = $row['weatherarrivedate'];
$weathersourceurl = "http://www.wunderground.com/history/airport/".$weatherairport."/".$weatherdate."/PlannerHistory.html?format=1";
echo "Taken from Online<p>";
# Open the File.
if (($handle = fopen($weathersourceurl, "r")) !== FALSE) {
    # Set the parent multidimensional array key to 0.
    $nn = 0;
    while (($data = fgetcsv($handle, 0, ",")) !== FALSE) {
        # Count the total keys in the row.
        $c = count($data);
        # Populate the multidimensional array.
        for ($x=0;$x<$c;$x++)
        {
            $csvarray[$nn][$x] = $data[$x];
        }
        $nn++;
    }
    # Close the File.
    fclose($handle);
}

$array2 = groupColumns(columnizeArray($csvarray));

//Start Printing Weather Variables//
$averagepressure = array_filter($array2['Mean Sea Level PressurehPa']);
 $pressure = array_sum($averagepressure) / count($averagepressure);

if($pressure>=1025)
	echo "<img src=\"images/icon-set/PNG/150x150/hazy.png\" width='100px' height='100px' title='Very Dry'/> ";	
elseif($pressure>=1018)
	echo "<img src=\"images/icon-set/PNG/150x150/sunny.png\" width='100px' height='100px' title='Fair'/> ";	
elseif($pressure>=1000)
	echo "<img src=\"images/icon-set/PNG/150x150/m-c-rain.png\" width='100px' height='100px' title='Change' />";
elseif($pressure>=970)
	echo "<img src=\"images/icon-set/PNG/150x150/rainy.png\" width='100px' height='100px' title='Rain'/>";
elseif($pressure<970)
	echo "<img src=\"images/icon-set/PNG/150x150/t-storm-rain.png\" width='100px' height='100px' title='Stormy' />";
else
	echo " <img src=\"images/icon-set/PNG/150x150/na.png\" width='100px' height='100px' title='Could not load Weather'/>";

echo "<br/>";
$averagetemperature = array_filter($array2['Mean TemperatureC']);

echo "Avg Temp:<strong> ";
 $temperature = array_sum($averagetemperature) / count($averagetemperature);
  echo round($temperature, 2);
 echo "&deg;C</strong><br/>";

$averagewind = array_filter($array2['Mean Wind SpeedKm/h']);

echo "Wind: <strong>";
 $wind = array_sum($averagewind) / count($averagewind);
 echo round($wind, 2);
 echo "Km/h</strong>";
echo "<br/>";

$averagecloud = array_filter($array2['CloudCover']);

 $cloud = 10*array_sum($averagecloud) / count($averagecloud);
if($cloud>0)
echo "Clouds: <strong>";
if($cloud>0)
 echo round($cloud, 2);
if($cloud>0)
 echo "%</strong></p>";

$tripid = $row['tripid'];
//database support
mysql_query("UPDATE travel SET weathertemp='$temperature', weatherwind='$wind', weatherpressure='$pressure', weathercloud='$cloud' WHERE tripid='$tripid'")
or die(mysql_error()); 
}elseif($row['weathertemp']!=NULL){
$pressure = $row['weatherpressure'];
$temperature = $row['weathertemp']; 
$wind = $row['weatherwind'];
$cloud = $row['weathercloud'];
if($pressure>=1025)
	echo "<img src=\"images/icon-set/PNG/150x150/hazy.png\" width='100px' height='100px' title='Very Dry'/> ";	
elseif($pressure>=1018)
	echo "<img src=\"images/icon-set/PNG/150x150/sunny.png\" width='100px' height='100px' title='Fair'/> ";	
elseif($pressure>=1000)
	echo "<img src=\"images/icon-set/PNG/150x150/m-c-rain.png\" width='100px' height='100px' title='Change' />";
elseif($pressure>=970)
	echo "<img src=\"images/icon-set/PNG/150x150/rainy.png\" width='100px' height='100px' title='Rain'/>";
elseif($pressure>=100)
	echo "<img src=\"images/icon-set/PNG/150x150/t-storm-rain.png\" width='100px' height='100px' title='Stormy' />";
else
	echo " <img src=\"images/icon-set/PNG/150x150/na.png\" width='100px' height='100px' title='Could not load Weather'/>";
echo "<br/>Avg Temp:<strong> ";
  echo round($temperature, 2);
 echo "&deg;C</strong><br/>";
echo "Wind: <strong>";
 echo round($wind, 2);
 echo "Km/h</strong><br/>";
if($cloud>0)
echo "Clouds: <strong>";
if($cloud>0)
 echo round($cloud, 2);
if($cloud>0)
 echo "%</strong></p>";
}else{
echo " <img src=\"images/icon-set/PNG/150x150/na.png\" width='100px' height='100px' title='Could not load Weather'/><br/>Weather Not Available at this time.";
}; 
//trip details
echo "</td><td>";
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
echo "</p><p>Travelling:<br/> ";
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

echo "<button onclick=window.open('showtravel.php?id=";
echo $row['tripid'];
echo "','blank','toolbar=no,width=400,height=400,left=auto,right=auto') name='fullinfo'>View Full/Modify Trip</button>";
if($row['type']==Flight){
echo "<button class='flightstatsbutton'>Check Flight Status</button><button><a href='http://data.seatexpert.com/tpi/find.php?airline=";
echo $row['travelairline'];
echo "&amp;flight=";
echo $row['travelroute'];
echo "&amp;date=";
echo $row['traveldepartdate'];
echo "' target='_blank'> Find Best Seats</a></button>";
}elseif($row['type']==Car){
echo "Get Directions";
};
echo "</p></div>";
} 

?>
<?php
// Get all the data from the "lodging" table
$result = mysql_query("SELECT * FROM lodging") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<div class='travelcard ui-widget-content ui-corner-all' style='padding:5px; margin:10px' name='";
echo $row['lodgingarrivedate'];
echo "'>";
echo "<h2 class='ui-widget-header ui-corner-all' style='padding:3px'>Lodging: ";
echo $row['lodgingname'];
echo "</h2><table><tr><td>";
if($row['weathertemp']==NULL && $row['weathericao']!=NULL){
//weather stuff
$weatherairport = $row['weathericao'];
$weatherdate = $row['weatherdate'];
$weathersourceurl = "http://www.wunderground.com/history/airport/".$weatherairport."/".$weatherdate."/PlannerHistory.html?format=1";
echo "<p>";
# Open the File.
if (($handle = fopen($weathersourceurl, "r")) !== FALSE) {
    # Set the parent multidimensional array key to 0.
    $nn = 0;
    while (($data = fgetcsv($handle, 0, ",")) !== FALSE) {
        # Count the total keys in the row.
        $c = count($data);
        # Populate the multidimensional array.
        for ($x=0;$x<$c;$x++)
        {
            $csvarray[$nn][$x] = $data[$x];
        }
        $nn++;
    }
    # Close the File.
    fclose($handle);
}

$array2 = groupColumns(columnizeArray($csvarray));

//Start Printing Weather Variables//
$averagepressure = array_filter($array2['Mean Sea Level PressurehPa']);
 $pressure = array_sum($averagepressure) / count($averagepressure);

if($pressure>=1025)
	echo "<img src=\"images/icon-set/PNG/150x150/hazy.png\" width='100px' height='100px' title='Very Dry'/> ";	
elseif($pressure>=1005)
	echo "<img src=\"images/icon-set/PNG/150x150/sunny.png\" width='100px' height='100px' title='Fair'/> ";	
elseif($pressure>=992)
	echo "<img src=\"images/icon-set/PNG/150x150/m-c-rain.png\" width='100px' height='100px' title='Changeable' />";
elseif($pressure>=960)
	echo "<img src=\"images/icon-set/PNG/150x150/rainy.png\" width='100px' height='100px' title='Rain'/>";
elseif($pressure<960)
	echo "<img src=\"images/icon-set/PNG/150x150/t-storm-rain.png\" width='100px' height='100px' title='Stormy' />";
elseif($pressure<150)
	echo " <img src=\"images/icon-set/PNG/150x150/na.png\" width='100px' height='100px' title='Could not load Weather'/>";

echo "<br/>";
$averagetemperature = array_filter($array2['Mean TemperatureC']);

echo "Avg Temp:<strong> ";
 $temperature = array_sum($averagetemperature) / count($averagetemperature);
  echo round($temperature, 2);
 echo "&deg;C</strong><br/>";

$averagewind = array_filter($array2['Mean Wind SpeedKm/h']);

echo "Wind: <strong>";
 $wind = array_sum($averagewind) / count($averagewind);
 echo round($wind, 2);
 echo "Km/h</strong>";
echo "<br/>";

$averagecloud = array_filter($array2['CloudCover']);

 $cloud = 10*array_sum($averagecloud) / count($averagecloud);
if($cloud>0)
echo "Clouds: <strong>";
if($cloud>0)
 echo round($cloud, 2);
if($cloud>0)
 echo "%</strong></p>";
 $lodgingid = $row['lodgingid'];
//database support
mysql_query("UPDATE lodging SET weathertemp='$temperature', weatherwind='$wind', weatherpressure='$pressure', weathercloud='$cloud' WHERE lodgingid='$lodgingid'")
or die(mysql_error()); 
 }elseif($row['weathertemp']!=NULL){$pressure = $row['weatherpressure'];
$temperature = $row['weathertemp']; 
$wind = $row['weatherwind'];
$cloud = $row['weathercloud'];
if($pressure>=1025)
	echo "<img src=\"images/icon-set/PNG/150x150/hazy.png\" width='100px' height='100px' title='Very Dry'/> ";	
elseif($pressure>=1018)
	echo "<img src=\"images/icon-set/PNG/150x150/sunny.png\" width='100px' height='100px' title='Fair'/> ";	
elseif($pressure>=1000)
	echo "<img src=\"images/icon-set/PNG/150x150/m-c-rain.png\" width='100px' height='100px' title='Change' />";
elseif($pressure>=970)
	echo "<img src=\"images/icon-set/PNG/150x150/rainy.png\" width='100px' height='100px' title='Rain'/>";
elseif($pressure<970)
	echo "<img src=\"images/icon-set/PNG/150x150/t-storm-rain.png\" width='100px' height='100px' title='Stormy' />";
else
	echo " <img src=\"images/icon-set/PNG/150x150/na.png\" width='100px' height='100px' title='Could not load Weather'/>";
echo "<br/>Avg Temp:<strong> ";
  echo round($temperature, 2);
 echo "&deg;C</strong><br/>";
echo "Wind: <strong>";
 echo round($wind, 2);
 echo "Km/h</strong><br/>";
if($cloud>0)
echo "Clouds: <strong>";
if($cloud>0)
 echo round($cloud, 2);
if($cloud>0)
 echo "%</strong></p>";
 }else{
echo " <img src=\"images/icon-set/PNG/150x150/na.png\" width='100px' height='100px' title='Could not load Weather'/><br/>Weather Not Available at this time.";
 };
echo "</td><td><p>Address:</br>";
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
echo "</p><p>Staying:<br/>";
$travellerarray = unserialize($row['travellerid']);
foreach($travellerarray as $person){
	$row5 = mysql_fetch_array(mysql_query("SELECT fname, lname FROM profile WHERE id=$person"));
	echo $row5['fname']." ".$row5['lname'];
	echo "<br/>";
	
};
echo "</p><p>Notes:</br>";
echo $row['bookingnotes'];
echo "</p></td></tr></table>";
echo "<button onclick=window.open('showlodging.php?id=";
echo $row['lodgingid'];
echo "','blank','toolbar=no,width=400,height=400,left=auto,right=auto') name='fullinfo'>View/Edit Lodging </button></p></div>";


} 

?>
<?php
// Get all the data from the "event" table
$result = mysql_query("SELECT * FROM event") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<div class='travelcard ui-widget-content ui-corner-all' style='padding:5px; margin:10px' name='";
echo $row['eventdate'];
echo "'>";
echo "<h2 class='ui-widget-header ui-corner-all' style='padding:3px'>Event: ";
echo $row['eventname'];
echo "</h2><table><tr><td>";
if($row['weathertemp']==NULL && $row['weathericao']!=NULL){
//weather stuff
$weatherairport = $row['weathericao'];
$weatherdate = $row['weatherdate'];
$weathersourceurl = "http://www.wunderground.com/history/airport/".$weatherairport."/".$weatherdate."/PlannerHistory.html?format=1";
echo "<p>";
# Open the File.
if (($handle = fopen($weathersourceurl, "r")) !== FALSE) {
    # Set the parent multidimensional array key to 0.
    $nn = 0;
    while (($data = fgetcsv($handle, 0, ",")) !== FALSE) {
        # Count the total keys in the row.
        $c = count($data);
        # Populate the multidimensional array.
        for ($x=0;$x<$c;$x++)
        {
            $csvarray[$nn][$x] = $data[$x];
        }
        $nn++;
    }
    # Close the File.
    fclose($handle);
}

$array2 = groupColumns(columnizeArray($csvarray));

//Start Printing Weather Variables//
$averagepressure = array_filter($array2['Mean Sea Level PressurehPa']);
 $pressure = array_sum($averagepressure) / count($averagepressure);

if($pressure>=1025)
	echo "<img src=\"images/icon-set/PNG/150x150/hazy.png\" width='100px' height='100px' title='Very Dry'/> ";	
elseif($pressure>=1005)
	echo "<img src=\"images/icon-set/PNG/150x150/sunny.png\" width='100px' height='100px' title='Fair'/> ";	
elseif($pressure>=992)
	echo "<img src=\"images/icon-set/PNG/150x150/m-c-rain.png\" width='100px' height='100px' title='Changeable' />";
elseif($pressure>=960)
	echo "<img src=\"images/icon-set/PNG/150x150/rainy.png\" width='100px' height='100px' title='Rain'/>";
elseif($pressure<960)
	echo "<img src=\"images/icon-set/PNG/150x150/t-storm-rain.png\" width='100px' height='100px' title='Stormy' />";
elseif($pressure<150)
	echo " <img src=\"images/icon-set/PNG/150x150/na.png\" width='100px' height='100px' title='Could not load Weather'/>";
echo "<br/>";

$averagetemperature = array_filter($array2['Mean TemperatureC']);

echo "Avg Temp:<strong> ";
 $temperature = array_sum($averagetemperature) / count($averagetemperature);
  echo round($temperature, 2);
 echo "&deg;C</strong><br/>";

$averagewind = array_filter($array2['Mean Wind SpeedKm/h']);

echo "Wind: <strong>";
 $wind = array_sum($averagewind) / count($averagewind);
 echo round($wind, 2);
 echo "Km/h</strong>";
echo "<br/>";

$averagecloud = array_filter($array2['CloudCover']);

 $cloud = 10*array_sum($averagecloud) / count($averagecloud);
if($cloud>0)
echo "Clouds: <strong>";
if($cloud>0)
 echo round($cloud, 2);
if($cloud>0)
	echo "%</strong></p>";
 $eventid = $row['eventid'];
//database support
mysql_query("UPDATE event SET weathertemp='$temperature', weatherwind='$wind', weatherpressure='$pressure', weathercloud='$cloud' WHERE eventid='$eventid'")
or die(mysql_error()); 
}elseif($row['weathertemp']!=NULL){
$pressure = $row['weatherpressure'];
$temperature = $row['weathertemp']; 
$wind = $row['weatherwind'];
$cloud = $row['weathercloud'];
if($pressure>=1025)
	echo "<img src=\"images/icon-set/PNG/150x150/hazy.png\" width='100px' height='100px' title='Very Dry'/> ";	
elseif($pressure>=1018)
	echo "<img src=\"images/icon-set/PNG/150x150/sunny.png\" width='100px' height='100px' title='Fair'/> ";	
elseif($pressure>=1000)
	echo "<img src=\"images/icon-set/PNG/150x150/m-c-rain.png\" width='100px' height='100px' title='Change' />";
elseif($pressure>=970)
	echo "<img src=\"images/icon-set/PNG/150x150/rainy.png\" width='100px' height='100px' title='Rain'/>";
elseif($pressure<970)
	echo "<img src=\"images/icon-set/PNG/150x150/t-storm-rain.png\" width='100px' height='100px' title='Stormy' />";
else
	echo " <img src=\"images/icon-set/PNG/150x150/na.png\" width='100px' height='100px' title='Could not load Weather'/>";
echo "<br/>Avg Temp:<strong> ";
  echo round($temperature, 2);
 echo "&deg;C</strong><br/>";
echo "Wind: <strong>";
 echo round($wind, 2);
 echo "Km/h</strong><br/>";
if($cloud>0)
echo "Clouds: <strong>";
if($cloud>0)
 echo round($cloud, 2);
if($cloud>0)
 echo "%</strong></p>";
 }else{
echo "<img src=\"images/icon-set/PNG/150x150/na.png\" width='100px' height='100px' title='Could not load Weather'/><br/>Weather Not Available at this time.";
  };

echo "</td><td><p>Address:</br>";
echo $row['eventaddress'];
echo "</p><p>Date:";
echo $row['eventdate'];
echo "&nbsp; From &nbsp;";
echo $row['eventstarttime'];
echo "&nbsp; to &nbsp;" ;
echo $row['eventendtime'];
echo "</p><p>";
echo $row['eventdescription'] ;

echo "</p><p>Attending:<br/>";
$travellerarray = unserialize($row['travellerid']);
foreach($travellerarray as $person){
	$row5 = mysql_fetch_array(mysql_query("SELECT fname, lname FROM profile WHERE id=$person"));
	echo $row5['fname']." ".$row5['lname'];
	echo "<br/>";	
};
echo "</p><p>Total Cost:";
echo $row['bookingtotal'];
echo "</p><p>Booking Notes:</br>";
echo $row['bookingnotes'];
echo "</p></td></tr></table>";
echo "<button onclick=window.open('showevent.php?id=";
echo $row['eventid'];
echo "','blank','toolbar=no,width=500,height=500,left=auto,right=auto') name='fullinfo' value=''>View/Edit Event </button></p></div>";

};
?>
</div>
<p><button id="addtravelbutton">Add New Travel </button></p>
<div id="addnewtravel" title="Add New Travel" class="travelcard ui-widget-content ui-corner-all" style="display:none">
<form action="scripts/addtravel.php" method="post" enctype="multipart/form-data" name="travel" id="travelform">
  <label>From:<input type="text" name="travelfrom" /></label>
    <label>To:<input type="text" name="travelto" /></label>
<label>On<input name="traveldate" class="datepicker" type="text" size="10" /></label> 
 
<h3>Travellers:</h3> <?php 
$result = mysql_query("SELECT * FROM profile") 
or die(mysql_error());  
// keeps getting the next row until there are no more to get
while($travellerrow = mysql_fetch_array( $result )) {
	echo "<p><label><input type='checkbox' name='travellerid[]' value='".$travellerrow['id']."'>".$travellerrow['lname'].", ".$travellerrow['fname']."</label>";
	echo " | <label> Ticket Number: <input name='travellerticket[]' type='text' size='18'></label><label> Seat Number:<input name='travellerseat[]' type='text' size='5' /></label></p>";
};
?>
<h3>Trip Details:</h3>
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
    <td><input name="bookingrate" id='travelbookingrate' type="text" value="" size="10" />
      <select name="bookingcurrency" id="travelbookingcurrency">
	  <?php
	  echo "<option calue='AUD' title='1'>AUD</option>";
	  echo "<option value='GBP' title='".file_get_contents("http://www.exchangerate-api.com/GBP/AUD?k=94evi-UfDsg-AR3cF")."'>GBP</option>";
	  echo "<option value='EUR' title='".file_get_contents("http://www.exchangerate-api.com/EUR/AUD?k=94evi-UfDsg-AR3cF")."'>EUR</option>";
	  echo "<option value='USD' title='".file_get_contents("http://www.exchangerate-api.com/USD/AUD?k=94evi-UfDsg-AR3cF")."'>GBP</option>";
	  ?>
      </select>
      </td>
  </tr>
  <tr>
    <td>Booking Reference #:</td>
    <td><input name="bookingreference" value="" type="text" /></td>
    <td>Total Cost:</td>
    <td><input name="bookingtotal" id="travelbookingtotal" value="" type="text" /></td>
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
<p><button id="addlodgingbutton">Add New Lodging</button></p>
<div id="addnewlodging" title="Add New Lodging" class="travelcard ui-widget-content ui-corner-all" style="display:none">
<form action="scripts/addlodging.php" method="post" enctype="multipart/form-data" name="travel" id="travelform">
  <label>Lodging Name: 
  <input type="text" name="lodgingname" />
  </label>
  <p>Travellers (for each): <?php 
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
        <select name="bookingcurrency">
			  <?php
	  echo "<option calue='AUD' title='1'>AUD</option>";
	  echo "<option value='GBP' title='".file_get_contents("http://www.exchangerate-api.com/GBP/AUD?k=94evi-UfDsg-AR3cF")."'>GBP</option>";
	  echo "<option value='EUR' title='".file_get_contents("http://www.exchangerate-api.com/EUR/AUD?k=94evi-UfDsg-AR3cF")."'>EUR</option>";
	  echo "<option value='USD' title='".file_get_contents("http://www.exchangerate-api.com/USD/AUD?k=94evi-UfDsg-AR3cF")."'>GBP</option>";
	  ?>
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
<p>
  <button id="addeventbutton">Add New Event </button>
</p>
<div id="addnewevent" title="Add New Event/Activity"class="ui-widget-content ui-corner-all" style="display:none">  
  <form action="scripts/addevent.php" method="post" enctype="multipart/form-data" name="travel" id="travelform">
  <label>Lodging Name: 
  <input type="text" name="eventname" />
  </label>
  <p>Attending: <?php 
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
        <select name="bookingcurrency">
			  <?php
	  echo "<option calue='AUD' title='1'>AUD</option>";
	  echo "<option value='GBP' title='".file_get_contents("http://www.exchangerate-api.com/GBP/AUD?k=94evi-UfDsg-AR3cF")."'>GBP</option>";
	  echo "<option value='EUR' title='".file_get_contents("http://www.exchangerate-api.com/EUR/AUD?k=94evi-UfDsg-AR3cF")."'>EUR</option>";
	  echo "<option value='USD' title='".file_get_contents("http://www.exchangerate-api.com/USD/AUD?k=94evi-UfDsg-AR3cF")."'>GBP</option>";
	  ?>
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
<div id="flightstats" title="Flight Status">
<form action="http://www.flightstats.com/go/Redirect/websiteRedirect.do" method="post" target="_blank" style="margin:0; padding:0"><div id="FlightStats" style="width:120px; font-family: Hallmarke Condensed Light, Arial, Verdana, sans-serif;  border:1px solid #000000;"><div style="padding-left: 5px; font-size: 7pt;"><span style="font-size: 8pt;">By Flight or Route</span><br><input style="font-family: Hallmarke Condensed Light, Arial, Verdana, sans-serif; font-size: 8pt;" size="5" type="text" name="submission" value="AA 1241"><input type="image" src="http://www.flightstats.com/go/images/btn_go_on_white.gif"><br><a target="_blank" href="http://www.flightstats.com/go/Downloads/websiteRedirectExamples.do">examples:</a> AA 123 or JFK to LHR<br><a target="_blank" href="http://www.flightstats.com/go/Downloads/websiteRedirectPopup.do">Don't Know the Code?</a></div><a TARGET="_blank" href="http://www.flightstats.com"><img align="center" border=0 src="http://www.flightstats.com/go/Widgets/images/flightstats_logo_widget.gif"/></a></div></form></div>
<script>
	$(function() {
		$( "#flightstats" ).dialog({
			autoOpen: false,
			show: "blind",
			hide: "blind",
			width: 125
		});

		$( ".flightstatsbutton" ).click(function() {
			$( "#flightstats" ).dialog( "open" );
			return false;
		});
	});
	</script>
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