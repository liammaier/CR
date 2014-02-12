 var Content = Backbone.Model.extend({
	defaults: function(){
		return {
			id: -1,
			title: "null",
			type: "article",
			description: "null",
			lastRead: "null",
			haveAccess: true,
			timeCreated: "null",
			numSections: "0",
			numPages: "0",
			toReview: "none", // all, none, or some
			resource: "null",
			notes: 0,
			highlights: 0,
			summarycompleted: 0,
			summarytotal: 0,
			sections: "null",
		}
	},
	
	initialize: function() {
		if(this.get("sections") != "null"){
			this.set("sections", new SectionCollection(this.get("sections")));
			this.get("sections").setParent(this);
		}
	},

	changeReview: function(status, children) {
		this.set("toReview", status);
		if (children && status != "some") {
			this.get("sections").changeReview(status);
		}
	},
	
	SNgethighlights: function() {
		if(this.get("sections") == "null"){
			return 0;
		}
		var h = 0;
		this.get("sections").each(function(s){
			if(s.get("highlights") == "null"){
				return;
			}
			h += s.get("highlights").length;
		});
		return h;
	},
	
	SNgetnotes: function() {
		if(this.get("sections") == "null"){
			return 0;
		}
		var h = 0;
		this.get("sections").each(function(s){
			if(s.get("highlights") == "null"){
				return;
			}
			h += _.filter(s.get("highlights").models, function(h){ return h.get("annotation") != "" }).length;
		});
		return h;
	},
	
	SNgetsummarycompleted: function() {
		if(this.get("sections") == "null"){
			return 0;
		}
		var h = 0;
		this.get("sections").each(function(s){
			if(s.get("notes") == "null" || s.get("notes") == null || s.get("notes").length == 0){
				return;
			}
			h += s.get("notes").where({ type: "Section Summary"}).length;
		});
		return h;
	},
	
	SNgetsummarytotal: function(){
		return this.get("sections").length;
	}


});

var ContentCollection = Backbone.Collection.extend({
	model: Content,
	
	
	initialize: function() {
		this.bind("change", this.onChange, this);
		this.numToReview = 0;
		this.parent = null;
	},

	onChange: function(model){
		// change count based on model that changed
		this.numToReview = 0;
		var that = this;
		this.forEach(function(model, index){
			if (model.get("toReview") === "all") {
				that.numToReview ++;
			} else if (model.get("toReview") === "some") {
				// to keep it from being the full amount, but still more than zero
				that.numToReview += .5; 
			}
			
		});

		// check for new situation
		if(this.parent != null){
			if (this.numToReview === this.length) {
				this.parent.changeReview("all");
			} else if (this.numToReview === 0) {
				this.parent.changeReview("none");
			} else {
				this.parent.changeReview("some");
			}
			
		}
		
	},

	
	changeReview: function(status, children) {
		this.forEach(function(model, index){
			model.changeReview(status, children);
		});
	},
	
	setParent: function(parent) {
		this.parent = parent;
	},

	
});