<?php

	$year = date('Y');
	$month = date('m');

	echo json_encode(array(
	
		array(
			'id' => 111,
			'title' => "Event1",
			'start' => "2011-01-10",
			'url' => "http://yahoo.com/"
		),
		
		array(
			'id' => 222,
			'title' => "Event2",
			'start' => "2011-01-20",
			'end' => "$year-$month-22",
			'url' => "http://yahoo.com/"
		)
	
	));

?>
