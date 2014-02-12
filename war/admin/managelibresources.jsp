


<!DOCTYPE html>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.Iterator"%>
<%@ page import="java.util.List"%>
<%@ page import="java.util.ArrayList"%>
<%@ page import="edu.uoregon.models.*"%>
<%@ page import="edu.uoregon.models.libraries.*"%>
<%@ page import="edu.uoregon.servlets.SaraServlet"%>
<%@ page import="com.googlecode.objectify.Key"%>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import= "edu.uoregon.models.DAO" %>
<html lang="en-US">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css" />
		<link rel="stylesheet" type="text/css" href="/basic/menu/main.css" />
		<script src="/lib/jquery-1.7.2.min.js"></script>
		<script src="create_library.js"></script>
		
		<title>Manage Lib Resources</title>
	</head>
	<body>
		<h1>Manage Lib Resources</h1>
		<form id= "createForm" action="/admin/library" method="get" >
			
	    	
			
			<select NAME = "lib">          
			<%
				DAO dao = new DAO();
				SaraUser userS =SaraServlet.login(request,response);
				Key<SaraUser> userKey = SaraUser.getCurrentUserKey();

				List<Library> libraries = dao.ofy().query(Library.class).list();

				for(Library lib : libraries){
					%>
						<option value="<%=lib.id %>"><%= lib.name %></option>
					<% 
					
				}
			
			%>
			</select>
			<input id = "submit" type="submit" value="Manage" /><br><br>
			
		</form>
	</body>
</html>
