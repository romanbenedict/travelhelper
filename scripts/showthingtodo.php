<?php
include('config.php');
	//Connect to the database
	//$connection = mysql_connect('localhost', 'tester' , 'password');
	//$selection = mysql_select_db('test', $connection);
	
	//Was the form submitted?
	if($_POST['submit']){
	
	//Map the content that was sent by the form a variable. Not necessary but it keeps things tidy.
	$activity = $_POST['activity'];
	$place = $_POST['place'];
	
	//Insert the content into database
	$ins = mysql_query("INSERT INTO `activities` (activity, place) VALUES ('$activity', '$place')");
	
	//Redirect the user back to the index page
	header("Location:../thingstodo.php");
	}
	/*Doesn't matter if the form has been posted or not, show the latest posts*/
	
	//Find all the notes in the database and order them in a descending order (latest post first).
	$find = mysql_query("SELECT * FROM `activites` ORDER BY id DESC");
	
	$result = mysql_query("SELECT * FROM activities GROUP BY place") 
or die(mysql_error());  

// keeps getting the next row until there are no more to get
while($row = mysql_fetch_array( $result )) {
	$place= $row['place'];
		echo "<div class='categorybox'><p><strong>";
		echo $place;
		echo "</strong></p>";
		$result2 = mysql_query("SELECT activity, id FROM activities WHERE place='$place'");
	while($row2 = mysql_fetch_array( $result2 )){
	//Continue looping through all of them
	//while($row = mysql_fetch_array($find)){
	
	//For each one, echo a list item giving a link to the delete page with it's id.
	echo $row2['activity'] . "<form id='form' action='delete.php?id=" . $row2['id'] . "' method='post' style='display:inline'>
		<input class='todo_id' name='todo_id' type='hidden' value='" . $row2['id'] . "' />
		<input class='todo_content' name='todo_content' type='hidden' value='"  . $row2['activity'] . "' />
		<input type='image' src='images/delete.png' class='delete' name='delete' width='20px'  /></form><br/>";
	}
	echo "</div>";
	};
?>
<script type="text/javascript">
	$(".delete").click(function(){
	
		//Retrieve the contents of the textarea (the content)
		var todo_id = $(this).parent().find(".todo_id").val();
		var todo_content = $(this).parent().find(".todo_content").val();
		
		//Build the URL that we will send
		var url = 'submit=1&id=' + todo_id;
		
		//Use jQuery's ajax function to send it
		 $.ajax({
		   type: "POST",
		   url: "scripts/deletethingtodo.php",
		   data: url,
		   success: function(){
		
		//If successful , notify the user that it was added
		   $("#msg").html("<p class='remove'>You just deleted: <i>" + todo_content + "</i></p>");
		   $("#content").val('');
		   todolist();
		   }
		 });
		
		//We return false so when the button is clicked, it doesn't follow the action
		return false;
	
	});

</script>