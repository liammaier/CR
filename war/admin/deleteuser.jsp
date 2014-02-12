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
	
	<form method="post" action="/admin/deleteuser" style="margin-left: 20px;">

		<br>
		
		<select NAME = "user"> 
			<%
				DAO dao = new DAO();
				
				List<SaraUser> users = dao.ofy().query(SaraUser.class).list();

				for(SaraUser user : users){
					%>
						<option value="<%=user.id %>"><%= user.name %></option>
					<% 
				}
			%>

		</select>
		
		<br>
		
		<input type="submit" value="Submit">
	</form>
	
</body>

</html>