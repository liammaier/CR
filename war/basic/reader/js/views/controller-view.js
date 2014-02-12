var ControllerView = Backbone.View.extend({
	tagName: "div",
	id: "mainContainer",
	justHighlighted : false,
	inNoteBookReview : false,
	longclick : false,
	inStartUp: true,
	highlightsRendered: false,
	heatmapHighlightsRendered: false,
	showHighlights: true,
	prevSectionNum: 0,
	readerView: null,
	previewSectionsView: null,
	reviewSummariesView: null,
	reviewMultimediaView: null,
	previewFiguresView: null,
	heatmapView: null,
	inHighlightMode: false,
	
	events: {
		"click #glossaryBtn" : "openGlossary",
		"keyup #gotoPageInput" : "goToPage",
		"click #gotoPageBtn" : "goToPage",
		"click #TextToSpeechBtn" : function(){ if (CR.isMobile){ return }else{ this.startTTS(); }},
		"touchstart #TextToSpeechBtn" :  "startTTS",
		"click #endReadingSessionBtn" : function(){ if (CR.isMobile){ return }else{ this.endSession(); }},
		"touchstart #endReadingSessionBtn" :  "endSession",
		"click #HighlightModeBtn" : function(){ if (CR.isMobile){ return }else{ this.toggleHighlightMode(); }},
		"touchstart #HighlightModeBtn" :  "toggleHighlightMode",
		
		"click #previewSectionsBtn" : "clickPreviewSectionBtn",
		"click #previewFiguresBtn" : "clickPreviewFiguresBtn",
		"click #reviewSummariesBtn" : "clickReviewSummariesBtn",
		"click #reviewMediaBtn" : "clickReviewMediaBtn",
		"click #heatmapBtn" : "clickHeatmapBtn",
		"click #readBar" : "clickReadBar",
		
		"click #showHighlights" : "showHighlights",
		"click #fadeHighlights" : "fadeHighlights",
		"click #showImportantHighlights" : "showImportantHighlights",
		"click #showConfusingHighlights" : "showConfusingHighlights",
		"click #showDetailHighlights" : "showDetailHighlights",

		
		"click #reviewNotebookBtn" : "clickReviewNotebookBtn",
		"click #reviewSupernotebookBtn" : "clickReviewSupernotebookBtn",
		
		"click #heatMapNext" : function(){ this.cancelHeatmapHighlight(); this.heatmapView.nextParagraph() },
		"click #heatMapAccept" : function(){ this.hideHeatmapButtons(); this.heatmapView.apply(); },
		"click #heatMapCancel" : "cancelHeatmapHighlight",
	},

	initialize: function(){
		//used for the startup screen
		this.startUpView = new StartUpView();
		
		// Give the top nav bar back button its function
		$("#backMenuBtn").click(function() {
			window.location = "/menu";
		});
		
		//put the font size into the bottom left when we render
		this.fontsizeView = new FontsizeView();
		
		//add the toc into the sidebar
		this.toc = new SectionCollectionView({collection:CR.sections});
		
		//set the current page to the first one we find in the HTML
		this.$pageInput = $("#gotoPageInput");
		this.$pageInput.val($(".pagebreak span:first").html());
		
		// get the strat data and initiliaze the strategies
		that = this;
		$.get("/getstratdata", {contentid: CR.contentID}, function(data) {
			that.readerView = new ReaderView();
			that.previewSectionsView = new PreviewSectionsView({model: new StratData(data["preview-sections"])});
			that.reviewSummariesView = new ReviewSummariesView({model: new StratData(data["review-summaries"])});
			that.reviewMultimediaView = new ReviewMultimediaView({model: new StratData(data["review-multimedia"])});
			that.previewFiguresView = new PreviewFiguresView({model: new StratData(data["preview-figures"])});
			// TODO: make data for this heatmap model
			that.heatmapView = new HeatmapView({model: new StratData(data["preview-figures"])});
		});
		
		CR.events.bind("SectionHasChanged", this.sectionChanged, this);
		CR.events.bind("scrollIntoSection", this.scrollIntoSection, this);
		
		CR.events.bind("toggleHighlightDone", this.setHighlightModeOff, this);
		
		// show the buttons for highlighting in heatmap view
		CR.events.bind("showHeatmapHLBtn", this.showHeatmapHLBtn, this);
			
		//when we want to start reading set the flag to false and swap in the first preview view
		CR.events.bind("startReading",function() {
			console.log("Start Reading event being processed!");
			
			// Hide the back button
			$("#backMenuBtn").hide();
			
			//this causes the render function to render the reader instead of the session startup page
			this.inStartUp = false;

			// render
			this.render();
			
			this.updateMenuPercentComplete();

			// Set up all the reminders
			this.initializeReminders(this);
			
			// start the correct view
			if (CR.options.previewsections)
				this.setContent("preview-sections");
			else if (CR.options.previewfigures)
				this.setContent("preview-figures");
			else 
				this.setContent("read");
			
			//make bottom tools hidden initially
			$("#middleBarDiv").hide();
			$("#pageNavDiv").hide();
			$("#fontNavDiv").hide();
			
			// Disable TTS if not possible on this browser
			if (Modernizr.audio.mp3 == false || Modernizr.audio.mp3 == '') {
				$("#TextToSpeechBtn").removeClass("btn-success");
				$("#TextToSpeechBtn").attr("disabled", true);
				$("#TextToSpeechBtn").attr("title", "This browser does not suppport Text to Speech");
			}
			
			// show the users's latency. and update every 30000 miliseconds
			CR.testLatency();
			setInterval(CR.testLatency, 1000 * 30);
			$(".latency").click(CR.testLatency);
			
			// Scroll to section if in url
			if (CR.getURLParameter("s") != null) {
				this.setContent("read");
				CR.events.trigger("changeTheSection", CR.getURLParameter("s"));
			}
			// change strategy if in url
			if (CR.getURLParameter("st") != null) {
				this.setContent(CR.getURLParameter("st"));
			}
			
			
			CR.events.trigger("readerLoaded");
		},this);
	},
	
	template: _.template('\
		<div id="readerPanelContainer">\
			<div id="contentContainer"></div>\
			<div id="rightReaderColumn" class="readerColumn">\
				<div id="scrollPopupBar"></div>\
				<div id="sidebar">\
					<div class="tabbable">\
					  <ul class="nav nav-tabs">\
					    <li class="active"><a href="#reminderContainer" data-toggle="tab">Reminders</a></li>\
					  </ul>\
					  <div class="tab-content">\
						<div id="reminderContainer" class="tab-pane active sidebar-container">\
							<div id="reminderHolder" class="rightScrollbar sidebar-scroll">\
							</div>\
						</div>\
					  </div>\
					</div>\
				</div>\
			</div>\
		</div>\
		<ul id="progressBar">\
			<li id="previewBar" class="progBar dropdown">\
				<div id="previewBarButton" href="#" role="button" class="dropdown-toggle" data-toggle="dropdown">Preview</div>\
				<ul class="dropdown-menu" role="menu" aria-labelledby="drop1">\
					<div id="previewSectionsBtn" class="strat-btn">\
						<span class="strat-title">Preview Sections</span>\
						<div class="strat-percent-box"> <span class="strat-percent"></span>	</div>\
					</div>\
					<div id="previewFiguresBtn" class="strat-btn">\
						<span class="strat-title">Skim Figures</span>\
						<div class="strat-percent-box"> <span class="strat-percent"></span>	</div>\
					</div>\
				</ul>\
			</li>\
			<li id="readBar" class="progBar dropdown">\
				<div id="readBarButton"> Read </div>\
				<div id="readCaretBtn" class=" dropdown-toggle" data-toggle="dropdown" href="#"><span class="caret"></span></div>\
				<ul id="readDropdown" class="dropdown-menu pull-right">\
					<li id="showHighlights">\
						<a href="#">Show all highlights</a>\
					</li>\
					<li id="fadeHighlights">\
						<a href="#">Hide all highlights</a>\
					</li>\
					<li id="showImportantHighlights">\
						<a href="#">Show only important points</a>\
					</li>\
					<li id="showConfusingHighlights">\
						<a href="#">Show only confusing concepts</a>\
					</li>\
					<li id="showDetailHighlights">\
						<a href="#">Show only details to remember</a>\
					</li>\
				</ul>\
			</li>\
			<li id="reviewBar" class="progBar dropdown">\
				<div id="reviewBarButton" href="#" role="button" class="dropdown-toggle" data-toggle="dropdown">Review</div>\
				<ul class="dropdown-menu" role="menu" aria-labelledby="drop1">\
					<div id="reviewNotebookBtn" class="strat-btn"> Review my highlights from this reading</div>\
					<div id="reviewSupernotebookBtn" class="strat-btn"> Use SuperNotebook to review across readings </div>\
					<div id="reviewSummariesBtn" class="strat-btn">\
						<span class="strat-title">Quiz myself on summaries from this reading</span>\
						<div class="strat-percent-box"> <span class="strat-percent"></span>	</div>\
					</div>\
					<div id="reviewMediaBtn" class="strat-btn hidden">\
						<span class="strat-title"> Review Saved Multimedia</span>\
						<div class="strat-percent-box"> <span class="strat-percent"></span>	</div>\
					</div>\
					<div id="heatmapBtn" class="strat-btn">\
						Important points finder\
					</div>\
				</ul>\
			</li>\
		</ul>\
		<div id="bottomNavbar">\
			<div id="middleBarDiv">\
				<div class="btn-group">\
					<!--input id="glossaryBtn" type="button" class="btn btn-medium btn-primary" value="Glossary"/-->\
					<% if( !CR.isMobile ) { %>\
						<button id="TextToSpeechBtn" type="button" class="btn btn-medium btn-success">Start Text-To-Speech</button>\
					<% }else{ %>\
						<button id="TextToSpeechBtn" type="button" class="btn btn-medium btn-success">Start Text-To-Speech</button>\
		   	 		<% } %>\
					<% if( CR.isMobile ) {  %>\
						<button id="HighlightModeBtn" type="button" class="btn btn-medium btn-success">Start Highlighting</button>\
			 		<% } %>\
				</div>\
			</div>\
			<div id="heatmapBarDiv">\
				<% if( !CR.isMobile ) { %>\
					<input id="heatMapNext" type="button" class="btn btn-medium btn-success" value="Skip"/>\
					<input id="heatMapAccept" type="button" class="btn btn-medium btn-success" style="display: none;" value="Accept"/>\
					<input id="heatMapCancel" type="button" class="btn btn-medium btn-success" style="display: none;" value="Cancel"/>\
				<% }else{ %>\
					<input id="heatMapNext" type="button" class="btn btn-medium btn-success" value="Skip"/>\
					<input id="heatMapAccept" type="button" class="btn btn-medium btn-success" style="display: none;" value="Accept"/>\
					<input id="heatMapCancel" type="button" class="btn btn-medium btn-success" style="display: none;" value="Cancel"/>\
		 		<% } %>\
			</div>\
			<div class="hugright" style="position: absolute; right: -24%; padding-top: 6;">\
			<div id="pageNavDiv">\
				Page: <input id="gotoPageInput" type="text"/>\
				<input id="gotoPageBtn" type="button" class="btn" value="Go"/>\
			</div>\
				<!--input id="HelpBtn" type="button" class="btn btn-large" value="Help"/-->\
				<input id="endReadingSessionBtn" type="button" class="btn btn-primary btn-medium" value="End Reading Session"/>\
				<span id="latency" class="latency">&nbsp;&nbsp;&nbsp;&nbsp;</span>\
				<span id="googlelatency" class="latency">&nbsp;&nbsp;&nbsp;&nbsp;</span>\
			</div>\
		</div>\
		<div id="end-session-modal" class="modal fade hide">\
			<div class="modal-header"> <h2>End Session</h2></div>\
			<div class="modal-body">\
				<p>Your goal was to read <strong><%=CR.pagegoal %> pages in <%=CR.sessionTime %> minutes</strong>. You read <strong><span id="end-session-pages"></span> in <span id="end-session-minutes"></span> minutes</strong>.</p>\
				<p>How did your session go?</p>\
				<p>&nbsp;&nbsp;&nbsp;Rate your goal: &nbsp;\
					<select id="end-session-rate-goal">\
						<option value="none">Choose one</option>\
						<option value="ambitious">Too ambitious</option>\
						<option value="just-right">Just right</option>\
						<option value="easy">Too easy</option>\
					</select>\
				</p>\
				<p>&nbsp;&nbsp;&nbsp;Rate your concentration: &nbsp;\
					<select id="end-session-rate-concentration">\
						<option value="none">Choose one</option>\
						<option value="good">Good</option>\
						<option value="mixed">Mixed</option>\
						<option value="poor">Poor</option>\
					</select>\
				</p>\
				<p>Write any reminders you want for next time.</p>\
				<textarea style="width:100%;" id="end-session-note"></textarea>\
			</div>\
			<div class="modal-footer">\
				<a id="end-session-nextchapter" href="" class="btn btn-primary btn-large" > Start Reading Next Chapter</a>\
				<a id="end-session-menu" href="/menu" class="btn btn-primary btn-large"> Main Menu</a>\
				<input id="end-session-keepreading" data-dismiss="modal" type="button" class="btn btn-success btn-large" value="Continue Reading Current Chapter">\
				<a id="end-session-logout" href="/logout" class="btn btn-danger btn-large" > Logout</a>\
			</div>\
		</div>\
	'),
	
	//when a page is entered into the page selector
	goToPage: function(e) {
		if( (e.keyCode == 13 || e.keyCode == null) && $("#gotoPageInput").val() != ""){
			// WE ACCEPT ROMAN NUMERALS! :)
			//$("#gotoPageInput").val($("#gotoPageInput").val().replace(/[^\d]/g, ""));
			if($("#gotoPageInput").val() == ""){
				$("#gotoPageInput").val("0");
			}
			
			var page = $("#gotoPageInput").val();
			// log("Click","Go To Page "+page);
			CR.events.trigger("goToPage", page);
		}
	},
	
	renderReaderView: function(){
		// special things need to happen if it's read
		
		view = this.readerView;
		
	    // prepare the view to be rendered
		this.contentView = view.render();
		this.contentView.delegateEvents();
		
		//put the given view into the html
		var $content = $(this.$el.find("#contentContainer"));
		$content.html(this.contentView.el);				
		
		// start the clock for review popup if it hasn't been started already
        if(CR.lastReviewTrigger == -1){
            CR.lastReviewTrigger = new Date();
	    }  
	
		// highlight all highlights, if they are enabled
        // TODO: check options
		if(CR.options.reviewheatmap && !this.highlightsRendered){
			for(var i = 0; i < CR.sections.length; i++){
				for(var j = 0; j < CR.highlights[i].length; j++){
					CR.highlights[i].at(j).showHighlight();
				}
			}
			this.highlightsRendered = true;
		}
	},
	
	setContent: function(stratname) {
		// if it is not heatmap, trigger the heatmap to remove highlight
		if (stratname != "heatmap") {
			CR.events.trigger("removeHeatmapHL");
		}
		
		// remove old view
		if(this.contentView != null){
			this.contentView.remove();
			this.contentView.unbind();
		}

		// remove previous active
		$(".progBar").removeClass("active");

		// hide the bottom reader menus
		$("#middleBarDiv").hide();
		$("#pageNavDiv").hide();
		$("#fontNavDiv").hide();
		
		// hide the botton heatmap menus
		$("#heatmapBarDiv").hide();

		// find new view
		var view = null;
		if (stratname === "read") {
			// special things need to happen if it's read
			this.renderReaderView();
			
			// set the read bar to be active
			$("#readBar").addClass("active");
			$("#middleBarDiv").show();
			$("#pageNavDiv").show();
			$("#fontNavDiv").show();
			
			// start the clock for review popup if it hasn't been started already
            if(CR.lastReviewTrigger == -1){
                CR.lastReviewTrigger = new Date();
		    }  
		
			// highlight all highlights
			if(this.showHighlights && !this.highlightsRendered){
				for(var i = 0; i < CR.sections.length; i++){
					for(var j = 0; j < CR.highlights[i].length; j++){
						CR.highlights[i].at(j).showHighlight();
					}
				}
				this.highlightsRendered = true;
			}
			
		} else {			
			// if it's not read			
			if (stratname == "preview-sections") {
				view = this.previewSectionsView;
				$("#previewBar").addClass("active");
			} else if (stratname == "review-summaries") {
				view = this.reviewSummariesView;
				$("#reviewBar").addClass("active");
			} else if (stratname == "review-media") {
				view = this.reviewMultimediaView;
				$("#reviewBar").addClass("active");
			} else if (stratname == "preview-figures") {
				view = this.previewFiguresView;
				$("#previewBar").addClass("active");
			} else if (stratname == "heatmap") {
				// TODO: put highlight in heatmap
				
				view = this.heatmapView;
				$("#reviewBar").addClass("active");
				
				// highlight all highlights, if they are enabled
				// TODO: check options
				if(CR.options.reviewheatmap && !this.heatmapHighlightsRendered){
					for(var i = 0; i < CR.sections.length; i++){
						for(var j = 0; j < CR.heatMapHighlights[i].length; j++){
							CR.heatMapHighlights[i].at(j).placeHeatmapHighlightSpans(false, "#heatmapUsersContentContainer");
						}
					}
					this.heatmapHighlightsRendered = true;
				}

				//render reader view
				this.renderReaderView();

				$("#heatmapBarDiv").show();
			} else {
				// TODO: Error
				console.error('no view name found')
			}
			
			// prepare the view to be rendered
			this.contentView = view.render();
			this.contentView.delegateEvents();
			
			//put the given view into the html
			var $content = $(this.$el.find("#contentContainer"));
			$content.html(this.contentView.el);	
		
		}
		
		// trigger everything else related to the vew changing
		CR.events.trigger("strategyChanged", stratname);
		CR.setCurrentStrategy(stratname);
		CR.log("changestrat", stratname, CR.contentID, CR.getCurrentSection().id, CR.getCurrentStrategy() , "");
		
	},
	// Clicking the Navigation Menu
	clickPreviewSectionBtn: function() {
		this.setContent("preview-sections");
	},
	clickReviewSummariesBtn: function() {
		this.setContent("review-summaries")
	},
	clickHeatmapBtn: function(){
		this.setContent("heatmap");
	},
	clickReviewMediaBtn: function() {
		this.setContent("review-media");
	},
	clickPreviewFiguresBtn: function() {
		this.setContent("preview-figures");
	},
	clickReadBar: function() {
		this.setContent("read");
	},
	clickReviewNotebookBtn: function() {
		CR.events.trigger("openNotebook");
	},
	clickReviewSupernotebookBtn: function() {
		var r=confirm("You are about to leave this page. Continue?");
		if (r==true){
			window.location.href = '/supernotebook';
		}
	},
	
	/* heatmap functions */	
	// hide accept and cancel buttons
	hideHeatmapButtons: function(){
		this.$el.find('#heatMapAccept').hide();
		this.$el.find('#heatMapCancel').hide();
	},
	
	// show the buttons for highlighting in heatmap view
	showHeatmapHLBtn: function(){
		this.$el.find('#heatMapAccept').show();
		this.$el.find('#heatMapCancel').show();
	},
	
	cancelHeatmapHighlight: function(){
		this.hideHeatmapButtons();
		this.heatmapView.cancel();
	},
	/* end heatmap functions */
	
	fadeHighlights: function() {
		// fade all highlights
		for(var i = 0; i < CR.sections.length; i++){
			for(var j = 0; j < CR.highlights[i].length; j++){
				CR.highlights[i].at(j).fadeHighlight();
			}
		}
		CR.highlightFilter = "fade";
	},
	showHighlights: function() {
		// highlight all highlights
		for(var i = 0; i < CR.sections.length; i++){
			for(var j = 0; j < CR.highlights[i].length; j++){
				CR.highlights[i].at(j).highlight(); 
			}
		}
		CR.highlightFilter = "all";
	},
	
	showImportantHighlights: function () {
		this.showHighlightsByType("main");
	},
	showConfusingHighlights: function () {
		this.showHighlightsByType("question");
	},
	showDetailHighlights: function () {
		this.showHighlightsByType("supporting");
	},
	
	showHighlightsByType: function(type) {
		// show all of them first in case it's partially faded
		this.showHighlights();
		// hide it if its not important ('main')
		var highlight = null;
		for(var i = 0; i < CR.sections.length; i++){
			for(var j = 0; j < CR.highlights[i].length; j++){
				highlight =CR.highlights[i].at(j); 
				if (highlight.get("type") != type)
					CR.highlights[i].at(j).fadeHighlight();
			}
		}
		CR.highlightFilter = type;
	},

	// Glossary button will open a popup window to display the keywords in the document
	openGlossary: function() {
		window.open("/b/glossary?c=" + CR.contentID, "_blank", "width=150, height=300, toolbar=no");
	},

	startTTS: function() {
		tts.toggleTTS();
	},
	
	endSession: function(ev, timedPopup) {
		
		// make 'page' or 'pages' 
		if (CR.pagesRead.length == 1){
			$("#end-session-pages").text(CR.pagesRead.length + " page");
		} else{
			$("#end-session-pages").text(CR.pagesRead.length + " pages");
		}
		
		//$("#end-session-sections").text(CR.sectionsRead.length);
		$("#end-session-minutes").text(Math.round((new Date().getTime() - CR.startTime)/60000));
		if (CR.content.nextChapterId != null) {
			$("#end-session-nextchapter").attr("href","/reader?lib=null&c="+CR.content.nextChapterId);
		} else {
			$("#end-session-nextchapter").attr("href","/library?lib="+CR.libID);
		}
			
		// if this is the timed popup version of end session, change the text
		if (timedPopup) {
			$("#end-session-keepreading").val("Read for 15 more minutes");
		} else {
			$("#end-session-keepreading").val("Continue Reading Current Chapter");
		}

		$("#end-session-modal").modal({
			keyboard: false,
			backdrop: "static"
		});
		// log buttons
		$("#end-session-logout").click(function(){
			$.post("/log", {type: "endsessionlogout", strategy: CR.getCurrentStrategy(), contentkey: CR.contentID, sectionkey: CR.getCurrentSection().id, data1: "", data2: ""});
		});
		$("#end-session-keepreading").click(function(){
			if (timedPopup) {
				// if this is the timed popup version of end session then keep reading is adding 15 more minutes
		    	CR.sessionTime += 15;
		    	CR.startReminderChecker();
			}
			CR.log("endsessionkeepreading", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "", "");
		});
		
		// log end of session feelings and save note
		$("#end-session-rate-goal").blur(function(){
			CR.log("endsessionfeeling", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "Rate Goal", $("#end-session-rate-goal").val());
		});
		$("#end-session-rate-concentration").blur(function(){
			CR.log("endsessionfeeling", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "Rate Goal", $("#end-session-rate-concentration").val());
		});
		
		$("#end-session-note").blur(function(){
			$.post("/usernote", { newnote: $("#end-session-note").val() });
		});

		
		CR.log("clickendsessionbtn", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "", "");
		CR.sendLogs();
		CR.sendUserProgress();
	},
	
	render: function(){
		if(this.inStartUp){
			this.$el.html(this.startUpView.render().el);
		}else{
			this.$el.html(this.template());
			
			$(this.$el.find("#pageNavDiv")).after(this.fontsizeView.render().el);
			
			$(this.$el.find("#sidebar")).append(this.toc.render().el);
			
			// REMOVE STRATS BASED ON OPTIONS
			if (!CR.options.reviewsummaries)
				$("#reviewSummariesBtn").hide();
			// reviewmultimedia does not need to be here because it is hidden by default
			
			// deal with preview issues
			var numPreviewStrats = this.countPreviewStrats();
			if (numPreviewStrats === 0) {
				$("#previewBar").addClass("disabled");
				$("#previewBar .dropdown-menu").remove();
			} else {
				if (!CR.options.previewsections) 
					$("#previewSectionsBtn").hide();
				if (!CR.options.previewfigures)
					$("#previewFiguresBtn").hide();
			}
			
			// deal with review heatmap
			if (CR.options.reviewheatmap === undefined){
				this.$el.find('#heatmapBtn').hide();
			}
			
			// START NOTEBOOK
			var Notebook = new NotebookView();
			if (CR.isMobile){
				$('#Notebook').css('left', 0);
				$('#Notebook').css('top', 0);
			}
		}
		
		return this;
	},
	
	updateMenuPercentComplete: function() {
		
	},

	
	scrollIntoSection: function(sectionNum){
		
		var now = new Date();
		// If we're coming from previous section and it has been >1 minute since last popup, then trigger the popup
		if(this.prevSectionNum + 1 == sectionNum && CR.sectionReminders[this.prevSectionNum] && (now - CR.lastReviewTrigger)/1000 >= 60){
			// Popup
			// Disable scrolling to stop the user from dragging the scrollbar or using arrow keys.
			// Scrolling is re-enabled in the close() method of PopupView
			console.log(CR.lastReviewTrigger);
			CR.lastReviewTrigger = now;
			console.log(CR.lastReviewTrigger);
			$("#readerPanel").css("overflow-y", "hidden");
			$("#readerPanel").scrollTop(CR.sectionOffsets[sectionNum] - $("#readerPanel").height()/2 - 1);
			var modalPop = new PopupView( {model: new Popup({title: "Review Reminder", message: "Would you like to review?"}), continueReadingBtn: true, reviewNotebookBtn: true} );
			
			CR.sectionReminders[this.prevSectionNum] = false;
		}
		
	},
	
	sectionChanged: function(sectionNum){
		this.prevSectionNum = sectionNum;
	},

	setHighlightModeOff: function(){
		console.log("controller off")
		this.$el.find('#HighlightModeBtn').html("Start Highlighting");
		this.$el.find('#HighlightModeBtn').attr('class', 'btn btn-success');
		this.inHighlightMode = false;
	},
	
	// change the wording of the highlight mode button and trigger highlight mode event 
	toggleHighlightMode: function(){
		if (!this.inHighlightMode){
			this.$el.find('#HighlightModeBtn').html("Done Highlighting");
			this.$el.find('#HighlightModeBtn').attr('class', 'btn btn-info');
			this.inHighlightMode = true;
		}else{
			this.setHighlightModeOff();
		}

		CR.events.trigger("toggleHighlightMode");
	},
	
	remove: function(){
		this.$el.remove();
	},
	
	initializeReminders: function(that) {
		// Initialize the reminder views for permanent (and temp) reminders
		var permanentReminderCollection = new ReminderCollection();
		var tempReminderCollection = new ReminderCollection();
		var permanentReminderCollectionView = new ReminderCollectionView({ collection: permanentReminderCollection, id: "reminder-list", type: "permanent" });
		var tempReminderCollectionView = new ReminderCollectionView({ collection: tempReminderCollection, id: "tempreminder-list", type: "temp",
																				sidebarCollection: permanentReminderCollection });
		that.$el.find("#reminderHolder").html(permanentReminderCollectionView.render().el);
		that.$el.find("#contentContainer").after(tempReminderCollectionView.render().el);
		
		// For section reminders
		CR.sectionReminders = [];
		for(var i = 0; i < CR.sections.length; i++){
			CR.sectionReminders.push(false);
		}
		
		CR.timedreminders = [];
		//CR.sessionTime = 30;		//this is now done on the session startup page
		CR.timePassed = 0;
		var presay = [];
		for(var i = 0; i < CR.reminders.length; i++){
			
			//console.log("Reminder: "+ CR.reminders[i].type+" "+CR.reminders[i].message);
			
			// Permanent reminder
			if(CR.reminders[i].name == "permanent"){
				// Put it in the sidebar
				permanentReminderCollection.add(new Reminder(CR.reminders[i]));
	
				// If the permanent reminders have a hearit field set to true
				//hearit doesn't seem to exist when it should
				if(CR.reminders[i].hearit){
					presay.push(CR.reminders[i].message);
				}
			// If it is a total-time reminder, set sessionTime and let the setInterval function take care of it
			}else if(CR.reminders[i].name == "total-time"){
				// this is now done on the session startup page
				//CR.sessionTime = reminders[i].time;
			// If it is a by-section reminder, register its values in the array
			}else if(CR.reminders[i].name == "modal" && CR.reminders[i].frequencyType == "section"){
				var freq = CR.reminders[i].frequency;
				for(var j = freq - 1; j < CR.sectionReminders.length; j += freq){
					CR.sectionReminders[j] = true;
				}
			// Temp, modal, and time-left reminders are triggered in the same manner, by a setInterval function
			}else {
				CR.timedreminders.push(CR.reminders[i]);
			}
		}
		
		// Now say all the pre-reading hearit reminders
		if(presay[0] != null){
			tts.playWarning();
			setTimeout(function(){tts.speakText(presay.join());},2000);
		}
		
		// The interval
		CR.reminderChecker;
		
		// The time-checking function
		CR.checkTimedReminders = function() {
			// 5 minutes have passed
			CR.timePassed += 5;
			var rems = CR.timedreminders;
			
			// Iterate through CR.timedreminders, see if anything needs to be triggered. If it does, add it to the priority queue
			var i = 0;
			while(i != rems.length){
				// For each reminder, we also check if there are duplicates already in queue
				
				// Do we trigger the time-left?
				if(rems[i].name === "time-left" && (CR.sessionTime - CR.timePassed) === rems[i]["time-left"] && !CR.duplicateReminder(rems[i])){
					CR.reminderQueue.push(rems[i], 4);
				// Temp reminders
				}else if(rems[i].name === "temp" && CR.timePassed % rems[i].frequency === 0 && !CR.duplicateReminder(rems[i])){
					CR.reminderQueue.push(rems[i], 1);
					// If the frequencytype is once, then remove it from the array
					if(rems[i].frequencyType == "once"){
						CR.timedreminders.splice(i, 1);
						rems = CR.timedreminders;
						// Move current index back one
						i--;
					}
				// Modal reminders (only periodically, not once)
				}else if(rems[i].name === "modal" && CR.timePassed % rems[i].frequency === 0 && !CR.duplicateReminder(rems[i])){
					CR.reminderQueue.push(rems[i], 2);
				}
				i++;
			}
			
			// Check if all time is up
			if(CR.sessionTime == CR.timePassed){
				CR.reminderQueue.push({type: "total-time"}, 3);
				clearInterval(CR.reminderChecker);
			}
			
			// If there is no current reminder being shown, then show the next one
			if(!CR.showingReminder){
				CR.nextReminder();
				CR.showingReminder = true;
			}
			
		};
		
		// Actual triggering of reminders
		CR.nextReminder = function() {
			var modalPop;
			var rem = CR.reminderQueue.pop();
			// If rem is null, then we are awaiting a new reminder
			if(rem == null){
				CR.showingReminder = false;
				return;
			}
			CR.showingReminder = true;
			
			// time-left
			if(rem.name == "time-left"){
				var pagegoaltext = "";
				if(CR.pagegoal != 0){
					pagegoaltext = "<br><br>Your page goal was to read " + CR.pagegoal + " pages in " + CR.sessionTime + " minutes, and you have read " + CR.pagesRead.length + " pages.";
				}
				if (tts.currPlayingClip) {
					if( !tts.paused ) tts.pauseTTS();
				}					
				modalPop = new PopupView( {model: new Popup({title: "Reading Session Reminder",
													message: "You only have " + rem["time-left"] + " minutes left in your reading session." + pagegoaltext }), closeBtn:true} );
			// temp
			}else if(rem.name == "temp"){
				// Fade in the alert
				tempReminderCollection.add(new Reminder(rem));
				// If it is also a hear-it message, then let them hear it
				if(rem.hearit){
					tts.playWarning();
					setTimeout(function(){tts.speakText(rem.message);},2000);
				}
			// modal
			}else if(rem.name == "modal"){
				if (tts.currPlayingClip) {
					if( !tts.paused ) tts.pauseTTS();
				}				
				// Pop the modal popup
				modalPop = new PopupView( {model: new Popup({title: "Review Reminder", message: "Would you like to review?"}), continueReadingBtn: true, reviewNotebookBtn: true} );
			// total-time
			}else if(rem.name == "total-time"){
				// End reading session popup
				that.endSession(null, true);
			}
		};
		
		// Returns true if there is a similar reminder in the reminderQueue (same type and message)
		CR.duplicateReminder = function(rem){
			// See if we have any duplicates
			for(var i = 0; i < CR.reminderQueue.size(); i++){
				// If the types and messages are equal, we have a duplicate
				if(CR.reminderQueue.contents()[i].object.type == rem.name && CR.reminderQueue.contents()[i].object.message == rem.message){
					return true;
				}
			}
			return false;
		};
		
		// Start the timed reminders by setting a setInterval function
		CR.startReminderChecker = function() {
			CR.reminderChecker = setInterval(CR.checkTimedReminders, 1000 * 60 * 5);
		};
		
		// Start the reminder checker
		CR.startReminderChecker();
	},
	
	// count the number of preview strategies
	countPreviewStrats: function(){
		var count = 0;
		if (CR.options.previewsections)
			count ++;
		if (CR.options.previewfigures)
			count ++;
		return count;
	},

});


// Helper Functions
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

//	//helper function for finding the parent of a subsection
//	findParentSection : function(section){
//		var j = section;
//		while(CR.sections[j].subsection == true){
//			j --;
//		}
//		return j;
//	},
//	findNextSection : function(section){
//		var j = section + 1;
//		while(sectionsArray[j].subsection == true){
//			j ++;
//		}
//		return j;
//	},
