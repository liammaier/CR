<!DOCTYPE html>
<%@ page import="java.util.List"%>
<%@ page import="com.googlecode.objectify.Key"%>
<%@ page import="edu.uoregon.models.libraries.*"%>
<%@ page import= "edu.uoregon.models.DAO" %>
<html lang="en-US">

<head>
	<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css">
	<script src="/lib/jquery-1.7.2.min.js"></script>
	
	<title>Database</title>
	
	
</head>
<body>
	
	<form method="post" action="/admin/deletelibrary" style="margin-left: 20px;">

		<br>
		
		<select NAME = "library"> 
			<%
				DAO dao = new DAO();
				
				List<Library> libraries = dao.ofy().query(Library.class).list();

				for(Library library : libraries){
					%>
						<option value="<%=library.id %>"><%= library.name %></option>
					<% 
				}
			%>

		</select>
		
		<br>
		
		<input type="submit" value="Submit">
	</form>
	
</body>

</html>