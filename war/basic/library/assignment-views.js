var AssignmentView = Backbone.View.extend({

	model: Assignment,
	tagName: "tr",

	events: {
		// Put events here
	},

	template: _.template("<td><%= dueDate %></td><td><%= library %></td><td><%= name %></td>" +
				"<td><%= description %></td>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},

	render: function(){
		if(this.model.get("late") == false){
			this.$el.addClass("notlate");
		}else {
			this.$el.addClass("late");
		}
		this.$el.html(this.template(this.model.toJSON()));
	},

	remove: function(){
		this.$el.remove();
	}

});

var SpecificAssignmentView = Backbone.View.extend({

	model: Assignment,
	tagName: "tr",

	events: {
		// Put events here
	},

	template: _.template("<td><%= dueDate %></td><td><%= resource %></td><td><%= name %></td>" +
				"<td><%= description %></td>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},

	render: function(){
		if(this.model.get("late") == false){
			this.$el.addClass("notlate");
		}else {
			this.$el.addClass("late");
		}
		this.$el.html(this.template(this.model.toJSON()));
	},

	remove: function(){
		this.$el.remove();
	}

});


// Collection views

var AssignmentCollectionView = Backbone.View.extend({

	el: "#scheduletableBody",
	tagName: "tbody",
	
	collection: AssignmentCollection,

	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.collection.forEach(this.addOne, this);
	},

	addOne: function(m){
		var gv = new AssignmentView({model: m});
		gv.render();
		this.$el.append(gv.el);
	},
});

var SpecificAssignmentCollectionView = Backbone.View.extend({

	el: "#scheduletableBody",
	tagName: "tbody",
	
	collection: AssignmentCollection,

	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.collection.forEach(this.addOne, this);
	},

	addOne: function(m){
		var gv = new SpecificAssignmentView({model: m});
		gv.render();
		this.$el.append(gv.el);
	},
});