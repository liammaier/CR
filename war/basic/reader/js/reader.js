CR = {};

CR.events = _.extend({},Backbone.Events);
CR.options = $({});

/* 
 **************************************	 
 ***********Global VARS****************
 **************************************
 */
CR.readerView = null;
CR.sections = null;
CR.notes = [];
CR.listTitles = [];
CR.highlights = [];
CR.heatMapHighlights = [];
CR.sectionSummaries = [];
CR.logList = [];
CR.pagesRead = [];
CR.sectionsRead = [];
CR.startTime = new Date().getTime();

CR.highlightFilter = "all";
CR.arrow = null;
CR.curPage = 0;
CR.curSection = 0;
CR.curNotebookSection = 0;
CR.curStrategy = "newsession";
CR.multimediaStratDataModel = null;
CR.pageOffsets = {};
CR.sectionOffsets = {};
CR.recalculateOffsets = true;
CR.libID = 0;
CR.contentID = 0;
CR.lastReviewTrigger = -1;
CR.pagegoal = 0;

// 4 = time-left
// 3 = total-time
// 2 = modal
// 1 = temp
CR.reminderQueue = PriorityQueue();
CR.showingReminder = false;

//Types of notes to get from the server
CR.noteTypes = ['Section Summary', 'Notes'];

CR.isIOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
CR.isAndroid = ( navigator.userAgent.toLowerCase().match(/(android)/g) ? true : false );
CR.isMobile = (CR.isIOS || CR.isAndroid);

// off-line highlighting variables
CR.offlineHL = false;  // whether to store highlight offline
CR.hLRemoveDone = false;
CR.hLUploadDone = false;

/**
 **************************************			
 **************************************	 
 **************************************	 
 ************Functions*****************
 **************************************	 
 **************************************
 **************************************	 
**/

/************Init Functions************/
//when data is loaded call finish init to start loading the rest of the reader
CR.init = $(document).ready(function() {// Catch touchevents on dont_scroll-objects
	// TO-DO: add something to check mobile
	// prevent bouncing in iOS safari
	if (CR.isIOS){
		document.addEventListener("touchmove", function(event){
			/**Iterates through all the target's parents and set prevent to false 
			 * if any of the scrollable elements match
			 */
			var target = event.target;
	
	
			// get all the scrollables
			var contentContainer = $('#contentContainer')[0];
			var tocScroll = $('#toc-scroll')[0];
			var rightNoteArea = $('#rightNotebookArea')[0];
			var notebookTOC = $('#notebookTOC')[0];
			var mainContainer = $('#mainContainer')[0];
			var highlightPopupText = $('#highlightPopupText')[0];
			var dictbodyinner = $('#dict-bodyinner')[0];
			var highpopbodyinner = $('#highpop-bodyinner')[0];
			
			// check whether the target is a scrollables
			if (target == contentContainer || target == tocScroll || target == rightNoteArea || target == notebookTOC || target == highlightPopupText || target == dictbodyinner || target == highpopbodyinner || (target == mainContainer && CR.controllerView != null && CR.controllerView.inStartUp)){
				return;
			}
			
			// get all the ancestors of the event target
			var ancestors = $(event.target).parents();
			
			// traverse all the ancestors
			for (var i = 0; i < ancestors.length; i++){
				var curAncestor = ancestors[i];
	
				if (curAncestor == contentContainer || curAncestor == tocScroll || curAncestor == rightNoteArea || curAncestor == notebookTOC || curAncestor == highlightPopupText || curAncestor == dictbodyinner || curAncestor == highpopbodyinner || (curAncestor == mainContainer && CR.controllerView != null && CR.controllerView.inStartUp)){
					return
				}
			}
			
	
			event.preventDefault();
		});
		
		if (window.orientation == 90){
			$( "body" ).height();
			$( "body" ).css("padding-bottom", 20);
			window.scrollTo(0,0);
		}else{
			$( "body" ).height( "100%" );
			$( "body" ).css("padding-bottom", 0);
		}
		
		// iOS safari fix
		$( window ).on( "orientationchange", function( event ) {
			console.log(event)
			var $body = $('body');
			setTimeout(function () {
				if (window.orientation == 90){
					$( "body" ).height();
					$( "body" ).css("padding-bottom", 20);
					window.scrollTo(0,0);
				}else{
					$( "body" ).height( "100%" );
					$( "body" ).css("padding-bottom", 0);
				}
	        }, 250);
		});
	}

	//get the params passed to us
	CR.libID = CR.getURLParameter("lib");
	CR.contentID = CR.getURLParameter("c");

	CR.createUserbar(); // Top-right bar
	
	$(window).bind("beforeunload", function() { 
		CR.log("endsession", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "", "");
		CR.sendLogs();
		CR.sendUserProgress();
	});
	
	// Try to upload off-line highlights before getting the data from the server and set up the globals
	CR.checkOfflineHL();
	
});

