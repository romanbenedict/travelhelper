<?php
include 'login/dbc.php';
page_protect();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<link type="text/css" href="css/humanity/jquery-ui-1.8.5.custom.css" rel="stylesheet" /> 
	<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script> 
	<script type="text/javascript" src="js/jquery-ui-1.8.5.custom.min.js"></script>
	<script type="text/javascript" src="js/jquery.form.js"></script> 
	<link type="text/css" href="jquery/development-bundle/demos/demos.css" rel="stylesheet" /> 
<title>Profile</title>
	<script>
	// increase the default animation speed to exaggerate the effect
	$.fx.speeds._default = 1000;
	$(function() {
		$( "#addnewprofile" ).dialog({
			autoOpen: false,
			show: "blind",
			hide: "blind",
			modal:true,
			
		});

		$( "#addprofilebutton" ).click(function() {
			$( "#addnewprofile" ).dialog( "open" );
			return false;
		});
	});
	</script> 
  <script>
$(function() {
		$( "button, input:submit,").button();
	});
   </script> 
  	<script>
	$(function() {
		$( "#choosesex" ).buttonset();
	});
	</script>
</head>

<body>
<?php
include('config.php') 
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

?>
<h2>Travellers</h2>
<?php

// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM profile") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<div class='travelcard ui-widget-content ui-corner-all' style='padding:5px; margin:10px'>";
echo "<h2 class='ui-widget-header ui-corner-all' style='padding:3px'>";
echo $row['fname'];
echo "&nbsp;";
echo $row['lname'];
echo "</h2>";
echo "<table width='450' border='0' cellspacing='0' cellpadding='0'>";
echo "<tr><td><p>";
echo "<img src=\"http:\/\/api.twitter.com/1/users/profile_image/";
echo $row['twitter'];
echo ".json?size=bigger\" />";
echo "</td><td>";
echo $row['email'];
echo "</p><p>";
echo $row['age'] ;
echo "&nbsp;<em>year old</em>&nbsp;";
echo $row['sex'] ;
echo "&nbsp;<em>from</em>&nbsp;" ;
echo $row['hometown'];
echo "</p>";
echo "<p>Passport:";
echo $row['passport'] ;
echo "<br />";
echo "Frequent Flyer:" ;
echo $row['freqflyer'];
echo "</p><p><em>";
echo $row['biog'];
echo "</em></p></td>";
echo "</tr></table>";
echo "<button onclick=window.open('showprofile.php?id=";
echo $row['id'];
echo "','blank','toolbar=no,width=350,height=400,left=auto,right=auto') name='fullinfo'>View/Edit Profile</button></p></div>";

} 

?>
<div class="travelcard ui-widget-content ui-corner-all" style="display:none">
<h3 class="ui-widget-header ui-corner-all">$fname $lname </h3>
<table width="450" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td>Display Photo </td>
    <td><p>email </p>
      <p>$age $sex <em>from</em> $hometown</p>
      <p>Passport: $passport<br />
      Frequent Flyer: $freqflyer </p>
      <p><em>$bio </em></p></td>
  </tr>
</table>
<button name="fullinfo" value="">View Personal Schedule </button>   <button name="fullinfo" value="">View/Edit Profile </button>
  </p>
</div>
<p>
 
</p>
<button id="addprofilebutton" style="float:right">Add New Profile</button>
<div id="addnewprofile" style=" padding:5px; margin:10px" title="Add New Profile">
<form action="scripts/addprofile.php" method="post" enctype="multipart/form-data" name="profile" id="profileform">
  <label>First name
  <input type="text" name="fname" value="" />
  </label>
  <br />
  <label>Last Name
<input type="text" name="lname" value=""/>
</label>
<br />
<label>Age
<input name="age" type="text" value="" size="5" maxlength="3"/>
</label>
<br />
Sex 
<label>
<input name="sex" type="radio" value="Male" />
Male</label>
<label>
<input name="sex" type="radio" value="Female" />
Female</label>
<br />
<label>Email
<input type="text" name="email" value=""/>
</label>
<br />
<label>Twitter
<input type="text" name="twitter" value=""/>
</label>
<br />
<label>Hometown
<input type="text" name="hometown" value="" />
</label>
<br />
<label>Brief Biography
<textarea name="biog" cols="30" rows="4">A bit about you</textarea>
</label>
<br />
<label>Passport No.
<input type="text" name="passport" value="" />
</label>
<label>Frequent Flyer No.
<input type="text" name="freqflyer" value="" />
</label>
<p>
<input type="submit" name="Submit" value="Submit" />
</p>
</form></div>
<script type="text/javascript"> 
        // wait for the DOM to be loaded 
        $(document).ready(function() { 
            // bind 'myForm' and provide a simple callback function 
            $('#profileform').ajaxForm(function() { 
                $('#addnewprofile').dialog('close'); 
            }); 
        }); 
    </script>
</body>
</html>