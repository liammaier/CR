var Section = Backbone.Model.extend({
	defaults: function() {
		return {
			id: -1,
			name: "null",
			number: "null",
			highlights: "null", //array of highlights
			notes: "null",
			highlighted: false,
			subsection: false,
			summary: false,
			showStrat: false,
			showPop: false,
			toReview: "none", // all or none
		}
	},
	
	changeReview: function(status) {
		this.set("toReview", status);
	},


});

var SectionCollection = Backbone.Collection.extend({
	model: Section,
	
	initialize: function() {
		this.bind("change", this.onChange, this);
		this.numToReview = 0;
		this.parent = null;
	},
	
	onChange: function(model){
	
		// this is only for the super notebook. Only do this if parent isn't null
		if (this.parent != null) {
			// change count based on model that changed
			this.numToReview = 0;
			var that = this;
			this.forEach(function(model, index){
				if (model.get("toReview") == "all") {
					that.numToReview ++;
				} 
			});
		
			// check for new situation
			if (this.numToReview === this.length) {
				this.parent.changeReview("all");
			} else if (this.numToReview === 0) {
				this.parent.changeReview("none");
			} else {
				this.parent.changeReview("some");
			}
		}
	},
	
	
	changeReview: function(status) {
		this.forEach(function(model, index){
			model.changeReview(status);
		});
	},
	
	setParent: function(parent) {
		this.parent = parent;
	},
	


});