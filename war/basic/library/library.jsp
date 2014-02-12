<%@ page import="com.googlecode.objectify.Key"%>
<%@ page import="edu.uoregon.models.libraries.Library"%>
<%@ page import= "edu.uoregon.models.DAO" %>
<html>

	<head>
		<!-- Stylesheets -->
		<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css" />
		<link rel="stylesheet" type="text/css" href="/basic/shared/css/main.css" />
		<link rel="stylesheet" type="text/css" href="/basic/library/library.css" />

		<!-- Scripts -->
		<script src="/lib/jquery-1.7.2.min.js"></script>
		<script src="/lib/underscore-min.js"></script>
		<script src="/lib/backbone-min.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-dropdown.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-tooltip.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-popover.js"></script>

		<script src="/basic/shared/js/resource-models.js"></script>
		<script src="/basic/shared/js/resource-views.js"></script>
		<script src="/basic/library/assignment-models.js"></script>
		<script src="/basic/library/assignment-views.js"></script>

		<script src="/basic/library/library.js"></script>

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

				<% 
					String id = request.getParameter("lib");
					Key<Library> libK = new Key<Library>(Library.class,new Long(id));
					DAO dao = new DAO();
					Library lib = dao.ofy().get(libK);

				%>

				<h1 class="title inline"><%=lib.name%></h1>
			</center>
			<hr>
			<div id="resourcesSection">
				<p>Loading Books</p>
			</div>
		</div>
		<hr>
		<div id="spinnerbox">
			<img src="/images/spinner.gif"/>
		</div>
	</body>

</html>