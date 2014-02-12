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
	
	<form method="post" action="/admin/clearselected" style="margin-left: 20px;">
		<input type="checkbox" name="classnames" value="saralog"> saralog <br>
		<input type="checkbox" name="classnames" value="library"> library <br>
		<input type="checkbox" name="classnames" value="highlight"> highlight <br>
		<input type="checkbox" name="classnames" value="content"> content<br>
		<input type="checkbox" name="classnames" value="note"> note<br>
		<input type="checkbox" name="classnames" value="option"> option <br>
		<input type="checkbox" name="classnames" value="resource"> resource <br>
		<input type="checkbox" name="classnames" value="sarauser"> sarauser <br>
		<input type="checkbox" name="classnames" value="section"> section <br>
		<input type="checkbox" name="classnames" value="stratdata"> stratdata <br>
		<input type="checkbox" name="classnames" value="strategy"> strategy <br>
		<input type="checkbox" name="classnames" value="usercontentprogress"> usercontentprogress <br>
		<input type="checkbox" name="classnames" value="userlibraryrole"> userlibraryrole <br>
		
		<br>
		
		<select NAME = "user"> 
			<option value="all">All users</option>
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