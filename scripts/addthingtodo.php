<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

	// CLIENT INFORMATION
	$category  = htmlspecialchars(trim($_POST['place']));
	$content = htmlspecialchars(trim($_POST['activity']));

$addthing  = "INSERT INTO activities (place, activity) VALUES ('$category','$content')";
mysql_query($addthing) or die(mysql_error());

?>