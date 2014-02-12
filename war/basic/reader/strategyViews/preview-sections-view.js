
var PreviewSectionsView = Backbone.View.extend({
	
	model: StratData,
	id: "preview",
	events: {
		"click #clearStrat"			: "clearAll",
		"click .sectiontitle"   	: "clickpsSection",
		"click #done"				: "done",
		"click .psreadbutton"      : "readfirstsentence",
	},
	sectionsComplete: 0,
	template: _.template('\
		<div id="preview-sections" >\
			<header>\
				<div class="instructions">\
					<!-- Click on each section heading -->\
					<h2>Click on each section heading below to preview the first sentence of that section.<input id="clearStrat" type="button" class="btn btn-success btn-large" value="Reset"/></h2>\
				</div>\
				<div class="preview-sections-title"><%= CR.content.title %></div>\
			</header>\
			<div id="strat-ps">\
				<%for(var i = 0; i< strategyData.length;i++){ \
					var section = strategyData[i]%>\
					<div id = "sectionPreview<%=section.number %>"class = "strat-section-element <% if(section.subsection == true){%>tabbed<%}%>">\
						<div data-section-num="<%=section.number %>" class="sectiontitle <%if(section.completed == true){%>completed<%}%> ">\
							<%= section.name %>\
						</div>\
					</div>\
				<% } %>\
			</div>\
			<footer>\
				<div class="instructions">\
					<h2>When you finish previewing, click the <i>Read</i> tab to begin reading.</h2>\
				</div>\
			</footer>\
		</div>'
	),

	initialize: function(){		
		CR.events.bind("readerLoaded", this.updatePercentComplete, this);
		
		var strategyData = this.model.get("strategyData")
		if (strategyData === null || strategyData.length == 0 ) {

			data = new Array();
			for(var i = 0 ;i < CR.sections.length; i++ ){
				// if the section doesn't have an ignore tag on it add it to our
				// data
				var current = CR.sections.at(i);
				if(!$("section[data-number=" + current.get("number")+"]").hasClass("dontreview")){
					var section = {
						id:current.get("id"),
						name :  current.get("name"),
						subsection :  current.get("subsection"),
						number:  current.get("number"),
						completed:  false,
					}
					data[i] = section;
				}
			} 
			
			this.model.set("strategyData", data);
			this.model.save();
		} else {
			// count the number completed
			for (var i = 0; i< strategyData.length; i++) {
				if (strategyData[i].completed == true)
					this.sectionsComplete ++;
			}
			this.updatePercentComplete(this.sectionsComplete/strategyData.length * 100);
		}
		
		
		
	},
	clickpsSection: function(e) {
		
		var target = e.currentTarget;
		var name = target.text;
		var number = target.getAttribute("data-section-num");
		
		// check if it's already shown
		var firstsentencewindow = $("#sectionPreview"+number).find(".firstsentencewindow");
		
		var that = this;
		if (firstsentencewindow.length == 0){
			// they clicked a new one
			
			// save the users progress
			var strategyData = this.model.get("strategyData");
			if (strategyData[number].completed === false) {
				strategyData[number].completed = true;
				this.model.set("strategyData", strategyData);
				this.model.save();
				
				// update completed percent
				this.sectionsComplete ++;
				this.updatePercentComplete(this.sectionsComplete/strategyData.length * 100);
			}
			
			// slide up any other open sections and change their color to completed
			var firstsentencewindow = $(".firstsentencewindow");
			if (firstsentencewindow.length > 0)
				firstsentencewindow.slideUp(function(){
					firstsentencewindow.remove();
					var id = firstsentencewindow.attr("id");
					$("#sectionPreview"+ id.substring(19) + " .sectiontitle").addClass("completed");
					that.showFirstSentence(number);
				});
			else {
				this.showFirstSentence(number);
			}
			
			CR.log("pssectionprereview", "preview-sections", CR.contentID, "null", number, "");
			
		} else {
			// if they clicked the one that's already open, just close it
			firstsentencewindow.slideUp(function(){
				firstsentencewindow.remove();
				$("#sectionPreview"+ number + " .sectiontitle").addClass("completed");
				
			});
		}
		
	},
	// retreive and display the first sentence
	showFirstSentence: function(sectionNumber) {
		var reader = CR.readerView.$el;
		
		var $section = $(reader.find("section[data-number="+sectionNumber+"]"));
		var firstsentence = $($section.find("p:first > span:first")[0]).text();
		
		if (firstsentence != null && firstsentence != "") {
			// if there is a first sentence
			var allsentences = $section.find("p:first > span");
			
			var followingsentences = "";
			
			// find the end of a sentence
			if (allsentences.length > 1) {
				var i = 2;
				while (!$(allsentences[i]).text().endsWith(". ") && !$(allsentences[i]).text().endsWith("? ") && !$(allsentences[i]).text().endsWith("! ")) {
					i ++;
					if (i > allsentences.length || i > 6) break; // so it doesn't go on forever
				}
				
				// piece together the following sentences
				for (var n = 1; n <= i; n++) {
					followingsentences += $(allsentences[n]).text();
				}
			}
			
			// DISPLAY

			// generate the firstsentencewindow
			var firstsentencewindow = $("<div hidden id='firstsentencewindow" + sectionNumber + "' class='firstsentencewindow'>" +
								"<input data-section-num='" + sectionNumber + "' type='button' class='psreadbutton btn btn-primary btn-large' value='Listen'>" +
								"<span class='ps-highlight'>"+firstsentence+" </span> &nbsp;" + followingsentences +
							"</div>");
		} else {
			// otherwise
			
			// generate the empty window
			var firstsentencewindow = $("<div hidden id='firstsentencewindow" + sectionNumber + "' class='firstsentencewindow'>" +
								"<span> <em> No opening sentence detected </em></span> " +
							"</div>");
			
		}
		
		


								
		// if the first sentence isn't there, remove the button and leave a message
		if (firstsentence === null || firstsentence === "") {
			firstsentencewindow.find(".psreadbutton").hide();
		}		

		this.$el.find("#sectionPreview"+sectionNumber).append(firstsentencewindow);
		firstsentencewindow.slideDown();
	},
	
	readfirstsentence: function(e) {
		var target = e.currentTarget;
		var number = target.getAttribute("data-section-num");
		
		var temp = $("#sectionPreview"+number).find(".ps-highlight");

		tts.speakText($("#sectionPreview"+number).find(".ps-highlight").text()); 
	},
	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		this.updatePercentComplete(this.sectionsComplete/this.model.get("strategyData").length * 100);
		return this;
	},
	
	updatePercentComplete: function(newPercent) {
		if (newPercent != null && newPercent != "") {
			this.model.set("percentComplete", newPercent);
		}
		
		$("#previewSectionsBtn .strat-percent").css("width", this.model.get("percentComplete")+"%");
	},


	// clears the strategies on the server
	clearAll: function(){
		var strategyData =this.model.get("strategyData");
		for(var i = 0; i<strategyData.length;i++){
			strategyData[i].completed = false;
		}
		this.model.set("strategyData", strategyData);
		this.model.save();
		
		// update completed percent
		this.sectionsComplete = 0;
		this.updatePercentComplete(0);
		
		this.render();
	},	
	// done with tts
	done: function(){
		tts.stopPlaying();
		this.render();
	},
});

