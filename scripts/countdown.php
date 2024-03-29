<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<script language="Javascript" type="text/javascript" src="scripts/js/jquery.lwtCountdown-1.0.js"></script>
	<link rel="Stylesheet" type="text/css" href="scripts/style/main.css"></link>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

	<title>Countdown</title>
</head>

<body>


		<!-- Countdown dashboard start -->
		<div id="countdown_dashboard">
			<div class="dash weeks_dash">
				<span class="dash_title">weeks</span>
				<div class="digit">0</div>
				<div class="digit">0</div>
		  </div>

			<div class="dash days_dash">
				<span class="dash_title">days</span>
				<div class="digit">0</div>
				<div class="digit">0</div>
		  </div>

			<div class="dash hours_dash">
				<span class="dash_title">hours</span>
				<div class="digit">0</div>
				<div class="digit">0</div>
		  </div>

			<div class="dash minutes_dash">
				<span class="dash_title">minutes</span>
				<div class="digit">0</div>
				<div class="digit">0</div>
		  </div>

			<div class="dash seconds_dash">
				<span class="dash_title">seconds</span>
				<div class="digit">0</div>
				<div class="digit">0</div>
		  </div>

		</div>
		<!-- Countdown dashboard end -->

		<script language="javascript" type="text/javascript">
			jQuery(document).ready(function() {
				$('#countdown_dashboard').countDown({
					targetDate: {
						'day': 		16,
						'month': 	1,
						'year': 	2011,
						'hour': 	17,
						'min': 		35,
						'sec': 		0
					}
				});
				
			});
		</script>
	
</body>

</html>
