$(document).ready(function() {
	var assignmentCount = 1;
	$('#addQuestions').click (function() {

		
		
		var template = '<br><br>\
			Question: <input type="text" name="question'+assignmentCount+'" /> <br>\
			Answer:\
			<input type="radio" name="answer'+ assignmentCount +'" value="true" checked> True\
			<input type="radio" name="answer'+ assignmentCount +'" value="false"> False\
			<br>\
			<br>\
			Is this a practice question?\
			<input type="radio" name="practice'+ assignmentCount +'" value="false"checked> No\
			<input type="radio" name="practice'+ assignmentCount +'" value="true"> Yes\
			<br><br>';  
		
		assignmentCount++;
		$('#createForm').children("#submit").before(template); 
		$(window).scrollTop($('#addAssignment').offset().top)
	});
});
