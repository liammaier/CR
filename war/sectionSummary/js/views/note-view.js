var NoteView = Backbone.View.extend({

	model: Note,
	tagName: "div",
	className: "noteview",

	events: {
	},
	
	template: _.template("<%= contents.value %>"),

	initialize: function(){
	},
    
	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

});


// Collection views
var SectionView = Backbone.View.extend({
	
	model: Section,
	tagName: "div",
	className: "sectionCollection",
	
	initialize: function() {
	},
	
	render: function(){
		//header, if there are any notes
		if(this.model.get('collection').length > 0){
			this.$el.html("<div class='noteArea'></div>");
		}
		
		// Title for the list
		this.$el.prepend("<div class='notes-header'>" + this.model.get('title') + "</div>");
		
		//add all the notes
		this.model.get('collection').forEach(this.addOne, this);
		
		return this;
	},
	
	addOne: function(m){
		var noteView = new NoteView({model: m});
		this.$el.find(".noteArea").append(noteView.render().el);
	},
	
	remove: function(){
		this.$el.remove();
	}
});

//Collection views
var ContentView = Backbone.View.extend({
	
	model: Content,
	tagName: "div",
	className: "contentCollection",
	
	initialize: function() {
	},
	
	render: function(){
		//header, if there are any notes
		if(this.model.get('collection').length > 0){
			this.$el.html("<div class='sectionArea'></div>");
		}
		
	//	 Title for the content
		this.$el.prepend("<div class='content-header'>" + this.model.get('title') + "</div>");
		
		//add all the section
		this.model.get('collection').forEach(this.addOne, this);
		
		return this;
	},
	
	addOne: function(m){
		var sectionView = new SectionView({model: m});
		this.$el.find(".sectionArea").append(sectionView.render().el);
	},
	
	remove: function(){
		this.$el.remove();
	}
});