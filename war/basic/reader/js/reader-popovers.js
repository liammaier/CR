
var inTutorial = false;

function initPopovers() {
	// Initialize the popovers
	$("#endReadingSessionBtn").popover({title: "End Reading Session", placement: "left", delay: {show: 900, hide: 10},
		content: "Ends your reading session, and brings you back to your library."});
	$("#notebookBtn").popover({title: "Your Notebook", placement: "top", delay: {show: 900, hide: 10},
		content: "Contains all of your highlights, and your notes for each section."});
	$("#gotoPageBtn").popover({title: "Change Page", placement: "top", delay: {show: 900, hide: 10},
		content: "Move to another page."});
	$("#TextToSpeechBtn").popover({title: "Speech", placement: "top", delay: {show: 900, hide: 10},
		content: "Hear a portion of the text spoken to you."});
	$("#starDraggable").popover({title: "Star", placement: "left", delay: {show: 900, hide: 10},
		content: "Drag the star over a note or highlight to star it."});
	$("#DeleteIcon").popover({title: "Delete", placement: "left", delay: {show: 900, hide: 10},
		content: "Drag the X over a note or highlight to delete it."});
	$(".writeSummaryBtn").popover({title: "Write a Section Summary", placement: "left", delay: {show: 900, hide: 10},
		content: "Opens your notebook, and brings you to the section summary for this section."});
	$(".reviewSectionNowBtn").popover({title: "Review Now", placement: "left", delay: {show: 900, hide: 10},
		content: "Brings you to the top of the section."});
	$(".continueReadingBtn").popover({title: "Continue Reading", placement: "left", delay: {show: 900, hide: 10},
		content: "Continue reading the document."});
}

function pause(ms) {
	ms += new Date().getTime();
	while (new Date() < ms){}
} 

function externalEvent(popover) {
	if(popover == "#notebookBtn"){
		toggleNotebook();
	}else if(popover == "#saveNotebookBtn"){
		toggleNotebook();
	}
}

function initTutPopovers() {
	// Popovers
	$("#CampusReader").popover({title: "CampusReader", placement: "bottom",
		content: 'CampusReader is designed to help you read more comprehensibly. To do this, each ' +
					'reading session is divided up into three main sections, called "strategies".<br><br>' +
					'<b>Click anywhere on the screen to continue. Press ESC to cancel the tutorial at any time.</b>'});
	$("#previewBar").popover({title: "Preview Strategies", placement: "right",
		content: 'Before you read, CampusReader has you run through some quick pre-reading exercises. ' +
					'These help you know what to expect from the reading.'});
	$("#readBar").popover({title: "Reading", placement: "bottom",
		content: "Next, you read the chapter, assisted by tools like the notebook. We'll talk more " +
					"about that in a second."});
	$("#reviewBar").popover({title: "Review Strategies", placement: "left",
		content: "Lastly, you close your reading session by reviewing your notes, and answering a " +
					"few helpful study questions."});
	$("#endReadingSessionBtn").popover({title: "End Reading Session", placement: "left",
		content: "If you want to finish your reading session early, click this button."});
	$("#readerToolbar").popover({title: "Tools", placement: "bottom",
		content: "Now that you know the basics, let's go over the CampusReader tools."});
	$("#TOC-title").popover({title: "Table of Contents", placement: "left",
		content: "For each book or article, there is a table of contents showing the major sections of the reading."});
	$("#TOC").popover({title: "Current Section", placement: "left",
		content: "You can click on these sections to scroll to them in the reader, and the current section stays highlighted " +
					"for you as your read."});
	$("#readerPanel").popover({title: "Notes and Highlights", placement: "right",
		content: "In addition, you can also highlight important text in the reader and annotate it, or just take " +
					"notes on a section. You interact with these note-taking tools through the Notebook."});
	$("#notebookBtn").popover({title: "Notebook", placement: "top",
		content: "You can access your notebook at any time by clicking this button, which brings up the Notebook window."});
	$("#notebookHeader").popover({title: "Notebook", placement: "bottom",
		content: "This is the notebook window, which shows you all of your notes and highlights."});
	$("#notebookColumn-TOC").popover({title: "Notebook", placement: "right",
		content: "When you open the notebook, it automatically opens to the section you are reading. Select a section " +
					"from the Section Headings to view your notes and highlights for that section."});
	$("#highlightsColumn").popover({title: "Highlights", placement: "right",
		content: "All of your highlights for the section appear here. Click them to see your annotation!"});
	$("#notesColumn").popover({title: "Notes", placement: "left",
		content: "This is where your notes are kept. Just start typing in a textbox and hit Enter to create a note!"});
	$("#sectionSummaryColumn").popover({title: "Section Summary", placement: "top",
		content: "Every section has room for a section summary, which you can use for review. Some strategies will " +
					"remind you to fill this out after you complete a section."});
	$("#starDraggable").popover({title: "Star", placement: "top",
		content: "Drag the star icon over a note or a highlight to mark it as important. Click that star on the note " +
					"to remove it."});
	$("#DeleteIcon").popover({title: "Delete", placement: "top",
		content: "Drag the delete icon over a note or a highlight to remove it. You can't undo this action, so be careful!"});
	$("#saveNotebookBtn").popover({title: "Section Summary", placement: "left",
		content: 'Click here to close the notebook when you are finished, or on the "X" in the top-right corner.'});
	$("#TextToSpeechBtn").popover({title: "Speech & Other Tools", placement: "bottom",
		content: 'Additional tools are available in the toolbar, such as text-to-speech, font-resizing, and page navigation.'});
	$("#progressBar").popover({title: "Thank you!", placement: "bottom",
		content: 'Thanks for using CampusReader! More help and walkthroughs are available on the home page.'});
	
}