// function to check local storage for highlight; when Done call initData when Done
CR.checkOfflineHL = function(){
	// upload list items
	CR.uploadOfflineList();
	
	// check whether there are highlights to upload
	if ((!localStorage.highlights || JSON.parse(localStorage["highlights"]).length == 0) && (!localStorage.highlightsRemove || JSON.parse(localStorage["highlightsRemove"]).length == 0)){
		CR.initData();
	}else{
		if (localStorage.highlights && JSON.parse(localStorage["highlights"]).length != 0){
			CR.uploadOfflineHL();
		}else{
			CR.hLUploadDone = true;
		}
		
		if (localStorage.highlightsRemove && JSON.parse(localStorage["highlightsRemove"]).length != 0){
			CR.destroyOfflineHL();
		}else{
			CR.hLRemoveDone = true;
		}
		
		if (CR.hLRemoveDone && CR.hLUploadDone){
			CR.initData();
		}
	}
};

CR.uploadOfflineList = function(){
	if (localStorage.lists){
		var lists = JSON.parse(localStorage["lists"]);
		localStorage["lists"] = JSON.stringify([]);
		
		for (var i = 0; i < lists.length; i++){
			var curList = new Note(lists[i].model);
			curList.save();
		}
	}
	
	if (localStorage.listsRemove){
		var lists = JSON.parse(localStorage["listsRemove"]);
		localStorage["listsRemove"] = JSON.stringify([]);
		
		for (var i = 0; i < lists.length; i++){
			var curList = new Note(lists[i]);
			curList.destroy();
		}
	}
};

CR.destroyOfflineHL = function(){
	var highlights = JSON.parse(localStorage["highlightsRemove"]);
	var highlightCount = highlights.length;
	var hlUpdateFail = new Array();
	var highlightDone = 0;

	if (highlightDone == highlightCount){
		CR.initData();
	}
	
	for (var i = 0; i < highlightCount; i++){
		var curHL = new Highlight(highlights[i]);
		
		curHL.destroy(
			// Prepare callback for when server returns ID
			{
			error: function(model, response){
				// put the highlight model index into the array to be removed next time
				hlUpdateFail.push(model);				
				highlightDone++;
				
				// when each of the highlights been destroyed(success or not), update the local storage
				if (highlightDone == highlightCount){
					CR.hLRemoveDone = true;
					localStorage["highlightsRemove"] = JSON.stringify(hlUpdateFail);
					if (CR.hLRemoveDone && CR.hLUploadDone){
						CR.initData();
					}
				}
				
			},
			success: function(model, response){
				highlightDone++;
				
				// when each of the highlights been destroyed(success or not), update the local storage
				if (highlightDone == highlightCount){
					CR.hLRemoveDone = true;
					localStorage["highlightsRemove"] = JSON.stringify(hlUpdateFail);
					if (CR.hLRemoveDone && CR.hLUploadDone){
						CR.initData();
					}
				}
			}
		});
	}
};

