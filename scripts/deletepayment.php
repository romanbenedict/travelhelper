<?php
include('config.php');
	//Connect to the database
	//$connection = mysql_connect('localhost', 'tester' , 'password');
	//$selection = mysql_select_db('test', $connection);
	

	//if($_GET['id']){
		$id = $_GET['id'];
	//$id = $_GET['id'];
	
	//Delete the record of the post
	$delete = mysql_query("DELETE FROM `payment` WHERE `paymentid` = '$id'");
	
	//Redirect the user
	echo "<script>window.close</script>";
	

?>