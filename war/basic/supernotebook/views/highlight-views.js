var HighlightView = Backbone.View.extend({

	model: Highlight,
	tagName: "div",
	className: "highlightNotebook",
	// In this.options: 
	// template: "annotationtemplate" or "questiontemplate"
	
	events: {
		"click .garbageIcon"	  	: "clear",
		"addChecks"               	: "addCheckBox",
		"removeChecks"            	: "removeCheckBox",
		"blur .answerTextbox"       : "updateAnswer",
		"click .highlightContent"   : "editHighlight",
	},
		
	annotationtemplate: _.template("<% if(reviewed) { %> <img src='/images/check_icon.png' class='checkIcon' id='checkIcon'/> <% } %>" +
								   "<img class='garbageIcon' src='/images/garbagecan_icon.png'/>"+
								   "<div class='highlightContent <%if(instructor){%> instructor<%}%>'>" +
								       "<span class='highlightText'><%= completesentences %></span>" +
								   "</div>" +
								   "<% if(annotation != '') { %>" +
							   	       "<div class='highlightAnnotation'><%= annotation %></div>" +
								   "<% } %>" +
								   "<hr>"),
						 
	questiontemplate: _.template("<% if(reviewed) { %> <img src='/images/check_icon.png' class='checkIcon' id='checkIcon'/> <% } %>" +
								 "<img class='garbageIcon' src='/images/garbagecan_icon.png'/>"+
								 "<div class='highlightContent <%if(instructor){%> instructor<%}%>'>" +
								 	 "<span class='highlightText'><%= completesentences %></span>" +
								 "</div>" +
								 "<div class='highlightAnnotation'><%= question %></div>" +
								 "<textarea class='answerTextbox' placeholder='Write answer here'><%= answer %></textarea>" +
								 "<hr>"),

	initialize: function(){
		this.model.on("change", this.render, this);
		this.model.on("destroy", this.remove, this);
	},
	
	addCheckBox: function(){
		if(!this.model.get("reviewed") && !this.model.get("instructor"))(this.$el).append("<input type='checkbox' class='highlightBox' name='highlight'>");
	},
	
	removeCheckBox: function(){
		this.model.save({"reviewed": true});
		this.$el.children(".highlightBox").remove();
		this.render();
	},
	
	// Turns back the color of the highlight after we are done
	turnBack:function(color){
		if(tts.doPlay){
			setTimeout("this.turnBack('#DC05F0')","3000")
		}else{
			this.model.highlight(color);
		}
	},
	
	// Highlights contents within completesentences
	highlightContent: function() {
		// We have sentenceOffset, which is offset from beginning of completesentences
		var $highlightText = this.$el.find(".highlightText");
		var sentenceOffset = this.model.get("sentenceOffset");
		var contents = this.model.get("contents");
		var completesentences = this.model.get("completesentences");
		$highlightText.html(
			$highlightText.text().substr(0, sentenceOffset) + "<span class='highlighted'>" +
			$highlightText.text().substr(sentenceOffset, contents.length) + "</span>" +
			$highlightText.text().substr(sentenceOffset + contents.length, completesentences.length)
		);
	},
	
	editHighlight: function() {
		CR.events.trigger("showHighlightPopup", this.model);
	},
	
	updateAnswer: function() {
		var val = this.$el.find(".answerTextbox").val();
		this.model.save({answer: val});
	},
	
	render: function(){
		// A highlight is either rendered as a question, a main/supporting idea, or empty, depending on the collection type
		if(this.options.template == "questiontemplate"){
			if(this.model.get("question") && this.model.get("question") != "" && this.model.get("question") != "null"){
				this.$el.html(this.questiontemplate(this.model.toJSON()));
			}else {
				this.$el.html("");
			}
		// main/supporting
		}else {
			// Only render if not a question
			if(this.model.get("question") == "" || this.model.get("question") == "null" || this.model.get("question") == null){
				this.$el.html(this.annotationtemplate(this.model.toJSON()));
				if(this.model.get("type") == "supporting" || this.model.get("type") == "other"){
					this.$el.removeClass("highlight-main");
					this.$el.addClass("highlight-supporting");
				}else {
					this.$el.addClass("highlight-main");
					this.$el.removeClass("highlight-supporting");
				}
			}else {
				this.$el.html("");
			}
		}
		
		this.highlightContent();
		return this;
	},
	
	remove: function(){
		this.$el.remove();
	},
	
	clear: function() {
		this.model.clear();
	},
	
});


