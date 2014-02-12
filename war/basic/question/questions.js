
// Current question from array
var curQ = 0;
var practicing = true;
var questionCollection;

var part3questions;
var part4questions;


$(document).ready(function() {
	$("#questionContainer").html("<i>loading...</i>");

	$.post("/getTestQuestions", {type: "contentURL", contentURL: "/contents/chazan/part3.html"}, function(data){
		part3questions = new QuestionCollection(data);
		
		$.post("/getTestQuestions", {type: "contentURL", contentURL: "/contents/chazan/part4.html"}, function(data2){
			part4questions = new QuestionCollection(data2);
			
			$("#questionContainer").html("<div class='well center'>" +
				 	"<div class='greentext'>Reading Comprehension Test</div>" +
				 	"<div class='donetext'>" +
				 		"Welcome to the reading comprehension test for CampusReader! This small " +
				 		"exercise will test what you just learned from the text.<br><br>" +
				 		"You will see a series of questions related to the document, shown one at a time. The answer " +
				 		'to these questions is either "True" or "False". The correct answer will <i>not</i> be shown after you ' +
				 		"answer each question.<br><br>" +
				 		"Let's start with some practice questions. You will be notified when the real test begins.<br><br>" +
				 		
				 		"<input type='button' id='part3btn' class='btn btn-large btn-primary' value='Start Part 3 Questions' onclick='startQuestions({set: \"part3\"})'/>" +
				 		"<input type='button' id='part4btn' class='btn btn-large btn-primary' value='Start Part 4 Questions' onclick='startQuestions({set: \"part4\"})'/>" +
				 	"</div>" +
				"</div>");
		});
	});
	
	
// Commented code gets the current document and automatically loads in the questions for that document.	

//	$.post("/getTestQuestions", {type: "contentID", contentId: getURLParameter("c")}, function(data){
//		if(data.length == 0){
//     		$("#questionContainer").html("<div class='well center'>" +
//				 	"<div class='greentext'>No questions</div>" +
//				 	"<div class='donetext'>There are currently no test questions available for this document.</div>" +
//				 "</div>");
//     	}else {
//     		questionCollection = new QuestionCollection(data);
//     		$("#questionContainer").html("<div class='well center'>" +
//				 	"<div class='greentext'>Reading Comprehension Test</div>" +
//				 	"<div class='donetext'>" +
//				 		"Welcome to the reading comprehension test for CampusReader! This small " +
//				 		"exercise will test what you just learned from the text.<br><br>" +
//				 		"You will see a series of questions related to the document, shown one at a time. The answer " +
//				 		'to these questions is either "True" or "False". The correct answer will <i>not</i> be shown after you ' +
//				 		"answer each question.<br><br>" +
//				 		"Let's start with some practice questions. You will be notified when the real test begins.<br><br>" +
//				 		
//				 		"<input type='button' class='btn btn-large btn-primary' value='Start Practice Questions' onclick='fadeToQuestion()'/>" +
//				 	"</div>" +
//				"</div>");
//     	}
//	});
	
	
});


var getURLParameter = function(name) {
    return decodeURI((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

var startQuestions = function(opt){
	if(opt.set == "part3") {
		questionCollection = part3questions;
	}else if(opt.set == "part4"){
		questionCollection = part4questions;
	}
	fadeToQuestion();
}

var fadeToQuestion = function() {
	$(".well").fadeOut("fast", function() {
		loadNextQuestion();
	});
}

var loadNextQuestion = function() {
	if(practicing && questionCollection.at(curQ).get("practice") == false){
		practicing = false;
		curQ --;
		$("#questionContainer").html("<div class='well center'>" +
			 	"<div class='greentext'>Practice done</div>" +
			 	"<div class='donetext'>You have finished all of the practice questions. Click the button below " +
			 	"to begin the reading test.</div><br><br>" +
			 	"<input type='button' class='btn btn-large btn-primary' value='Start Reading Test' onclick='fadeToQuestion()'/>" +
			 "</div>");
		$("#questionContainer").hide();
		$("#questionContainer").fadeIn("fast");
	}else {
		if(curQ < questionCollection.length){
			var questionView = new QuestionView({ model: questionCollection.at(curQ) });
			questionView.render().$el.hide();
			$("#questionContainer").html(questionView.el);
			questionView.$el.fadeIn("fast");
		}else {
			// Done with the survey
			$("#questionContainer").hide();
			$("#questionContainer").html("<div class='well center'>" +
										 	"<div class='greentext'>Done!</div>" +
										 	"<div class='donetext'>Thank you for taking the reading test. The page will automatically refresh in <b id='timer'>10</b> seconds.</div>" +
										 "</div>");
			$("#questionContainer").fadeIn("fast");
			setInterval("timerTick()", 1000);
		}
	}
	curQ ++;
	
}

var timerTick = function() {
	if($("#timer").text() > 0){
		$("#timer").text($("#timer").text() - 1);
	}
	if($("#timer").text() == 0){
		document.location.reload(true);
	}
}

