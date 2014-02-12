<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import= "edu.uoregon.models.DAO" %>
<%@ page import="com.googlecode.objectify.Key"%>
<%@ page import="edu.uoregon.models.*"%>
<%@ page import="edu.uoregon.models.libraries.*"%>
<%@ page import="java.util.Iterator"%>
<%@ page import="java.util.List"%>
<%@ page import="com.google.appengine.api.users.User" %>

<html>

	<head>
		<!-- Stylesheets -->
		<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css" />
		<link rel="stylesheet" type="text/css" href="/basic/css/main.css" />
		<link rel="stylesheet" type="text/css" href="/admin/notebookprinter.css" />

		<!-- Scripts -->
		<script src="/lib/jquery-1.7.2.min.js"></script>
		<script src="/lib/underscore-min.js"></script>
		<script src="/lib/backbone-min.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-dropdown.js"></script>
		
		<script src="/models/section-models.js"></script>
		<script src="/basic/js/views/section-views.js"></script>
		
		<script src="/basic/js/userbar.js"></script>
		<script src="/admin/notebookprinter.js"></script>
		
		<title>CampusReader - Notebook Printer</title>
		
	</head>

	<body>

		Select a user in the dropdown bar, then select the content you want to view their Notebook for. Click "Search" to create a printable version of the Notebook.
		<br><br>
			User: <select id="usernameDropdown" style="position: relative; top: 3px">
				<% 
				DAO dao = new DAO();
				List userList = dao.ofy().query(SaraUser.class).list();
				Iterator<SaraUser> it = userList.iterator();
				while(it.hasNext()){
					SaraUser user = (SaraUser) it.next();
					%>
					<option value="<%= user.email.getEmail() %>"><%= user.email.getEmail() %></option>
					<%
				}
				%>
			</select>
			&nbsp;&nbsp;&nbsp;
			Content: <select id="contentDropdown" style="position: relative; top: 3px">
				<% 
				List contentList = dao.ofy().query(Content.class).list();
				Iterator<Content> it2 = contentList.iterator();
				while(it2.hasNext()){
					Content content = (Content) it2.next();
					%>
					<option value="<%= content.id %>"><%= content.title %></option>
					<%
				}
				%>
			</select>
			&nbsp;&nbsp;&nbsp;
			<input type="button" id="searchBtn" class='btn' value="Search" style="position: relative; top: -2px"/>
		<br><br>
		
		<div id="notebook-text"></div>

	</body>

</html>