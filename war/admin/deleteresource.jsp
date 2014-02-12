<!DOCTYPE html>
<%@ page import="java.util.List"%>
<%@ page import="com.googlecode.objectify.Key"%>
<%@ page import="edu.uoregon.models.*"%>
<%@ page import= "edu.uoregon.models.DAO" %>
<html lang="en-US">

<head>
	<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css">
	<script src="/lib/jquery-1.7.2.min.js"></script>
	
	<title>Database</title>
	
	
</head>
<body>
	
	<form method="post" action="/admin/deleteresource" style="margin-left: 20px;">

		<br>
		
		<select NAME = "resource"> 
			<%
				DAO dao = new DAO();
				
				List<Resource> resources = dao.ofy().query(Resource.class).list();

				for(Resource resource : resources){
					%>
						<option value="<%=resource.id %>"><%= resource.title %></option>
					<% 
				}
			%>

		</select>
		
		<br>
		
		<input type="submit" value="Submit">
	</form>
	
</body>

</html>