function promptTutorial() {
	
	$("#Tutorial").modal({
		keyboard: false,
		backdrop: "static"
	});
	
	$("#acceptTutorial").click(function() {
		inTutorial = true;
	});
	
	$("#skipTutBtn").click(function() {
		$.post("/editUser", {type: "seenTutorial", value: "true"});
	});
	
	// All of our popovers for the tutorial
	var p = ["#CampusReader", "#previewBar", "#readBar", "#reviewBar", 
		"#endReadingSessionBtn", "#readerToolbar", "#TOC-title", "#TOC",
		"#readerPanel", "#notebookBtn", "#notebookHeader", "#notebookColumn-TOC",
		"#highlightsColumn", "#notesColumn", "#sectionSummaryColumn", "#starDraggable",
		"#DeleteIcon", "#saveNotebookBtn", "#TextToSpeechBtn", "#progressBar"];
	
	disableTutPopovers = function() {
		for(var i = 0; i < p.length; i++){
			$(p[i]).data("popover", null);
		}
	};
	
	$('#Tutorial').on('hidden', function() {
		if(inTutorial){
			initTutPopovers();
			// Starting tutorial
			$("#tutHiddenLayer").attr("hidden", false);
			$(p[0]).popover("show");
			var cur = 0;
			$("#tutHiddenLayer").click(function() {
				$(p[cur]).popover("hide");
				// Calls all events on what should happen when each popover closes
				externalEvent(p[cur]);
				
				if(cur == p.length - 1){
					// undo everything
					$("#tutHiddenLayer").attr("hidden", true);
					disableTutPopovers(); // Remove all the tutorial popovers
					initPopovers();
					inTutorial = false;
					// Set the user's seenTutorial to true
					$.post("/editUser", {type: "seenTutorial", value: "true"});
					return;
				}
				cur ++;
				$(p[cur]).popover("show");
			});
			
			$(document).keyup(function(e) {
				if (e.keyCode == 27) {
					$(p[cur]).popover("hide");
					cur = p.length - 1;
					$("#tutHiddenLayer").click();
				}
			});
			
		}else {
			initPopovers();
		}
	});
	
}