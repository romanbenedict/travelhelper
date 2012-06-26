<?php
	//Connect to the database
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
	
	//Was the form submitted?
	if($_POST['submit']){
	
	//Map the content that was sent by the form a variable. Not necessary but it keeps things tidy.
	$content = $_POST['content'];
	
	//Insert the content into database
	$ins = mysql_query("INSERT INTO `todo` (content) VALUES ('$content')");
	
	//Redirect the user back to the index page
	header("Location:../sidebartodo.php");
	}
	/*Doesn't matter if the form has been posted or not, show the latest posts*/
	
	//Find all the notes in the database and order them in a descending order (latest post first).
	$find = mysql_query("SELECT * FROM `todo` ORDER BY id DESC");
	
	//Setup the un-ordered list
	echo '<table border="0" cellpadding="5" cellspacing="0" class="list" width="100%">';
	
	//Continue looping through all of them
	while($row = mysql_fetch_array($find)){
	
	//For each one, echo a list item giving a link to the delete page with it's id.
	echo '<tr><td valign="middle" width="90%">' . $row['content'] . ' </td>
		<td valign="middle" width="10%"><form id="form" action="delete.php?id=' . $row['id'] . '" method="post">
		<input class="todo_id" name="todo_id" type="hidden" value="' . $row['id'] . '" />
		<input class="todo_content" name="todo_content" type="hidden" value="'  . $row['content'] . '" />
		<input type="image" src="images/delete.png" class="delete" name="delete" width="20px"  />
		
		</form>
		</td></tr>';
	}
	
	//End the un-ordered list
	echo '</table>';
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
		   url: "scripts/sidebardelete.php",
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