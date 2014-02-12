var LogView = Backbone.View.extend({
	
	model: Log,
	tagName: "tr",

	events: {
		
	},

	template: _.template("<td><%= type %></td>" +
			 			 "<td><%= content %></td>" +
			 			 "<td><%= timeCreated %></td>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	remove: function(){
		this.$el.remove();
	},
	
});


var LogCollectionView = Backbone.View.extend({

	tagName: "table",
	className: "table table-bordered table-striped table-condensed",
	
	events: {

	},

	collection: LogCollection,
	
	baseTemplate: _.template("<thead>" +
						 		 "<tr>" +
						 			"<th>Type</th>" +
						 			"<th>Content</th>" +
						 			"<th>Time Stamp</th>" +
						 		 "</tr>" +
						 	 "</thead>" +
						 	 "<tbody></tbody>"),

	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.$el.html(this.baseTemplate());
		this.collection.forEach(this.addOne, this);
		return this;
	},

	addOne: function(m){
		var view = new LogView({model: m});
		this.$el.find("tbody").append(view.render().el);
	},
});