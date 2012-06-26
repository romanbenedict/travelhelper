<?php
/************************
	CONSTANTS
/************************/
define("HOST", "mysql254.cp.domaincentral.com.au");
define("USER", "u1331581_roman");
define("PASSWORD", "centurion");
define("DB", "db1331581_store");

/************************
	FUNCTIONS
/************************/
function connect($db, $user, $password){
	$link = @mysql_connect($db, $user, $password);
	if (!$link)
	    die("Could not connect: ".mysql_error());
	else{
		$db = mysql_select_db(DB);
		if(!$db)
			die("Could not select database: ".mysql_error());
		else return $link;
	}
}
function getContent($link, $num){
	$res = @mysql_query("SELECT user, message FROM shoutbox ORDER BY date ASC LIMIT ".$num, $link);
	if(!$res)
		die("Error: ".mysql_error());
	else
		return $res;
}
function insertMessage($user, $message){
	$query = sprintf("INSERT INTO shoutbox(user, message) VALUES('%s', '%s');", mysql_real_escape_string(strip_tags($user)), mysql_real_escape_string(strip_tags($message)));
	$res = @mysql_query($query);
	if(!$res)
		die("Error: ".mysql_error());
	else
		return $res;
}
/******************************
	MANAGE REQUESTS
/******************************/
if(!$_POST['action']){
	//We are redirecting people to our shoutbox page if they try to enter in our shoutbox.php
	header ("Location: sidebartodo.php");
}
else{
	$link = connect(HOST, USER, PASSWORD);
	switch($_POST['action']){
		case "update":
			$res = getContent($link, 20);
			while($row = mysql_fetch_array($res)){
				$result .= "<li><span class='user'>".$row['user']."</span><span class='ui-icon ui-icon-arrowthick-1-e'></span><span class='message'>".$row['message']."<span></li>";
			}
			echo $result;
			break;
		case "insert":
			echo insertMessage($_POST['nick'], $_POST['message']);
			break;
	}
	mysql_close($link);
}
?>