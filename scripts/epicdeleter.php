<?php
$type = $_GET['type'];
$id = $_GET['id'];
include('config.php');
//mysql_connect("localhost", "tester", "password") or die(mysql_error());
//mysql_select_db("test") or die(mysql_error());
if($type==profile){
mysql_query("DELETE FROM profile WHERE id='$id'") 
or die(mysql_error()); 
echo "Profile deleted";
}elseif($type==travel){
mysql_query("DELETE FROM travel WHERE tripid='$id'") 
or die(mysql_error()); 
echo "Travel deleted";
}elseif($type==lodging){
mysql_query("DELETE FROM lodging WHERE lodgingid='$id'") 
or die(mysql_error()); 
echo "Lodging deleted";
}elseif($type==event){
mysql_query("DELETE FROM event WHERE eventid='$id'") 
or die(mysql_error()); 
echo "Event deleted";
}elseif($type==contact){
mysql_query("DELETE FROM contacts WHERE contactid='$id'") 
or die(mysql_error()); 
echo "Contact deleted";
}else{
echo "No valid value to delete";
};
?>
