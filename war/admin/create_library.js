$(document).ready(function() {
	var assignmentCount = 0;
	$('#addAssignment').click (function() {

		assignmentCount++;
		
		var template = "<br><h4>Assignment "+assignmentCount +"</h4><br>" +
						"Assignment Name:<input type='text' name='name"+assignmentCount+"' /> <br>"+
						"Assignment Description:<input type='text' name='description"+assignmentCount+"' /> <br>"+
						"Assignment Due Date:<input type='date' name='dueDate"+assignmentCount+"' /> <br>";  

		$('#createForm').children("#submit").before(template); 
		$(window).scrollTop($('#addAssignment').offset().top)
	});
});
