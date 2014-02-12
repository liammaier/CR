<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%@ page import="edu.uoregon.models.DAO" %>
<%@ page import="edu.uoregon.models.Resource" %>
<%@ page import="edu.uoregon.models.OFY" %>
<%@ page import="edu.uoregon.models.Content"%>

<%@ page import ="com.googlecode.objectify.Key"%>

<%@ page import ="java.lang.Long" %>


<html>

	<head>
		<!-- Stylesheets -->
		<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css" />
		<link rel="stylesheet" type="text/css" href="/basic/shared/css/main.css" />
		<link rel="stylesheet" type="text/css" href="/basic/resource/resource.css" />
		
		<!-- Scripts -->
		<script src="/lib/jquery-1.7.2.min.js"></script>
		<script src="/lib/underscore-min.js"></script>
		<script src="/lib/backbone-min.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-dropdown.js"></script>
		<script src="/basic/shared/js/content-models.js"></script>
		<script src="/basic/shared/js/content-views.js"></script>
		<script src="/basic/shared/js/user-models.js"></script>
		
		<script src="/basic/shared/js/userbar.js"></script>
		<script src="/basic/resource/resource.js"></script>
	</head>

	<body>
		<!-- Back button -->
		<input id="backBtn" type="button" class="btn" value="Back to Main Menu" />
	
		<%
		DAO dao = new DAO();
		String bookName = dao.ofy().get(new Key<Resource>(Resource.class, Long.parseLong(request.getParameter("r")))).title;
		%>
	
		<center>
			<img class="titlepic inline" src="/images/book.png"/>
			<h1 class="title inline">Resource: <%= bookName %></h1>
		</center>
		<hr>
		<div id="chapterContainer">
		</div>
		
	</body>

</html>