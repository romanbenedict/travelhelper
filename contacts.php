<?php
include 'login/dbc.php';
page_protect();
?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<link type="text/css" href="css/humanity/jquery-ui-1.8.5.custom.css" rel="stylesheet" /> 
	<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script> 
	<script type="text/javascript" src="js/jquery-ui-1.8.5.custom.min.js"></script> 
	<link type="text/css" href="jquery/development-bundle/demos/demos.css" rel="stylesheet" /> 
<title>Contacts</title>
	<script>
	// increase the default animation speed to exaggerate the effect
	$.fx.speeds._default = 1000;
	$(function() {
		$( "#addnewcontact" ).dialog({
			autoOpen: false,
			show: "blind",
			hide: "blind"
		});

		$( "#addcontactbutton" ).click(function() {
			$( "#addnewcontact" ).dialog( "open" );
			return false;
		});
	});
	</script> 
  <script>
$(function() {
		$( "button, input:submit,").button();
	});
   </script> 
</head>

<body>
<?php
include('config.php') 
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

?>
<h2>Contacts</h2>
<?php

// Get all the data from the "example" table
$result = mysql_query("SELECT * FROM contacts") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	// Print out the contents of each row into a table
echo "<div class='contactcard ui-widget-content ui-corner-all' style='padding:5px; margin:10px'>";
echo "<h2 class='ui-widget-header ui-corner-all' style='padding:3px'>";
echo $row['name'];
echo "</h2><p>Address:&nbsp;";
echo $row['address'];
echo "</p><p>";
echo $row['email'] ;
echo "</p><p>Phone:&nbsp;";
echo $row['phone'] ;
echo "</p><p>Notes:&nbsp;" ;
echo $row['notes'];
echo "</p>";
echo "<button onclick=window.open('showcontact.php?id=";
echo $row['contactid'];
echo "','blank','toolbar=no,width=500,height=500,left=auto,right=auto') name='fullinfo' value=''>View/Edit Event </button></p></div>";

} 

?>
<div class="ui-widget-content ui-corner-all" style="display:none">
<h3 class="ui-widget-header ui-corner-all">$name</h3>

<p>address</p>
<p>email </p>
<p>phone</p>
      <p><em>$notes</em></p></td>
<button name="fullinfo" value="">View Connected Events</button>   
<button name="fullinfo" value="">Edit Contact </button>
  </p>
</div>
<p>
 
</p>
<button id="addcontactbutton" style="float:right">Add New Contact </button>
<div title="Add New Contact" id="addnewcontact" style="display:none; padding:5px; margin:10px">
<form action="scripts/addcontact.php" method="post" enctype="multipart/form-data" name="profile" id="contactform">
  <label>Name
  <input type="text" name="name" value="" />
  </label>
  <br />
  <label></label>
  <label>Email
<input type="text" name="email" value=""/>
</label>
<br />
<label>Address
<input type="text" name="address" value="" />
</label>
<br />
<label>Phone No.
<input type="text" name="phone" value="" />
<br />
</label>
<label>Notes
<textarea name="notes" cols="30" rows="4">Useful notes</textarea>
</label>
<br />
<label></label>
<label></label>
<p>
  <input type="submit" name="Submit" value="Submit" />
</p>
</form></div>
<script type="text/javascript"> 
        // wait for the DOM to be loaded 
        $(document).ready(function() { 
            // bind 'myForm' and provide a simple callback function 
            $('#contactform').ajaxForm(function() { 
                $('#addnewcontact').dialog('close'); 
            }); 
        }); 
    </script>
</body>
</html>