// function to upload each of the Highlight in the local storage
CR.uploadOfflineHL = function(){
	var highlights = JSON.parse(localStorage["highlights"]);
	var highlightCount = highlights.length;
	var hlUpdateFail = new Array();
	var indexLookup = new Array();
	var highlightDone = 0;

	if (highlightDone == highlightCount){
		CR.initData();
	}
	
	for (var i = 0; i < highlightCount; i++){
		var curHL = new Highlight(highlights[i].model);
		indexLookup[curHL.cid] = i;
		
		curHL.save(null, 
			// Prepare callback for when server returns ID
			{
			error: function(model, response){
				// put the highlight model index into the array to be removed next time
				hlUpdateFail.push({cid: null, model: model});				
				highlightDone++;
				
				// when each of the highlights been saved(success or not), update the local storage
				if (highlightDone == highlightCount){
					CR.hLUploadDone = true;
					localStorage["highlights"] = JSON.stringify(hlUpdateFail);
					if (CR.hLRemoveDone && CR.hLUploadDone){
						CR.initData();
					}
				}
				
			},
			success: function(model, response){
				highlightDone++;
				
				// when each of the highlights been saved(success or not), update the local storage
				if (highlightDone == highlightCount){
					CR.hLUploadDone = true;
					localStorage["highlights"] = JSON.stringify(hlUpdateFail);
					if (CR.hLRemoveDone && CR.hLUploadDone){
						CR.initData();
					}
				}
			}
		});
	}
};

//function for getting all of the data that we need.
CR.initData = function() {
	
	// DOWNLOAD THE CONTENT AND SECTIONS
	$.post("/getContentData",{contentID: CR.contentID}, function(data){
		var sections = data.sections;
		CR.content = data.content;
		CR.content.nextChapterId = data.nextChapterId;
		CR.sections = new SectionCollection(sections);
		CR.notebookSections = new SectionCollection(sections);
		
		// DOWNLOAD OPTIONS
		var that = this;
		CR.initOptions(function(){

			// INITIALIZE HIGHLIGHTS
			
			var highlightPopup = new HighlightPopupView({model: new Highlight()});
			var hLength = 0;
			var nLength = 0;
			CR.sections.each(function(section,index){
				//loop through the sections and get each bit of data
				
				hLength++;
				CR.initHighlights(index,function(){
					hLength--;
					if(hLength <= 0 && nLength <=0){
						finishInit();
					}
				});
				
				nLength++
				CR.initNotes(index,function(){
					nLength--;
					if(hLength <= 0 && nLength <= 0){
						finishInit();
					}
				});
				
				// TODO: put some condition here? do something at callback?
				if(CR.options.reviewheatmap){
					CR.initHeatMapHighlights(index,function(){
						}
					);
				}
			});
			
			function finishInit(){
				CR.initReminders(function(){
					// START EVERYTHING
					
					//init the controller view that will swap content in and out of the main container
					CR.controllerView = new ControllerView();
					
					//remove the temporary div
					$('#tempContainer').remove()
					
					//put the controller view into the body
					$("body").prepend(CR.controllerView.render().el);
					
					// scroll up the buttons so people can see them
					document.getElementById('startReadingBtn').scrollIntoViewIfNeeded();
				});
			}
		});
	});
};
CR.initReminders = function(callback) {
	
	// initialize reminders and display startsession reminders
	$.get("/getreminders", function(data){
		CR.reminders = data;
		CR.sessionTime = 30; // set default time
		
		callback();
	});

};
// initialize all highlights
CR.initHighlights = function(sectionNum ,callback){
	$.post('/getHighlights', {section: CR.sections.at(sectionNum).id, contentID:CR.contentID, libID:CR.libID}, function(data){
		CR.highlights[sectionNum] = new HighlightCollection(data.highlights);
		CR.highlights[sectionNum].sectionID = data.section;
		if(callback)callback();
	});
};

