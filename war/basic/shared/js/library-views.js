var LibraryView = Backbone.View.extend({

	model: Library,
	tagName: "div",
	className: "library",

	events: {
		
	},

	template: _.template("<h3 class='name'><%= name %> <span class='numbooks'> (<%= numbooks %> Books)</span></h3> <span class='description'><%= description %></span>"  +
				"<a href='/library?lib=<%= id %>'class='btn btn-primary btn-large goBtn'> Go </a>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
	},

	remove: function(){
		this.$el.remove();
	},



});

var LibraryStatView = Backbone.View.extend({
	
	model: Library,
	tagName: "div",
	className: "lib",

	events: {
		"click"     : "changeLib",
	},

	template: _.template("<img class='libpic' src='/images/library.png'><div class='libname'><%= name %></div><div class='libdesc'><%= description %></div><hr>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},
	
	changeLib: function() {
		// If this class was not already active, we need to get the info
		var getNewData = false;
		if(!this.$el.hasClass("active")){
			getNewData = true;
		}
		$(".lib").removeClass("active");
		this.$el.addClass("active");
		
		// If we need to get new data, let's do it
		var lib = this.model.get("id");
		if(getNewData){
			$.post("/getUsersInLibraryAPI", {libID: lib}, function(data){
				Handler.changeUsers(data, lib);
			});
		}
	},

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
	},

	remove: function(){
		this.$el.remove();
	}
	
});



/* Collection Views */

var LibraryCollectionView = Backbone.View.extend({
	
	collection: LibraryCollection,

	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.collection.forEach(this.addOne, this);
		return this;
	},

	addOne: function(m){
		var gv = new LibraryView({model: m});
		gv.render();
		this.$el.append(gv.el);
	},
	
});

var LibraryStatCollectionView = Backbone.View.extend({

	tagName: "div",
	
	collection: LibraryCollection,

	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.collection.forEach(this.addOne, this);
		return this;
	},

	addOne: function(m){
		var gv = new LibraryStatView({model: m});
		gv.render();
		this.$el.append(gv.el);
	},
	
});