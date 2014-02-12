<html>

	<head>
		<!-- Stylesheets -->
		<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css" />
		<link rel="stylesheet" type="text/css" href="/basic/shared/css/main.css" />
		<link rel="stylesheet" type="text/css" href="/basic/library/selectlibrary.css" />

		<!-- Scripts -->
		<script src="/lib/jquery-1.7.2.min.js"></script>
		<script src="/lib/underscore-min.js"></script>
		<script src="/lib/backbone-min.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-dropdown.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-tooltip.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-popover.js"></script>

		<script src="/basic/shared/js/library-models.js"></script>
		<script src="/basic/shared/js/library-views.js"></script>

		<script src="/basic/library/selectlibrary.js"></script>

		<script src="/basic/shared/js/user-models.js"></script>

		<link rel='stylesheet' type='text/css' href='/lib/fullcalendar/fullcalendar.css' />
		<script src='/lib/fullcalendar/fullcalendar.js'></script>
		<script src="/lib/jquery.dotdotdot-1.5.1.js"></script>

		<script src="/basic/shared/js/userbar.js"></script>

	</head>

	<body>

		<!-- Back button -->
		<input id="backBtn" type="button" class="btn" value="Back to Main Menu"/>

		<div id="titleResourcesBar">
			<center>
				<img class="titlepic inline" src="/images/library.png"/>
				<h1 class="title inline">My Libraries</h1>
			</center>
			<hr>
			<div id="libraries">
				<p>Loading Libraries</p>
			</div>
		</div>
		<hr>
		<div id="spinnerbox">
			<img src="/images/spinner.gif"/>
		</div>
	</body>

</html>