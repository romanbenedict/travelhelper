<?php 
include('config.php');
$sql= "SELECT id, title, description, url, email, Stime, Etime, eventDate, DATE_FORMAT(eventDate, '%Y-%m-%dT%H:%i' ) AS startDate
FROM events
ORDER BY startDate DESC";
$check = mysql_query($databaseDB, $sql, $connectItDB) or die(mysql_error());

$events = array();
while ($row = mysql_fetch_assoc($check)) {
$eventArray['id'] = $row['id'];   
$eventArray['description'] = $row['description'];
$eventArray['url'] = $row['url'];
$eventArray['email'] = $row['email'];
$eventArray['startTime'] = $row['Stime'];
$eventArray['EndTime'] = $row['Etime'];   
$eventArray['title'] =  $row['Stime'] . " " . $row['title'];
$eventArray['start'] = $row['startDate'];
$eventsArray['allDay'] = "";
$events[] = $eventArray;
}
echo json_encode($events);
?>