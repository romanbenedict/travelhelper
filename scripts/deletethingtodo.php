<?php
include('config.php');
	//Connect to the database
	//$connection = mysql_connect('localhost', 'tester' , 'password');
	//$selection = mysql_select_db('test', $connection);
	
	//delete.php?id=IdOfPost
	if($_POST['submit']){
	//if($_GET['id']){
	echo $id = $_POST['id'];
	//$id = $_GET['id'];
	
	//Delete the record of the post
	$delete = mysql_query("DELETE FROM `activities` WHERE `id` = '$id'");
	
	//Redirect the user
	header("Location:../thingstodo.php");
	
	}

?>