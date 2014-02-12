var StratData = Backbone.Model.extend({
	urlRoot:"/updateStrategies",
	defaults: function() {
		return {
			content: CR.contentID,
			strategy: "",
			strategyData:new Array(),
			percentComplete: 0,
		}
	},
	
	initialize: function() {
		if (this.get("strategy") == "review-multimedia")
			CR.multimediaStratDataModel = this;
		
		// initialize as an array if it hasn't been already
		if (this.get("strategyData") == ""){
			this.set("strategyData", new Array());
		}
		

	},

	// reset the strategy data
    setStrategyData: function(newStratData) {
        this.set("strategyData", newStratData);
        this.save(); 
    },

    // add a new entry to the strategy data
    addStrategyData: function(newStratData) {
		
		var strategyData = this.get("strategyData");
		strategyData.push(JSON.parse(newStratData));
		this.set("strategyData", strategyData);
		this.save()
    },

    /* Review Media Specific Functions */
	
    removeMedia: function(mediaUrl) {
			
		var strategyData = this.get("strategyData");
		
		for (var i = 0; i < strategyData.length; i++){
			var media = strategyData[i];
			if (media.url === mediaUrl || media.context === mediaUrl) {
				strategyData.remove(i);
				this.set("strategyData", strategyData);
				this.save();
				break;
			}
		}
		
	},
	
	editMediaNote: function(mediaData) {
		
		var strategyData = this.get("strategyData");
		
		for (var i = 0; i < strategyData.length; i++){
			var media = strategyData[i];
			if (media.url === mediaData.url || media.context === mediaData.url) {
				media.note = mediaData.note;
				strategyData[i] = media;
				this.set("strategyData", strategyData);
				this.save();
				break;
			}
		}
		
	},





});
	
