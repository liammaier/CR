
var PreviewFiguresView = Backbone.View.extend({
	
	model: StratData,
	id: "previewFigures",
	skimmedFigures: 0,
	events: {
		"click figure" : "clickFigure",
	},
	template: _.template('\
		<header>\
			<div class="instructions"> \
				<h2>Click on each figure in this chapter <input id="clearStrat" type="button" class="btn btn-success btn-large" value="Reset"/></h2>\
			</div>\
			<div id="preview-figures-counter">\
				<span id="pf-completed">0</span> / <span id="pf-total">0</span>\
			</div>\
		</header>\
		<div id="previewFiguresContent">\
		</div>\
	'),

	initialize: function(){		
		CR.events.bind("readerLoaded", this.updatePercentComplete, this);
		
		// load content css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', CR.content.cssURL) );

		//loads the html
		if (CR.content.type === "import") {
			
			// load the general imported css
			$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', "/contents/imported/general.css") );
			
			// load the actual content
			this.$el.html(CR.content.importedHTML);
			
			// add instruction bar
			this.$el.prepend(this.template(this.model.toJSON()));
			
			this.processFigures();
			
		} else {
		
			var that = this;
			this.$el.load(CR.content.url,function(response, status, xhr){
				// add instruction bar
				that.$el.prepend(that.template(that.model.toJSON()));
				
				that.processFigures();
			});		
			
		}
		
	},
	
	// do all the things we need to do to the figures
	processFigures: function() {
		
		var strategyData = this.model.get("strategyData")
		// fill in strat data if it doesn't exist
		if (strategyData === null || strategyData.length == 0 ) {

			var data = new Array();
			
			this.$el.find("figure").each(function(index, fig) {
				var figure = {
						skimmed : false,
				}
				data[index] = figure;
			});
			
			strategyData = data;
			this.model.set("strategyData", data);
			this.model.save();
		}

		// tag the figures
		var that = this
		this.$el.find("figure").each(function(index, fig) {
			$(this).data("fig-num", index);
			if (strategyData[index].skimmed) {
				$(this).addClass("skimmed");
				that.skimmedFigures ++;
			}
		});
		
		// update counter
		if (strategyData.length > 0) {
			this.$el.find("#pf-total").text(strategyData.length);
			this.$el.find("#pf-completed").text(this.skimmedFigures);
		} else {
			this.$el.find("#preview-figures-counter").html("No figures. <br> Skim if choose.")
			
		}
		
			
		
		this.updatePercentComplete(this.skimmedFigures/strategyData.length * 100);
	},
	
	clickFigure: function(ev) {
		var target = $(ev.currentTarget);
		
		if (!target.hasClass("skimmed")) {

			// add class
			target.addClass("skimmed");
			
			// update counter
			this.skimmedFigures ++;
			this.$el.find("#pf-completed").text(this.skimmedFigures);

			// save it
			var strategyData = this.model.get("strategyData");
			strategyData[target.data("fig-num")].skimmed = true;
			this.model.set("strategyData", strategyData);
			this.model.save();

			// update menu percentage
			this.updatePercentComplete(this.skimmedFigures/strategyData.length * 100);	
		}

	},

	render: function(){
		return this;
	},
	
	// done with tts
	done: function(){
		tts.stopPlaying();
		this.render();
	},
	
	updatePercentComplete: function(newPercent) {
	
		if (newPercent != null && newPercent != "") {
			this.model.set("percentComplete", newPercent);
		}
		$("#previewFiguresBtn .strat-percent").css("width", this.model.get("percentComplete")+"%");
	},
	
});

