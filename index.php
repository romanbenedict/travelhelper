<?php
include 'login/dbc.php';
page_protect();
?>
<!DOCTYPE html> 
<html lang="en"> 
<head> 
	<meta charset="UTF-8" /> 
	<title>TravelHelper</title> 
	<link type="text/css" href="css/humanity/jquery-ui-1.8.5.custom.css" rel="stylesheet" /> 
	<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script> 
	<script type="text/javascript" src="js/jquery-ui-1.8.5.custom.min.js"></script>
	<script type="text/javascript" src="js/jquery.form.js"></script> 
	<link type="text/css" href="jquery/development-bundle/demos/demos.css" rel="stylesheet" /> 
	<script type="text/javascript"> 
	$(function() {
		$("#tabs").tabs();
	});
	</script> 
<script type="text/javascript"> 
		$(function() {
		$( "#accordion" ).accordion({
			fillSpace: true,
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
<div style="width:85%; float:left">
<h1>Romans TravelHelper</h1>
<h3>Travelling abroad is fun  </h3>
</div>
<div style="width:15%; float:right"><?
if (isset($_SESSION['user_id'])) {?>
<div class="myaccount">
<p><strong>Logged in as: <?php echo $_SESSION['user_name']; ?></strong></p>
<a href="login/myaccount.php">My Account</a><br>
<a href="login/mysettings.php">Settings</a><br>
<a href="login/logout.php">Logout </a>
</div>
<? } ?></div>
<div class="demo" style="width:100%"> 
 
<div id="tabs" style="float:left; width:80%"> 
	<ul> 
		<li><a href="#profile">Profiles</a></li> 
		<li><a href="#travel">Schedule</a></li> 
		<li><a href="#calendar">Calendar</a></li> 
	    <li><a href="#contacts">Contacts</a> </li>
	    <li><a href="#maps">Maps</a></li>
		<li><a href="#budget">Budget</a></li>
	    <li><a href="#packing">Packing</a></li>
		<li><a href="#tobook">Still To Book</a></li>
		<li><a href="#thingstodo">Things to do</a></li>
		<li><a href="#travelblog">TravelBlog</a></li>
	</ul> 
<div id="profile"> 
<iframe allowtransparency="true" width="100%" height="100%" src="profile.php" style="border:0px"></iframe>
	</div>
	<div id="travel"> 
<iframe allowtransparency="true" width="100%" height="100%" src="travel.php" style="border:0px"></iframe>
	</div>
	<div id="calendar"> 
<iframe allowtransparency="true" width="100%" height="100%" src="calendar.php" style="border:0px"></iframe>
	</div>
	<div id="contacts"> 
<iframe allowtransparency="true" width="100%" height="100%" src="contacts.php" style="border:0px"></iframe>
	</div>
<div id="maps"> 
<iframe allowtransparency="true" width="100%" height="100%" src="maps.php" style="border:0px"></iframe>
	</div>
	<div id="budget"> 
<iframe allowtransparency="true" width="100%" height="100%" src="budget.php" style="border:0px"></iframe>
	</div>
	<div id="packing"> 
<iframe allowtransparency="true" width="100%" height="100%" src="packing.php" style="border:0px"></iframe>
	</div>
	<div id="tobook"> 
<iframe allowtransparency="true" width="100%" height="100%" src="tobook.php" style="border:0px"></iframe>
	</div>
	<div id="thingstodo"> 
<iframe allowtransparency="true" width="100%" height="100%" src="thingstodo.php" style="border:0px"></iframe>
	</div>
	<div id="travelblog"> 
<iframe allowtransparency="true" width="100%" height="100%" src="travelblog.php" style="border:0px"></iframe>
	</div>
</div> 
 

<div id="socialbar" class="" style="width:17%; float:right; height:760px">
<?php include("sidebartodo.php") ?>
</div>
</body> 
</html> 