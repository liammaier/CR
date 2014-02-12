var Resource = Backbone.Model.extend({
	defaults: function(){
		return {
			id: -1,
			title: "null",
			type: "book", // Article, slides, etc.
			description: "null",
			DRM: "private",
			haveAccess: true,
			url: "null",
			chapters: "null",
			toReview: "none", // all, none, or some
		}
	},
	
	initialize: function() {
		if(this.get("chapters") != "null"){
			this.set("chapters", new ContentCollection(this.get("chapters")));
			this.get("chapters").setParent(this);
		}
	},

	changeReview: function(status, children){
		this.set("toReview", status);
		if (children && status !== "some"){
			this.get("chapters").changeReview(status, children);
		}
		
	},


	
});

var ResourceCollection = Backbone.Collection.extend({
	model: Resource,
});