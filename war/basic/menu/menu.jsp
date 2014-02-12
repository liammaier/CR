<html>
	<head>
		<!-- Stylesheets -->
		<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css" />
		<link rel="stylesheet" type="text/css" href="/basic/shared/css/main.css" />
		<link rel="stylesheet" type="text/css" href="/basic/menu/menu.css" />

		<!-- Scripts -->
		<script src="/lib/jquery-1.7.2.min.js"></script>
		<script src="/lib/underscore-min.js"></script>
		<script src="/lib/backbone-min.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-dropdown.js"></script>
		<script src="/basic/shared/js/library-models.js"></script>
		<script src="/basic/shared/js/library-views.js"></script>
		<!--script src="/basic/menu/reminder-models.js"></script-->
		<!--script src="/basic/menu/reminder-views.js"></script-->
		<script src="/basic/shared/js/user-models.js"></script>

		<script src="/basic/shared/js/userbar.js"></script>
		<script src="/basic/menu/menu.js"></script>
	</head>

	<body>
		<input id="backBtn" type="button" class="btn" value="Back to Home Page">
		<div id="librariesBar">
			<center><h1 class="title">CampusReader</h1></center>
			<hr><br>
			<div id="barContainer">

				<div id="libBar" class="bar">
					<div id="profilePic">
						<img class="titlepic inline" src="/images/library.png"/>
						<h1 class="subtitle inline">Start Reading</h1>
					</div>
					<div id="profileDesc" class="divDesc">
						<br>
						Click here to see all of your books and start reading.
					</div>
					<a href="/libraries" id="libraryBtn" type="button" class="btn btn-primary btn-large"> Go to Books </a>
					

				</div>

			
				<br>
				<div id="scheduleBar" class="bar">
					<div id="profilePic">
						<img class="profilepicsmall inline" src="/images/check.png"/>
						<h1 id="profileTitle" class="subtitle inline">Reading Profile</h1>
					</div>
					<div id="profileDesc" class="divDesc">
						<br>
						Click here to setup or change your reading profile and reminders.
					</div>
					<!--<input id="profileBtn" type="button" class='btn btn-primary btn-large' value="Go to Profile"/-->
					<a href="/basic/options/reminders.html" id="libraryBtn" type="button" class="btn btn-primary btn-large"> Go to Profile </a>
					
					<!--div id="toprightDate"></div>
					<table id="remindertable" class="table table-bordered white-header white-table">
						<thead>
							<tr>
								<th>Library</th>
								<th>Reminder</th>
							</tr>
						</thead>
						<tbody id="remindertableBody">
						</tbody>
					</table-->
				</div>

				<br>
				<div id="reviewBar" class="bar">
					<div id="profilePic">
						<img class="titlepic inline" src="/images/address_book.png"/>
						<h1 class="subtitle inline">Review</h1>
					</div>
					<div id="profileDesc" class="divDesc">
						<br>
						Click here to see all of your notes and review.
					</div>
					<a href="/supernotebook" id="libraryBtn" type="button" class="btn btn-primary btn-large"> Go to Review </a>
				</div>
				
				<br>
				<div id="helpBar" class="bar">
					<div id="helpPic">
						<img class="titlepic inline" src="/images/help.png"/>
						<h1 class="subtitle inline">Video Tutorial</h1>
					</div>
					<div id="helpDesc" class="divDesc">
						<br>
						Click here to view a video about the different features and how to use Campus Reader.
					</div>
					<a href="/basic/training/videos.html" id="contBtn" type="button" class='btn btn-primary btn-large'> Go to Tutorial </a>
				</div>
				

				
			</div>
		</div>
	</body>
</html>