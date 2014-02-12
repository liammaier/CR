
var ResourceViewSN = Backbone.View.extend({

	model: Resource,
	tagName: "div",
	className: "resource",
	
	events: {
		
	},
	
	template: _.template('\
			<h3 class="bookSN"><%= title %></h3>\
			'),
	
	render: function(){
		this.$el.html("");
		this.$el.html(this.template(this.model.toJSON()));
		// Now take care of the content
		var chapterNavCollView = new ChapterNavCollectionView({ collection: this.model.get("chapters") });
		this.$el.append(chapterNavCollView.render().el);
		return this;
	},

	remove: function(){
		this.$el.remove();
	},

});


var ResourceCollectionViewSN = Backbone.View.extend({
		
	collection: ResourceCollection,
	
	initialize: function() {
		
	},
	
	addOne: function(m){
		var ch = new ResourceViewSN({model: m});
		ch.render();
		this.$el.append(ch.el);
	},
	
	render: function(){
		this.$el.html("");
		// Add all the reminders
		this.collection.forEach(this.addOne, this);
		return this;
	},
	
	remove: function(){
		this.$el.remove();
	}
	
});
