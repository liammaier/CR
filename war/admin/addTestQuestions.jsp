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
		<link rel="stylesheet" type="text/css" href="/basic/css/main.css" />
		<script src="/lib/jquery-1.7.2.min.js"></script>
		<script src="/admin/addTestQuestions.js"></script>
		
		<title>Add Test Question</title>
	</head>
	<body>
		Add test questions and answers to document<br><br>
		<form id ="createForm" action="/admin/add_question" method="post" >
			<%
				DAO dao = new DAO();
				SaraUser userS = SaraServlet.login(request,response);
				Key<SaraUser> userKey = SaraUser.getCurrentUserKey();
			%><select name="contentId"><%

			List<Content> contents = dao.ofy().query(Content.class).list();
			for(Content content :contents){
				%><option value ='<%=content.id %>'>
				<%=content.title%>
				</option><%
			}
			%>
			</select>
			<br>
			Question: <input type="text" name="question0" /> 
			<br>
			Answer:			
			<input type="radio" name="answer0" value="true" checked> True
			<input type="radio" name="answer0" value="false"> False
			<br>
			<br>
			Is this a practice question?		
			<input type="radio" name="practice0" value="false"checked> No
			<input type="radio" name="practice0" value="true"> Yes
			<br>
			<br>
			<input id = "submit" type="submit" value="Submit questions" />
			<br><br>
			<input type="button" id= "addQuestions" class="btn" value ="Add More Questions"> <br><br>
		</form>
	</body>
</html>