// TODO: initialzie all users highlights
CR.initHeatMapHighlights = function(sectionNum, callback){
	$.post('/getContentHighlights', {section: CR.sections.at(sectionNum).id, contentID:CR.contentID, libID:CR.libID}, function(data){
		
		if(CR.controllerView !== undefined && CR.controllerView.heatmapView !== undefined){
			//remove this section highlights
			CR.removeHeatMapHighlights(sectionNum);
			
			CR.heatMapHighlights[sectionNum] = new HighlightCollection(data.highlights);
			CR.heatMapHighlights[sectionNum].sectionID = data.section;
		
			CR.controllerView.heatmapView.placeHeatMapHighlights(sectionNum);
			
			// at the last paragraph, check if needs to move to next paragraph
			if (sectionNum == CR.heatMapHighlights.length-1){
				CR.controllerView.heatmapView.checkForNextParagraph();
			}
			
		//add all highlight
		}else{
		
			CR.heatMapHighlights[sectionNum] = new HighlightCollection(data.highlights);
			CR.heatMapHighlights[sectionNum].sectionID = data.section;
		}
		
		if(callback)callback();
	});
};

// TODO: remove all users highlights
CR.removeHeatMapHighlights = function(sectionNum){
	var heatMapHighlightCollection = CR.heatMapHighlights[sectionNum];
	
	if (CR.heatMapHighlights[sectionNum] === undefined){ return; }
	
	// remove all highlight in the collection
	heatMapHighlightCollection.each(function(highlight){ 
		highlight.removeHighlight();
	}, this);
};

//// initialzie all users highlights in all sections
//CR.initAllHeatMapHighlights = function(){
//	CR.sections.each(function(section,index){
//		CR.initHeatMapHighlights(index, function(){});
//	})
//}
//
//// remove all heatmap highlights
//CR.removeAllHeatMapHighlights = function(){
//	CR.sections.each(function(section,index){
//		CR.removeHeatMapHighlights(index);
//	})
//}



CR.initNotes = function(sectionNum,callback){
	var foundSummary = false;
	var foundListTitle = false;
	$.post('/getNotes', {section: CR.sections.at(sectionNum).id, contentID:CR.contentID, libID:CR.libID}, function(data){
		var notes = [];
		for(var i = 0; i < data.length; i++){
			if(data[i].type == "Section Summary"){
				foundSummary = true;
				CR.sectionSummaries[sectionNum] = new Note(data[i]);
			}else if(data[i].type == "List Title"){
				foundListTitle = true;
				CR.listTitles[sectionNum] = new Note(data[i]);
			}else{
				notes.push(data[i]);
			}
		}
		//add all of the notes for this section to the global collection
		var noteCollection = new NoteCollection(notes);
		noteCollection.sectionID = CR.sections.at(sectionNum).id;
		noteCollection.sectionNum = sectionNum;
		CR.notes[sectionNum] = noteCollection;
		
		//if we didn't find a summary add a new one
		if(foundSummary === false){
			CR.sectionSummaries[sectionNum] = new Note({type: "Section Summary", section: sectionNum, sectionID: CR.sections.at(sectionNum).id});
		}
		if(foundListTitle === false){
			CR.listTitles[sectionNum] = new Note({type: "List Title", section: sectionNum, sectionID: CR.sections.at(sectionNum).id});
		}
		if(callback)callback();
	});
};

//put all the options into the options object
CR.initOptions = function(callback){
	
	$.get("/getoptions", {libID:CR.libID, contentID: CR.contentID}, function(options) {
		for(var i = 0 ; i< options.length ; i++){
			var option = options[i];
			if(option.enabled === true) {
				CR.options.attr(option.name,option);
			}
		}
		CR.options = CR.options[0];
		
		callback();
	});
};
	
// gets the multimedia strategy
CR.getMultimediaStratDataModel = function() {
	return this.multimediaStratDataModel;
}

/************End of Init Functions************/

