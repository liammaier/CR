
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
		<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css">
		<script language="javascript" type="text/javascript" src="/lib/jquery-1.7.2.min.js"></script>
		<script language="javascript" type="text/javascript" src="/basic/js/welcome.js"></script>
		<script language="javascript" type="text/javascript" src="/lib/bootstrap/js/bootstrap.js"></script>
				
	</head>
	<body>
		<form action="/createUser" method="post" >
			Type : 
			<br><input type="radio" name="type" value="Blue">Blue<br>
					<input type="radio" name="type" value="Green" checked> Green<br>
					<input type="radio" name="type" value="Red"> Red<br><br>
					
					
			Nickname: <input type="text" name="nickname" /> <br><br>
			
			(We can add picture upload ect.) <br>
			<br>
			<input type="submit" class= "btn-success btn" value="Create User" />
		</form>
				
</body>
</html>