<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="Content-Style-Type" content="text/css" />
		<meta http-equiv="Content-Script-Type" content="text/javascript" />	
		<title>Sidebar</title>
		<link type="text/css" href="css/humanity/jquery-ui-1.8.5.custom.css" rel="stylesheet" /> 
		<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script>
			<script type="text/javascript" src="js/jquery-ui-1.8.5.custom.min.js"></script> 
	<link type="text/css" href="jquery/development-bundle/demos/demos.css" rel="stylesheet" /> 
		<script type="text/javascript">
			$(function(){
				//When the button with an id of submit is clicked (the submit button)
				$("#submittodo").click(function(){
				
				//Retrieve the contents of the textarea (the content)
				var formvalue = $("#contenttodo").val();
				
				//Build the URL that we will send
				var url = 'submit=1&content=' + escape(formvalue);
				
				//Use jQuery's ajax function to send it
				 $.ajax({
				   type: "POST",
				   url: "scripts/sidebarprocess.php",
				   data: url,
				   success: function(){
				
				//If successful , notify the user that it was added
				   $("#msg").html("<p class='add'>You just added: <i>" + formvalue + "</i></p>");
				   $("#content").val('');
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
				  url: "scripts/sidebarprocess.php",
				  cache: false,
				  success: function(html){
				    $("#todolist").html(html);
				  }
				});
			}

		</script>
	</head>
	<body>
<script type="text/javascript"> 
		$(function() {
		$( "#accordion" ).accordion({
			fillSpace: true,
		});
	});
</script>
<div id="countdowncontainer" class="ui-widget-content ui-corner-all" style="height:7%">
<?php include("scripts/countdown.php"); ?>
</div>
<div id="container" style="height:600px">
<div id="accordion">
					<h3><a id="accordiontodo">To do:</a></h3>
					<div id="todolist"></div>
					<h3><a id="accordionchat">Chat:</a></h3>
<div id="chatbox">
		<span class="clear"></span>
		<div class="content">
			<div id="loading"></div>
			<ul>
			<ul>
		</div>
</div>
</div>
<style>
.content{
	margin: 0pt auto;
	text-align: left;
	padding: 10px;
	padding-bottom: 5px;
	font-size: 11px;
}
.content ul{
list-style:none;
margin-left:0px;
padding-left:0px
}
.content ul .user{
color:#999999;
font-size: 9px;
font-stretch:condensed;
}
.ui-icon-arrowthick-1-e{
display:inline-block;
}
</style>
<script>
$(document).ready(function(){
		$("#accordiontodo").click(function(){
			$("#chattingformbox").hide();
			$("#todoformbox").show();
		})
		$("#accordionchat").click(function(){
			$("#todoformbox").hide();
			$("#chattingformbox").show();
		})
		});
</script>
		
<div id="addnewbox" class="ui-widget-content ui-corner-all">					
					<div id="todoformbox" style="height:100px">
					<form id="form" action="scripts/sidebarprocess.php" method="post">
					  <textarea name="content" id="contenttodo" style=""></textarea>
					  <br />
						<input type="submit" id="submittodo" name="submit" value="Add to-do" />
					</form>	</div><div id="chattingformbox" style="height:100px; display:none">
					<form method="post" id="chatform">
<input class="text user" id="nick" type="hidden" MAXLENGTH="25" value="<?php echo $_SESSION['user_name']; ?>" />
<textarea class="text" id="message" type="text" style="" MAXLENGTH="255" /></textarea><br />
<input id="send" type="submit" name="send" value="Chat" />
	</form></div>
</div>

<script>
﻿/***************************/
//@Author: Adrian "yEnS" Mato Gondelle & Ivan Guardado Castro
//@website: www.yensdesign.com
//@email: yensamg@gmail.com
//@license: Feel free to use it, but keep this credits please!                  
/***************************/

$(document).ready(function(){
    //global vars
    var inputUser = $("#nick");
    var inputMessage = $("#message");
    var loading = $("#loading");
    var messageList = $(".content > ul");
    
    //functions
    function updateShoutbox(){
        //just for the fade effect
        messageList.hide();
        loading.fadeIn();
        //send the post to shoutbox.php
        $.ajax({
            type: "POST", url: "shoutbox.php", data: "action=update",
            complete: function(data){
                loading.fadeOut();
                messageList.html(data.responseText);
                messageList.fadeIn(2000);
            }
        });
    }
    //check if all fields are filled
    function checkForm(){
        if(inputUser.attr("value") && inputMessage.attr("value"))
            return true;
        else
            return false;
    }
    
    //Load for the first time the shoutbox data
    updateShoutbox();
    
    //on submit event
    $("#chatform").submit(function(){
        if(checkForm()){
            var nick = inputUser.attr("value");
            var message = inputMessage.attr("value");
            //we deactivate submit button while sending
            $("#send").attr({ disabled:true, value:"Sending..." });
            $("#send").blur();
            //send the post to shoutbox.php
            $.ajax({
                type: "POST", url: "shoutbox.php", data: "action=insert&nick=" + nick + "&message=" + message,
                complete: function(data){
                    messageList.html(data.responseText);
                    updateShoutbox();
                    //reactivate the send button
                    $("#send").attr({ disabled:false, value:"Chat" });
                }
             });
        }
        else alert("Please fill all fields!");
        //we prevent the refresh of the page after submitting the form
        return false;
    });
});
</script>
</body>
</html>