/************Other Functions************/
CR.adjustTimeNotificationDropdowns = function() {
	$("#timeNoteDropdown1").html("");
	$("#timeNoteDropdown2").html("");
	var min = Math.min(65, $("#readingTimeDropdown").val());
	for(var i = 5; i < min; i += 5){
		var newoption;
		if(i == 60) {
			newoption = "<option value='60'>at 1 hour left</option>";
		}else {
			newoption = "<option value='" + i + "'>at " + i + " minutes left</option>";
		}
		$("#timeNoteDropdown1").append(newoption);
		$("#timeNoteDropdown2").append(newoption);
	}
	$("#timeNoteDropdown2 option:eq(1)").attr('selected', true);
};

CR.getURLParameter = function(name) {
    return decodeURI((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
};

//sends log to the server
CR.log = function(type, strategy, contentKey, sectionKey, data1,data2){
	CR.logList[CR.logList.length] = {type: type, time: new Date().getTime(), strategy: strategy, contentKey: contentKey, sectionKey: sectionKey, data1: data1, data2: data2};
	//$.post("/log", {type: type, strategy: strategy, contentkey: contentKey, sectionkey: sectionKey, data1: data1, data2: data2})
};

CR.sendLogs = function(){
	$.post("/batchlog", {logs: JSON.stringify(CR.logList)}, function(){
		CR.logList = []; // clear it out
	});
};

//save user progress
CR.updateUserProgress = function(type, data){
	
	if (type === "page") {
		for (var i = 0; i < CR.pagesRead.length; i ++) {
			if (CR.pagesRead[i] == data){
				return;
			}
		} 
		CR.pagesRead[CR.pagesRead.length] = data;
	} else if (type === "section") {
		for (var j = 0; j < CR.sectionsRead.length; j ++) {
			if (CR.sectionsRead[j] == data){
				return;
			}
		} 
		CR.sectionsRead[CR.sectionsRead.length] = data;
	}
};

// WORKING ON TTS
CR.testLatency = function() {
	var time = new Date().getTime();
	
	$.get("/", function(){
		time = new Date().getTime() - time;
		
		if (time < 20){ // so low that it didn't even connect, means it failed
			if ($("#latency").attr("class") != "none") {
				CR.log("latencychange", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "none", "");
				$("#latency").attr("class", "none");
			}
		} else if (time < 1000) {
			if ($("#latency").attr("class") != "low")
				CR.log("latencychange", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "low", "");
			$("#latency").attr("class", "low");
			
		} else if (time > 2000) {
			if ($("#latency").attr("class") != "high")
				CR.log("latencychange", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "high", "");
			$("#latency").attr("class", "high");
			
		} else {
			if ($("#latency").attr("class") != "med")
				CR.log("latencychange", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "med", "");
			$("#latency").attr("class", "med");
		}
	});
	
	// test an outside server (google)
	$.Ping("https://www.google.com/").done(function (success, url, time, on) {
		if (time < 20 ) { // so low that it didn't even connect, means it failed
			if ($("#googlelatency").attr("class") != "none") {
				CR.log("googlelatencychange", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "none", "");
				$("#googlelatency").attr("class", "none");
			}

			console.log("DOESNT WORK FROM THE BEGINNING")
			tts.offline = true;
			
		} else if (time < 500) {
			if ($("#googlelatency").attr("class") != "low")
				CR.log("googlelatencychange", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "low", "");
			$("#googlelatency").attr("class", "low");

			tts.offline = false;
			tts.attempts = 0;
			
		} else if (time > 1000) {
			if ($("#googlelatency").attr("class") != "high")
				CR.log("googlelatencychange", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "high", "");
			$("#googlelatency").attr("class", "high");

			tts.offline = false;
			tts.attempts = 0;
			
		} else {
			if ($("#googlelatency").attr("class") != "med")
				CR.log("googlelatencychange", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "med", "");
			$("#googlelatency").attr("class", "med");

			tts.offline = false;
			tts.attempts = 0;
			
		}
	});
	

};

CR.sendUserProgress = function() {
	var time= new Date().getTime();
	$.post("/updateuserprogress", {strategy: CR.getCurrentStrategy(), pagesread: CR.pagesRead, sectionsread: CR.sectionsRead, contentkey: CR.contentID, timeread: time-CR.startTime});
};

CR.getCurrentStrategy = function(){
	return this.curStrategy;
};

CR.setCurrentStrategy = function(stratname){
	this.curStrategy = stratname;
};

CR.getCurrentSection = function(){
	return this.sections.at(this.curSection);
};

/**Functions for making the flashing arrow**/
CR.makeFlashingArrow = function(id){
	
	$("body").append("<img id='flashingArrow' src='/images/arrow.png'/>");
	console.log($("#flashingArrow").width());
	$("#flashingArrow").css("position", "fixed");
	$("#flashingArrow").css("z-index", "2222");
	$("#flashingArrow").css("left", $(id).offset().left - 50).css("top", $(id).offset().top -10 );
	CR.arrow = {"interval": setInterval(arrowTick, 650), "el": id};
};

CR.arrowTick = function(){
	if($("#flashingArrow").is(":visible")) {
		$("#flashingArrow").hide();
	}else {
		$("#flashingArrow").show();
	}
};

CR.removeFlashingArrow = function(){
	if(CR.arrow != null) {
		clearInterval(arrow.interval);
		$("#flashingArrow").remove();
		CR.arrow = null;
	}
};

CR.createUserbar = function(active) {
	
	// call the createuserbar in /shared/js/userbar.js
	createUserbar(); 
	
};

// ping function
$.extend($, {
	Ping: function Ping(url, timeout) {
		timeout = timeout || 1500;
		var timer = null;
 
		return $.Deferred(function deferred(defer) {
 
			var img = new Image();
			img.onload = function () { success("onload"); };
			img.onerror = function () { success("onerror"); };  // onerror is also success, because this means the domain/ip is found, only the image not;
			
			var start = new Date();
			img.src = url += ("?cache=" + start);
			
			timer = window.setTimeout(function timer() { fail(); }, timeout);
 
			function cleanup() {
				window.clearTimeout(timer);
				timer = img = null;
			}
 
			function success(on) {
				cleanup();
				defer.resolve(true, url, new Date() - start, on);
			}
 
			function fail() {
				cleanup();
				defer.reject(false, url, new Date() - start, "timeout");
			}
 
		}).promise();
	}
});


/************End of Other Functions************/

/**OLD LONGCLICK HIGHLIGHT CODE**/
//
//var longclick = false;
//$("#readerPanel").mouseup(function(){
//	//if there is a longclick delete 
//	if(longclick){
//		if(selectedHighlightId != null){
//			var sectionNum = $("[data-highlightgroup=" + selectedHighlightId + "]").parents("section:first").data("number");
//			var model = highlightsArray[sectionNum].get(selectedHighlightId);
//			if(model){
//				
//				sara.removeHighlightById(selectedHighlightId);
//				model.destroy();
//			}
//			
//			selectedHighlight = null;
//			selectedHighlightId = null;
//		}
//	
//	//if not a long-click pop the note-window or do tts, depending on flags
//	}else{
//		//if we are not in text to speech mode
//		if(tempHighlight == null) tempHighlight = sara.getModifiedRangeFromSelection();
//		if(tempHighlight == null){
//			if(!tts.selectMode){
//				
//			}
//		}
//	}
//	
//	clearTimeout(pressTimer);
//	
//// Set the highlight we clicked in case of a long click and set long click timer	
//}).mousedown(function(e){
//	
//	longclick = false;
//	selectedHighlight =  e.target;
//	
//	if($(selectedHighlight).data("highlightgroup")){
//		
//		selectedHighlightId = $(selectedHighlight).data("highlightgroup").toString();
//	}else{
//		selectedHighlightId = null;
//	}
//	
//	pressTimer = window.setTimeout(function() { longclick = true;},500);
//	
//	
//});
/**OLD LONGCLICK HIGHLIGHT CODE**/