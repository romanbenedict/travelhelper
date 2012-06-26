<?php
echo "<p>";
# Open the File.
if (($handle = fopen("http://www.wunderground.com/history/airport/EGLL/2011/01/17/PlannerHistory.html?format=1", "r")) !== FALSE) {
    # Set the parent multidimensional array key to 0.
    $nn = 0;
    while (($data = fgetcsv($handle, 0, ",")) !== FALSE) {
        # Count the total keys in the row.
        $c = count($data);
        # Populate the multidimensional array.
        for ($x=0;$x<$c;$x++)
        {
            $csvarray[$nn][$x] = $data[$x];
        }
        $nn++;
    }
    # Close the File.
    fclose($handle);
}

// take the row'ified data and columnize the array
function columnizeArray($csvarray) {
    $array = array();
    foreach($csvarray as $key=>$value) {
        // reparse into useful array data.
        if ($key == 0) {
            foreach ($value AS $key2=>$value2) {
                $array[$key2] = array();
                $array[$key2][] = $value2;
            }
        }else if ($key > 0){
            foreach ($value as $key3=>$value3) {
				$array[$key3][] = $value3;
				
            }
        }else{
        }
    }
    return $array;
}
function groupColumns($array = null) {
    $array2 = array();
    foreach ($array as $k=>$v) {
        // procss each column
        // $k = column number
        // $v = array of rows
        if ($k == 0) {}else{ // working on column 2 or higher
            $array2[$v[0]] = array();
            foreach ($array[0] as $k1=>$v1) {
                if ($v1 > 0) { // ignore the column heading
                    // store the first column variable in as the key.
                    // Store the value associated with this item as the value.
                    $array2[$v[0]][$v1] = $v[$k1];
                }
            }
     }
    }
    return $array2;
}

$array2 = groupColumns(columnizeArray($csvarray));

//Start Printing Weather Variables//
$averagepressure = array_filter($array2['Mean Sea Level PressurehPa']);
 $pressure = array_sum($averagepressure) / count($averagepressure);

if($pressure>=1040)
	echo "<img src=\"images/icon-set/PNG/150x150/hazy.png\" width='100px' height='100px' title='Very Dry'/> ";	
elseif($pressure>=1020)
	echo "<img src=\"images/icon-set/PNG/150x150/sunny.png\" width='100px' height='100px' title='Fair'/> ";	
elseif($pressure>=984)
	echo "<img src=\"images/icon-set/PNG/150x150/m-c-rain.png\" width='100px' height='100px' title='Change' />";
elseif($pressure>=960)
	echo "<img src=\"images/icon-set/PNG/150x150/rainy.png\" width='100px' height='100px' title='Rain'/>";
elseif($pressure<960)
	echo "<img src=\"images/icon-set/PNG/150x150/t-storm-rain.png\" width='100px' height='100px' title='Stormy' />";
else
	echo " <img src=\"images/icon-set/PNG/150x150/na.png\" width='100px' height='100px' title='Could not load Weather'/>";



echo "<br/>";
$averagetemperature = array_filter($array2['Mean TemperatureC']);

echo "Avg Temp:<strong> ";
 $temperature = array_sum($averagetemperature) / count($averagetemperature);
  echo round($temperature, 2);
 echo "&deg;C</strong><br/>";

$averagewind = array_filter($array2['Mean Wind SpeedKm/h']);

echo "Wind: <strong>";
 $wind = array_sum($averagewind) / count($averagewind);
 echo round($wind, 2);
 echo "Km/h</strong>";
echo "<br/>";

$averagecloud = array_filter($array2['CloudCover']);
echo "Clouds: <strong>";
 $cloud = 10*array_sum($averagecloud) / count($averagecloud);
 echo round($cloud, 2);
 echo "%</strong></p>";


?>
