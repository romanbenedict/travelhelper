<?php
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());

	// CLIENT INFORMATION
	$category  = htmlspecialchars(trim($_POST['category']));
	$content = htmlspecialchars(trim($_POST['content']));

$addthing  = "INSERT INTO notes (category, content) VALUES ('$category','$content')";
mysql_query($addthing) or die(mysql_error());

?>