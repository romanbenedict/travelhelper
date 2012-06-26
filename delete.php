<?php
include('config.php') 
	//Connect to the database
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
	
	//delete.php?id=IdOfPost
	if($_POST['submit']){
	//if($_GET['id']){
	echo $id = $_POST['id'];
	//$id = $_GET['id'];
	
	//Delete the record of the post
	$delete = mysql_query("DELETE FROM `notes` WHERE `id` = '$id'");
	
	//Redirect the user
	header("Location:packing.php");
	
	}

?>