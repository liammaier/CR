var UserView = Backbone.View.extend({

	model: User,
	tagName: "div",
	className: "user",

	events: {
		"click"      : "changeUser",
	},

	template: _.template("<b><%= email %><br></b>" +
			"Notes Taken: <%= notesNum %><br>" +
			"Highlights Taken: <%= highlightsNum %><br>" +
			"Sections Read: <%= sectionsRead %><hr>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},
	
	changeUser: function(){
		// If this class was not already active, we need to get the info
		var getNewData = false;
		if(!this.$el.hasClass("active")){
			getNewData = true;
		}
		$(".user").removeClass("active");
		this.model.collection.trigger("removeHighlight");
		this.$el.addClass("active");
		
		this.model.highlighted = true;
		
		// If we need to get new data, let's do it
		if(getNewData){
			$.post("/getUserLibProgress", {userID: this.model.get("id"), libID: this.options.libID}, function(data){
				Handler.changeProgress(data);
			});
		}
	},

	render: function(){
		if (this.model.highlighted === true){ this.$el.addClass("active"); }
		this.$el.html(this.template(this.model.toJSON()));
	},

	remove: function(){
		this.$el.remove();
	}

});

/** dropdown model **/
var SelectView = Backbone.View.extend({
	initialize: function() {
		this.render();
	},

	template: _.template('<div class="dropdown">' +
			'<b>Sort By: </b>' +
			'<select id="userDropDown">' +
			'<option value="0">notes number</option>' +
			'<option value="1">highlight number</option>' +
			'<option value="2">section read</option>' +
			'</select></div>'),

	render: function(){
		this.$el.append(this.template(null));
	},
});

/* Collection Views */

var UserCollectionView = Backbone.View.extend({

	tagName: "div",
	// Each collection has a libID for stats.html
	
	collection: UserCollection,

	initialize: function() {
		this.collection.on("add", this.addOne, this);
		this.collection.on("removeHighlight",function(){
			this.collection.each(function(model){
				model.highlighted = false;
			})
		}, this);
	},
	
	/** event for dropdown list **/
	events: {
		"change #userDropDown"			: "changesCriteria",
	},
	
	/** change the sorting criteria **/
	changesCriteria: function(){
		console.log('test');
		var selected = document.getElementById("userDropDown");
		selected = selected.options[selected.selectedIndex].value;
		this.criteria = selected;
		this.render();
		var element = document.getElementById('userDropDown');
	    element.value = selected;
	},
	
	criterias: [function(user){ return -user.get("notesNum"); },
	           function(user){ return -user.get("highlightsNum"); },
	           function(user){ return -user.get("sectionsRead"); },
	           ],

	criteria: 0,
	
	sort: function(crit){
		this.criteria = crit;
	},
	
	render: function(){
		this.$el.html("");
		/* sort the collection */
		this.collection.comparator = this.criterias[this.criteria];
		this.collection.sort();
		/* end sorting */

		/* add the drop down */
		if (this.collection.length != 0){
			ddview = new SelectView({ el: this.$el });
			this.collection.forEach(this.addOne, this);
		}else{
			this.$el.append("<div class='superpadding'>Please click on a library.</div>");
		}
		return this;
	},

	addOne: function(m){
		var gv = new UserView({model: m, libID: this.collection.libID});
		gv.render();
		this.$el.append(gv.el);
	},
	
});
