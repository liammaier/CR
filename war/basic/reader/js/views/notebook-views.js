var NotebookView = Backbone.View.extend({

	tagName: "div",
	id: "Notebook",
	currentSection: 0,
	
	events: {
		"click #saveNotebookBtn"     : "closeNotebook",
		"click #notebookClose"       : "closeNotebook",
		"touchend #notebookClose"    : "closeNotebook",
		"input #voiceBtn"			 : "appendSpeech",
	},

	template: _.template('<div id="notebookHeader">' +
						 	 '<i id="notebookClose" class="icon-remove"></i>' +
						 	 '<h2>Notebook</h2>' +
						 	 '<div id="notebookInstructions"></div>' +
						 '</div>' +
						 '<div id="notebook-body">' +
						   	 '<div id="rightNotebookArea" class="notebookArea">' +
						   	 	// Notebook tab containers put here from initialize()
						   	 	'<hr class="thick">' +
						   	 	'<div id="notebookSummary" class="notebookSubArea">' +
						   	 		'<div id="secSumTitle">Section Summary\
					   	 			<% if( CR.isMobile ) { %>\
				   	 					<img src="../../../images/micCrossed1.png">\
						   	 		<% }else if( document.createElement("input").webkitSpeech==undefined ) { %>\
						   	 			<img src="../../../images/micCrossed0.png">\
						   	 		<% }else{ %>\
						   	 			<input id="voiceBtn" type="text" x-webkit-speech="">\
						   	 		<% } %>\
						   	 	</div>' +
						   	 		// Section summaries put here from initialize()
						   	 	'</div>' +
							 '</div>' +
						   	 '<div id="notebookTOC" class="notebookArea"></div>' +
						 '</div>' +
						 
						 '<div id="notebook-footer">' +
						 	 '<input id="saveNotebookBtn" type="button" class="btn btn-primary" value="Save and close"/>' +
						 '</div>'),
	
	btnTemplate: _.template('<button id="notebookBtn" type="button" class="btn btn-medium btn-primary">Notebook</button>'),
	
	initialize: function(){
		// Listeners
		CR.events.bind("openNotebook", $.proxy(this.openNotebook, this));
		CR.events.bind("closeNotebook", $.proxy(this.closeNotebook, this));
		CR.events.bind("changeNotebookSection", $.proxy(this.changeSection, this));
		
		// Render notebook and add button for it on the bottom panel
		$("#mainContainer").append(this.render().el);
		$("#middleBarDiv").prepend(this.btnTemplate());
		$("#notebookBtn").click(function() {
			if (CR.isMobile){ return }else{ CR.events.trigger("openNotebook"); }
		});
		$('#notebookBtn').on({ 'touchstart' : function(){ CR.events.trigger("openNotebook"); } });
		
		//make the notebook resizable with the resizable icon as the handle
		$("#Notebook").resizable({
			handles: "se",
			containment: "body",
			maxHeight: 	$(window).height(),
			maxWidth: 	$(window).width(),
			minHeight: 	400,
			minWidth:  	730,
		});
		
		//make the notebook draggable by the header div
		$("#Notebook").draggable({
			handle: "#notebookHeader", 
			containment: "body",
			scroll: false,
		});
		
		// Initialize the TOC
		var sectionView = new SectionNotebookTOCCollectionView({collection: CR.notebookSections});
		sectionView.render();
		
		// Initialize all the sections' tabs and section summary textboxes
		for(var i = 0; i < CR.sections.length; i++){
			
			// Highlights, list and ??? panel. CHANGE TO VIEW eventually I assume.
			var prependTxt =	'<div id="notebookTabContainer' + i + '" class="notebookSubArea notebookTabContainer">' +
						   	 		'<ul>' +
							 			'<li class="highlights-tab"><a class="highlights-tab-button" href="#highlights-tab' + i + '"><div class="hlTab">Important Point and Details<span id="hlTabNum' + i +'"></span></div></a></li>' +
							 			'<li class="list-tab"><a class="list-tab-button" href="#list-tab' + i + '"><span>List</span><span id="ltTabNum' + i +'"></span></a></li>' +
							 			'<li class="questions-tab"><a class="questions-tab-button" href="#questions-tab' + i + '"><span>Confusing Concepts</span><span id="qtTabNum' + i +'"></span></a></li>' +
							 			'<li class="others-tab"><a class="others-tab-button" href="#others-tab' + i + '"><span>Additional Highlights</span><span id="otTabNum' + i +'"></span></a></li>' +
							 		'</ul>' +
							 		'<div id="highlights-tab' + i + '" class="notebook-tab"></div>' +
							 		'<div id="list-tab' + i + '" class="notebook-tab"></div>' +
							 		'<div id="questions-tab' + i + '" class="notebook-tab"></div>' +
							 		'<div id="others-tab' + i + '" class="notebook-tab"></div>' +
							 	'</div>';
			
			// if iOS, change styling
			if (CR.isMobile){
				prependTxt.replace('hlTab', 'hlTab-mobile');
			}
			
			this.$el.find("#rightNotebookArea").prepend(prependTxt);
			
			// Put the collections in the tabs
			var highlightCollectionView = new HighlightCollectionView({collection: CR.highlights[i], template: "annotationtemplate", section: i});
			this.$el.find("#highlights-tab" + i).append(highlightCollectionView.render().el);
			
			var noteCollectionView = new NoteCollectionView({ collection: CR.notes[i], section: i });
			this.$el.find("#list-tab" + i).append(noteCollectionView.render().el);
			
			var highlightCollectionView2 = new HighlightCollectionView({collection: CR.highlights[i], template: "questiontemplate", section: i});
			this.$el.find("#questions-tab" + i).append(highlightCollectionView2.render().el);
			
			var highlightCollectionView3 = new HighlightCollectionView({collection: CR.highlights[i], template: "othertemplate", section: i});
			this.$el.find("#others-tab" + i).append(highlightCollectionView3.render().el);
			
			// Section summary windows
			var sectionSummaryView = new SectionSummaryView({model: CR.sectionSummaries[i], id: "secSumTextbox" + i});
			this.$el.find("#notebookSummary").append(sectionSummaryView.render().el);
		}
		// Enable the tabs
		$(".notebookTabContainer").tabs();
		
		// Show for current notebook section
		this.$el.find("#notebookTabContainer" + CR.curSection).show();
		this.$el.find("#secSumTextbox" + CR.curSection).show();		
		
		// log tab changes
		this.$el.find(".highlights-tab-button").click(function(){
			CR.log("notebookhighlightstab", CR.getCurrentStrategy(), CR.contentID, null, CR.curNotebookSection, "");
		});
		this.$el.find(".list-tab-button").click(function(){
			CR.log("notebooklisttab", CR.getCurrentStrategy(), CR.contentID, null, CR.curNotebookSection, "");
		});
		this.$el.find(".questions-tab-button").click(function(){
			CR.log("notebookquestionstab", CR.getCurrentStrategy(), CR.contentID, null, CR.curNotebookSection, "");
		});
	},
	
	appendSpeech: function(){
		// get the current caret position
		var caretPos = this.$el.find("#secSumTextbox" + this.currentSection).attr('data-caretPos');
		if (typeof caretPos === 'undefined'){
			caretPos = 0;
		}else{
			caretPos = parseInt(caretPos);
		}
		
		var curTextArea = this.$el.find("#secSumTextbox" + this.currentSection);
		var string = curTextArea.val();
		var input = this.$el.find('#voiceBtn').val()+' ';
		
		// update textarea
		string = [string.slice(0,caretPos), input, string.slice(caretPos)].join("");
		curTextArea.val(string);

		// update caret position
		var newCaretPos = caretPos+input.length;
		curTextArea.attr('data-caretPos', caretPos+input.length);
		
		// setting caret position
		curTextArea.focus();
		if (curTextArea.get(0).setSelectionRange){
			curTextArea.get(0).setSelectionRange(newCaretPos,newCaretPos);
		}else if (curTextArea.get(0).createTextRange){
			var range = curTextArea.get(0).createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
  			range.moveStart('character', pos);
  			range.select();
		}
	},
	
	// Swaps the views for section summary and the tabbed interface to the new notebook section
	changeSection: function() {
		// Highlights, list, ????
		this.$el.find("#notebookTabContainer" + this.currentSection).hide();
		this.$el.find("#notebookTabContainer" + CR.curNotebookSection).show();
		
		// Section summary
		this.$el.find("#secSumTextbox" + this.currentSection).hide();
		this.$el.find("#secSumTextbox" + CR.curNotebookSection).show();
		
		// Update the currentSection variable
		this.currentSection = CR.curNotebookSection;
		
		CR.log("changenotebooksection", CR.getCurrentStrategy(), CR.contentID, null, CR.curNotebookSection, "");
	},

	openNotebook: function() {
		CR.curNotebookSection = CR.curSection;
		CR.events.trigger("changeNotebookSection");
		// Grey background to disable clicking outside of notebook
		$("body").append("<div id='notebookBackdrop' class='backdrop modal-backdrop' style='z-index: 111' hidden></div>");
		// Show both notebook and background
		this.$el.show("fast");
		$("#notebookBackdrop").fadeIn("fast");
		
		CR.log("opennotebook", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "", "");
	},
	
	closeNotebook: function() {
		this.$el.hide("fast");
		$("#notebookBackdrop").fadeOut("fast", function(){
			$("#notebookBackdrop").remove();
		});
		CR.removeFlashingArrow();
		
		CR.log("closenotebook", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "", "");
	},
	
	render: function(){	
		this.$el.html(this.template());
				
		return this;
	},

	remove: function(){
		this.$el.remove();
	},

});