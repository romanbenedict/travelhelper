<?php
include 'login/dbc.php';
page_protect();
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>Activities</title>
		<link type="text/css" href="css/humanity/jquery-ui-1.8.5.custom.css" rel="stylesheet" /> 
		<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script>
			<script type="text/javascript" src="js/jquery-ui-1.8.5.custom.min.js"></script> 
			<script type="text/javascript" src="js/jquery.masonry.min.js"></script>
		<script type="text/javascript">
			$(function(){
				//When the button with an id of submit is clicked (the submit button)
				$("#submit").click(function(){
				
				//Retrieve the contents of the textarea (the content)
				var place     = $('#place').attr('value');
				var activity     = $('#activity').attr('value');
				//Build the URL that we will send
				var url = 'submit=1&activity=' + activity +'&place='+ place;
				
				//Use jQuery's ajax function to send it
				 $.ajax({
				   type: "POST",
				   url: "scripts/showthingtodo.php",
				   data: url,
				   success: function(){
					$('#addtodoitem').dialog('close');
				//If successful , notify the user that it was added
				   $("#msg").html("<p class='add'>You just added: <i>" + place + ":" + activity + "</i></p>");
				   $("#activity").val('');
				   $("#place").val('');
				   todolist();
				   }
				 });
				
				//We return false so when the button is clicked, it doesn't follow the action
				return false;
				
				});
			
				todolist();
			});

			function todolist(){
				$.ajax({
				  url: "scripts/showthingtodo.php",
				  cache: false,
				  success: function(html){
				    $("#todolist").html(html);
				  }
				});
			}

		</script>
		<script>
	$(function() {
		$( "#addtodoitem" ).dialog({
			autoOpen: false,
			show: "blind",
			hide: "blind"
		});

		$( "#addtodobutton" ).click(function() {
			$( "#addtodoitem" ).dialog( "open" );
			return false;
		});
	});
	</script> 
	<script>
	$(function() {
	$('#todolist').masonry({
  columnWidth: 100, 
  itemSelector: '.categorybox' 
});
	});
	</script>	
		</head>
	<body>
					<h2>Things to Do   :</h2>
					<div id="todolist" style="width:100%; height:85%"></div>
					<p>&nbsp;</p>
					<div class="msg" id="msg">				  
					</div><div id="addtodoitem">
					<form id="form" action="scripts/showthingtodo.php" method="post">
						Place
						<input type="text" name="place" id="place" ><br />						
						Activity
						<input type="text" name="activity" id="activity"><br />
						<input type="submit" id="submit" name="submit" value="Add it" />
					</form></div>
<button id="addtodobutton">Add Activity</button>					
</body>
</html>