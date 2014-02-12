
<!-- The super notebook takes a subset of  -->


<html>

	<head>
		
		<title>SUPER NOTEBOOK!</title>
		
		<!-- Stylesheets -->
		<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css" />
		<link rel="stylesheet" type="text/css" href="/lib/jquery-ui-1.10.0.custom/css/smoothness/jquery-ui-1.10.0.custom.min.css" />
		<link rel="stylesheet" type="text/css" href="/basic/shared/css/main.css" />
		
		<link rel="stylesheet" type="text/css" href="/basic/supernotebook/supernotebook.css" />
		<link rel="stylesheet" type="text/css" href="/basic/supernotebook/supernotebook-step1.css" />
		
		<!-- Scripts -->
		<script src="/lib/jquery-1.7.2.min.js"></script>
		<script src="/lib/underscore-min.js"></script>
		<script src="/lib/backbone-min.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-dropdown.js"></script>
		<script src="/lib/jquery-ui-1.10.0.custom/js/jquery-ui-1.10.0.custom.min.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-tooltip.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-popover.js"></script>
		
		<script src="/basic/shared/js/note-models.js"></script>
		<script src="/basic/supernotebook/views/note-views.js"></script>
		<script src="/basic/shared/js/highlight-models.js"></script>
		<script src="/basic/supernotebook/views/highlight-views.js"></script>
		
		<script src="/basic/shared/js/section-models.js"></script>
		<script src="/basic/shared/js/section-views.js"></script>
		<script src="/basic/supernotebook/views/section-views.js"></script>
		
		<script src="/basic/shared/js/content-models.js"></script>
		<script src="/basic/shared/js/content-views.js"></script>
		<script src="/basic/supernotebook/views/chapter-views.js"></script>
		
		<script src="/basic/shared/js/resource-models.js"></script>
		<script src="/basic/shared/js/resource-views.js"></script>
		<script src="/basic/supernotebook/views/resource-views.js"></script>
		
		<script src="/basic/shared/js/userbar.js"></script>
		<script src="/basic/shared/js/user-models.js"></script>
		<script src="/basic/supernotebook/supernotebook.js"></script>
		
	</head>


	<body>
		<div id="BodyContainer">
			<div id="topBar">
				<input id="backBtn" type="button" class="btn" value="Back to Main Menu"/>
				<center><h1 class="title inline">Super Notebook</h1></center>
				<br>
			</div>
			<div id="mainBody" hidden>
				<div id="leftColumn">
					
					<div id="legend">
						<div class="green">Number of Highlights</div>
						<div class="red">Number of Notes</div>
						<div class="blue">Section Summaries Completed</div>
					</div>
				</div>
				
				<div id="rightColumn"></div>
				
			</div>
			<div id="step1">
				<div id="books-container" class="panel">
					<div id="books"></div>
				</div>
				<div id="chapters-container" class="panel">
					<div id="chapters"></div>
				</div>
				<div id="sections-container" class="panel">
					<div id="sections"></div>
				</div>
				<input type="button" id="Start" class="btn btn-primary btn-large" style="display: none;" value="Start"/>
			</div>
			<div id="loading">
				<img src="/images/spinner.gif"><br>
				<div class="loadingtext">Now loading your Super Notebook content...</div>
			</div>
			
		</div>
		
	
	</body>



</html>