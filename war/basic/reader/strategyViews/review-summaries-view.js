var ReviewSummariesView = Backbone.View.extend({
		
	model: StratData,
	id: "tocReview",
	events: {
		"click #clearStrat"	: "clearAll",
		"click  .row"    	: "toggleSummary",
	},
	sectionsComplete: 0,
	template: _.template('\
		<div id="review-summaries" >\
			<header>\
				<div class="instructions"> \
					<h2>Review Section Summaries <input id="clearStrat" type="button" class="btn btn-success btn-large" value="Reset"/></h2>\
				</div>\
			</header>\
			<div id="rs-sections">\
				<%for(var i =0; i < strategyData.length;i++ ){ %>\
					<%var section = strategyData[i]%>\
					<div id = "sectionReview<%=section.number %>" class ="<%if(section.completed){%> completed <%}%> <%if(section.current){%>current <%}%>pointer row">\
						<div class="name-wrapper">\
						<div class="section-name"><%= section.name %></div>\
						 </div>\
						 <div class="summary-wrapper">\
							<%if(section.current){%>\
						 		<div class="place-filler"> Say your summary out loud. Then click again.</div>\
						 	<%}else{%>\
								<div class="summary"><pre><%= (CR.sectionSummaries[section.number].get("contents")!= "" ? CR.sectionSummaries[section.number].get("contents") : "no summary")  %> </pre></div>\
							<%}%>\
						</div>\
					</div>\
				<% } %>\
			</div>\
		</div>\
	'),

	initialize: function(){
		CR.events.bind("readerLoaded", this.updatePercentComplete, this);
		this.model.on("change", this.render, this);
		
		var strategyData = this.model.get("strategyData")
		if (strategyData === null || strategyData.length == 0 ) {
	
			sections = new Array();
			for(var i = 0 ;i < CR.sections.length; i++ ){
				//if the section doesn't have an ignore tag on it add it to our data
				var current = CR.sections.at(i);
				if(!$("section[data-number=" + current.get("number")+"]").hasClass("dontreview")){
					var section = {
						id:current.get("id"),
						name :  current.get("name"),
						subsection :  current.get("subsection"),
						number:  current.get("number"),
						completed:  false,
					}
					sections[i] = section;
				}
			}
			
			this.model.set("strategyData", sections);
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
	toggleSummary: function(e){
		var target = e.target;
		var name = target.text;
		if(target.id == "")target = $(target).parents(".row")[0];
		var $target = $(target);
		var number = target.id.replace("sectionReview","");
		var strategyData = this.model.get("strategyData");
		//if we have completed a strategy save it
		if ($($target.find(".summary")).size() == 0){
			
			// if it hasn't been completed already, complete it and update percentages
			if (strategyData[number].completed === false) {
				strategyData[number].completed = true;
				this.sectionsComplete ++;
				this.updatePercentComplete(this.sectionsComplete / strategyData.length * 100);
			}
			
			strategyData[number].current = false;
			CR.log("sectionsummaryreviewfinished", "review-summaries", CR.contentID, "null", number , "");
			
		}else{
			for(var i = 0;i<strategyData.length;i++){
				if(i != number)strategyData[i].current = false;
			}			
			strategyData[number].current = true;
			CR.log("sectionsummaryreviewstarted", "review-summaries", CR.contentID, "null", number , "");
		}
		//save the data we get from this strategy
		this.model.set("strategyData", strategyData);
		this.model.save();

		this.render();
	},
	render: function(){
		try{
			this.$el.html(this.template(this.model.toJSON()));
		}catch(err){ console.log("Error when trying to render the review strat"); }
		this.updatePercentComplete(this.sectionsComplete/this.model.get("strategyData").length * 100);
		return this;
	},

	//clears the strategies on the server
	clearAll: function(){
		var strategyData =this.model.get("strategyData");
		for(var i = 0; i<strategyData.length;i++){
			strategyData[i].completed = false;
			strategyData[i].current = false;
		}
		this.render();
		
		// update completed percent
		this.sectionsComplete = 0;
		this.updatePercentComplete(0);
	},	
	
	updatePercentComplete: function(newPercent) {
		if (newPercent != null && newPercent != "") {
			this.model.set("percentComplete", newPercent);
		}
		$("#reviewSummariesBtn .strat-percent").css("width", this.model.get("percentComplete")+"%");
	},

});