var HighlightPopupView = Backbone.View.extend({
	
	model: Highlight,
	id: "HighlightPopup",
	tagName: "div",
	className: "",
	
	events: {
		"click .bullet"         	      : "toggleView",
		"click #highpop-applyBtn"         : "apply",
		"click #highpop-cancelBtn"        : "cancel",
		"click #highpop-close"            : "cancel",
		"click #question-othercheck"      : "toggleTextbox",
		"click input[@name='ideatype']"   : "enableOK",
		"keypress #highpop-othertextbox"  : "preventIllegalCharacters",
	},
	
	initialize: function(){
		this.model.on("change", this.render, this);
		CR.events.bind("showHighlightPopup", $.proxy(this.showPopup, this));
		
		// Append itself to the body
		$("body").append(this.render().el);
		
		// draggable
		$("#HighlightPopup").draggable({
			handle: "#highpop-header", 
			containment: "body",
			scroll: false,
		});
		
	},
	
	template: _.template('<div id="highpop-header">' +
							 'Create/Edit Highlight' +
							 '<button id="highpop-close" type="button" class="close">x</button>' +
						 '</div>' +
						 '<div id="highpop-body">' +
							 '<div id="highpop-bodyinner">' +
							 	 '<div id="highlightPopupText"><%= completesentences %></div><hr><br>' +
							 	 '<div class="highlightpopup-header">Mark As:</div>' +
							 	 '<table class="highpop-table">' +
							 	 	'<tr>' +
							 	 		'<td><input type="radio" name="ideatype" class="bullet" value="main" <% if(type == "main") { %> checked <%}%> > Main Idea</td>' +
							 	 		'<td><input type="radio" name="ideatype" class="bullet" value="question" <% if(type == "question") { %> checked<%}%> > Confusing Concept</td>' + 
							 	 	'</tr><tr>' +
							 	 		'<td><input type="radio" name="ideatype" class="bullet" value="supporting" <% if(type == "supporting") { %> checked<%}%> > Supporting Idea</td>' + 
							 	 		'<td id="hplic"><input type="radio" name="ideatype" class="bullet" value="list"> List Item</td>' +
							 	 	'</tr>' +
							 	 '</table><br>' +
							 	 '<div id="highpop-nonquestionarea" hidden>' +
							 	 	'<div class="highlightpopup-header">Add Note</div>' +
							 	 	'<textarea id="highpop-notetextbox" class="highlightpopup-textbox" placeholder="Write your note here">' +
							 	 		'<%= annotation %>' +
							 	 	'</textarea><br>' +
							 	 '</div>' +	
							 	 '<div id="highpop-listarea" hidden>' +
							 	 	'<div class="highlightpopup-header"><br/><i>The highlight will be copied to your list.</i></div>' +
							 	 '</div>' +							 	 
							 	 '<div id="highpop-questionarea" hidden>' +
							 	 	'<div class="highlightpopup-header">Why is it confusing?</div>' +
							 	 	'<table class="highpop-table">' +
							 	 		'<tr>' +
							 	 			'<td><input type="checkbox" name="whyconfusing" value="Unfamiliar word(s)"> Unfamiliar word(s)</td>' +
							 	 			'<td><input type="checkbox" name="whyconfusing" value="Tricky sentence"> Tricky sentence</td>' +
							 	 		'</tr><tr>' +
							 	 			'<td><input type="checkbox" name="whyconfusing" value="Contradicts other ideas"> Contradicts other ideas</td>' +
							 	 			'<td><input id="question-othercheck" type="checkbox" name="whyconfusing" value="Other"> Comment</td>' +
							 	 		'</tr>' +
							 	 	'</table><br>' +
							 	 	'<textarea id="highpop-othertextbox" class="highlightpopup-textbox" placeholder="Why is it confusing?"></textarea>' +
							 	 '</div>' +
							 	 '<div id="highpop-other" hidden>' +
							 	 	"<input type='text' id='othertype-textbox' placeholder='Write your type here' value='<%= othertype %>'>" +
							 	 '</div>' +
						 	 '</div>' +
						 '</div>' +
						 '<div id="highpop-footer">' +
							 '<input id="highpop-applyBtn" type="button" class="btn btn-primary" data-dismiss="modal" value="Ok"/>' +
							 '<input id="highpop-cancelBtn" type="button" class="btn" data-dismiss="modal" value="Cancel"/>' +
						 '</div>'),
	
	 toggleView: function() {
		var val = this.$el.find('input[@name="ideatype"]:checked').val();
		this.$el.find("#highpop-nonquestionarea").hide();
		this.$el.find("#highpop-listarea").hide();
		this.$el.find("#highpop-other").hide();
		this.$el.find("#highpop-questionarea").hide();
		
		if(val == "question"){
			this.$el.find("#highpop-questionarea").show();
		}else if(val == "other"){
			this.$el.find("#highpop-other").show();
		}else {
			if( val != null && val.length > 0 ) this.$el.find("#highpop-nonquestionarea").show();
			this.$el.find("#highpop-other").hide();
			if(val == "list"){
				// Cannot enter any text into the notebox
				this.$el.find("#highpop-notetextbox").attr("disabled", "disabled");
				this.$el.find("#highpop-nonquestionarea").hide();
				this.$el.find("#highpop-listarea").show();
			}else {
				this.$el.find("#highpop-notetextbox").removeAttr("disabled");
				this.$el.find("#highpop-listarea").hide();
			}
		}
	},
	
	toggleTextbox: function() {
		if(this.$el.find('#question-othercheck').prop('checked')){
			// Checked, so show textbox
			this.$el.find("#highpop-othertextbox").show();
		}else {
			this.$el.find("#highpop-othertextbox").hide();
		}
	},
	
	uncheckAll: function() {
		// Uncheck the radio button that's selected
		this.$el.find("input:radio[@name='ideatype']").attr("checked", false);
		// Grey out the OK button
		this.$el.find("#highpop-applyBtn").attr("disabled", "disabled");
		this.$el.find("#highpop-nonquestionarea").hide();
	},
	
	enableOK: function(){
		this.$el.find("#highpop-applyBtn").removeAttr("disabled");
	},
	
	// Stops users from typing in a comment with quotes or < > characters - workaround for quotes coming soon
	preventIllegalCharacters: function(e) {
		if(String.fromCharCode(e.which) == '>' || String.fromCharCode(e.which) == '<'
					|| String.fromCharCode(e.which) == '"' || String.fromCharCode(e.which) == "'"){
    		e.preventDefault();
    	}
	},
	
	showPopup: function(newHighlight) {
		// Load the highlight into the model
		this.model = newHighlight;
		// Show the popup
		this.render();
		// If the type of the highlight is "new", then popup has all options.
		// If the type is something else, we know we are editing an already existing highlight.
		if(this.model.get("type") == "new"){
			// Show the option for adding to list
			this.$el.find('#hplic').show();
			// Uncheck the selected radio btns
			this.uncheckAll();
		}else {
			// Hide the option for adding to list
			this.$el.find('#hplic').hide();
			// If it is a question, we have to assemble the checkboxes
			this.disassembleQuestionText();
		}
		// Toggle views
		this.toggleTextbox();
		this.toggleView();
		
		// Grey background to disable clicking outside of popup
		$("body").append("<div id='highlightBackdrop' class='backdrop modal-backdrop' style='z-index: 250' hidden></div>");
		// If there was already a backdrop, make this one completely clear
		if($(".backdrop").length >= 2){
			$("#highlightBackdrop").css("opacity", "0");
		}
		// Show backdrop and popup
		$("#highlightBackdrop").fadeIn("fast");
		this.$el.show("fast");
	},
	
	apply: function() {
		var val = this.$el.find('input[@name="ideatype"]:checked').val();
		// If list is selected and there is content in the notebox, warn the user that the note will be lost
		if(val == "list" && this.$el.find("#highpop-notetextbox").val() != ""){
			var c = confirm("The text in the notebox will be lost if the highlight is added to the list. Continue?");
			if(c){
				// Submit the highlight if type is new
				if(this.model.get("type") == "new"){
					this.submitHighlight(val);
				}else {
					this.editHighlight(val);
				}
				
			}
		}else {
			if(this.model.get("type") == "new"){
				this.submitHighlight(val);
			}else {
				this.editHighlight(val);
			}
		}
	},
	
	cancel: function() {
		var c = confirm("This will cancel your edit of the highlight. Are you sure?");
		if(c){
			this.close();
			// Be sure to unhighlight the temp highlight!
			if(this.model.get("type") == "new"){
				this.model.removeHighlight();
			}
		}
	},
	
	close: function() {
		// Reset and close
		this.$el.find("#highpop-notetextbox").val("");
		this.$el.find("#highpop-othertextbox").val("");
		this.$el.find("#othertype-textbox").val("");
		CR.events.trigger("toggleGrayBackground");
		$("#highlightBackdrop").fadeOut("fast", function() {
			$("#highlightBackdrop").remove();
		});
		this.$el.hide("fast");
	},
	
	assembleQuestionText: function(){
		// Have to assemble the text from the checkboxes
		var questiontext = "";
		var othertext = this.$el.find("#highpop-othertextbox").val();
		var getothertextbox = false;
		var $checkedboxes = this.$el.find("input:checkbox[@name='whyconfusing']:checked");
		for(var i = 0; i < $checkedboxes.length; i++){
			if($($checkedboxes[i]).val() == "Other"){
				// Need to get the text from the Other textbox, do that last
				getothertextbox = true;
				continue;
			}else {
				if(questiontext == ""){
					questiontext = $($checkedboxes[i]).val();
				}else {
					// If there are questions before this, first append a ", "
					questiontext += ", " + $($checkedboxes[i]).val();
				}
			}
		}
		// Now deal with other textbox
		if(getothertextbox && othertext != ""){
			if(questiontext == ""){
				// If nothing in questiontext, don't prepend ", "
				questiontext = "Comment: " + othertext;
			}else {
				questiontext += (",<br>Comment: " + othertext);
			}
		}
		// If it is still empty, make a blank space
		if(questiontext == ""){
			questiontext = " ";
		}
		return questiontext;
	},
	
	disassembleQuestionText: function() {
		// Get the text in question, check the checkboxes accordingly
		var questions = this.model.get("question").split(", ");
		for(var i = 0; i < questions.length; i++){
			var q = questions[i].replace("'", "\'");
			// If we are on the last one, check to see if it is a custom text or not
			if(i == questions.length - 1){
				// Default text
				var $checkbox = this.$el.find("input:checkbox[value='" + q + "']");
				if($checkbox.length != 0){
					// Default text
					$checkbox.attr("checked", true);
				}else {
					// Custom text
					this.$el.find("#question-othercheck").attr("checked", true);
					this.$el.find("#highpop-othertextbox").val(questions[i].split("Comment: ")[1]);
				}
				return;
			// If not, we know it is a default
			}else {
				this.$el.find("input:checkbox[value='" + q + "']").attr("checked", true);
			}
		}
	},
	
	submitHighlight: function(val) {	
		// First check to see if they are adding to a list.
		if(val == "list"){
			var noteCollection = CR.notes[this.model.get("sectionNum")];
			noteCollection.create(new Note({ sectionID: noteCollection.sectionID, contents: this.model.get("contents"), type: noteCollection.type }));
			this.close();
			// Remove the temp highlight
			this.model.removeHighlight();
			return;
		}
		
		// If we get here, it was not a list item. Highlight has to be saved in some way
		if(val == "question"){
			this.model.set({ question: this.assembleQuestionText() });
		}else {
			this.model.set({ annotation: this.$el.find("#highpop-notetextbox").val() });
		}
		
		if(val == "other"){
			this.model.set({ othertype: this.$el.find("#othertype-textbox").val() });
		}
		// Set the type of highlight
		this.model.set({ type: val });
		// Prepare callback for when server returns ID
		var callback = {
			error: function(model, response){
				/** TODO implement local store for highlights here **/			
			},
			success: function(model, response){
				// Update local ID with the real id.
				var s = model.get("sectionNum");
				for(var i = 0; i < CR.highlights[s].length; i++){
					if(CR.highlights[s].at(i).cid == model.cid){
						// Found the highlight! First unhighlight the text
						CR.highlights[s].at(i).removeHighlight("cid");
						// id has been updated automatically in the model
						CR.highlights[s].at(i).showHighlight(); // Reshow the highlight
					}
				}
			}
		}
		CR.highlights[this.model.get("sectionNum")].add(this.model);
		this.model.save(null, callback);
		
		this.close();
	},
	
	editHighlight: function(val){
		var text = this.$el.find("#highpop-notetextbox").val();
		if(val == "question"){
			this.model.save({ type: "question", annotation: "", question: this.assembleQuestionText(), othertype: "" });
		}else if(val == "other"){
			this.model.save({ type: val, annotation: text, question: "", answer: "", othertype: this.$el.find("#othertype-textbox").val() });
		}else {
			this.model.save({ type: val, annotation: text, question: "", answer: "", othertype: "" });
		}
		this.close();
	},
	
	// Highlights the text in the top bar that shows the highlight in the context of its complete sentences
	highlightSentences: function() {
		$highlightText = $("#highlightPopupText");
		var sentenceOffset = this.model.get("sentenceOffset");
		var completesentences = this.model.get("completesentences");
		var contents = this.model.get("contents");
		$highlightText.html(
			$highlightText.text().substr(0, sentenceOffset) + "<span style='background-color: yellow'>" +
			$highlightText.text().substr(sentenceOffset, contents.length) + "</span>" +
			$highlightText.text().substr(sentenceOffset + contents.length, completesentences.length)
		);
	},
	
	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		// Highlight the text in the top bar
		// this.highlightSentences();
		return this;
	},
		
});




//Collection views

var HighlightCollectionView = Backbone.View.extend({

	tagName: "div",
	className: "highlightCollection",
	
	collection: HighlightCollection,
	
	events: {
		
	},
	
	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.collection.forEach(this.addOne, this);
		return this;
	},

	addOne: function(m){
		var gv = new HighlightView({model: m, template: this.options.template});
		gv.render();
		this.$el.append(gv.el);
	},
});