var UserProgressView = Backbone.View.extend({

	model: UserProgress,
	tagName: "div",
	className: "userprogress",

	events: {
		// events here
	},

	template: _.template("<b>Resource: <%= resourceName %></b><br>" +
						 "<b>Chapter <%= chapterNum %>: <%= contentName %></b><br>" +
						 "Notes Taken: <%= notesNum %><br>" +
						 "Highlights Taken: <%= highlightsNum %><br>" +
						 "Section Highlight Ratio: <%= sectionHighLigted %>/<%= sectionsRead %><br>" + // insert ratio here!!!!!!!!!!
						 "Minutes Read: <%= minutesNum %><br>" +
						 "Current Section: <%= curSection %><br>" +
						 "Last Read On: <%= lastUpdated %><br><hr>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
	},

	remove: function(){
		this.$el.remove();
	}

});



/* Collection Views */

var UserProgressCollectionView = Backbone.View.extend({

	tagName: "div",
	// Each collection has a libID for stats.html
	
	collection: UserProgressCollection,

	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.$el.html("");
		this.collection.forEach(this.addOne, this);
		if(this.collection.length == 0){
			this.$el.html("<div class='superpadding'>No progress to display.</div>");
		}
		return this;
	},

	addOne: function(m){
		var gv = new UserProgressView({ model: m });
		gv.render();
		this.$el.append(gv.el);
	},
	
});
