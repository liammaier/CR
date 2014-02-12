var GlossaryItemView = Backbone.View.extend({

	model: GlossaryItem,
	tagName: "div",
	className: "entry",

	events: {
		// Put events here
	},

	template: _.template('<div class="term"><%= name %></div>: <br>' + 
		'<div class="def"><%= description %></div>'),
	
	initialize: function(){
		this.model.on("change", this.render, this);
	},
	
	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	
	remove: function(){
		this.$el.remove();
}

});


var GlossaryItemCollectionView = Backbone.View.extend({
	
	collection: GlossaryItemCollection,

	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.collection.forEach(this.addOne, this);
		return this;
	},

	addOne: function(m){
		var gv = new GlossaryItemView({model: m});
		gv.render();
		this.$el.append(gv.el);
	},
});