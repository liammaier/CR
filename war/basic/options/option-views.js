var OptionsView = Backbone.View.extend({

	model: Option,
	tagName: "div",
	className: "option",

	events: {
		"click .option" : "toggleEnabled",
	},
	
	template: _.template("<input type='checkbox' class='option' name='1' id='option<%= id %>' data-stratid='<%= id %>' >"+
						"<h3><%= name %></h3>"+
						"<p class='description'><%= description %> </p>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},

	render: function(){
		// basic display
		this.$el.html(this.template(this.model.toJSON()));
		
		// add suboptions below the main option
		if (this.model.get("subOptions") != "null"){
			var suboptionscollection = this.model.get("subOptions");
			var optionsCollectionView = new OptionsCollectionView({ collection: suboptionscollection });
			optionsCollectionView.render();
			
			$("<div class='suboptions'></div>").html(optionsCollectionView.el).appendTo(this.$el);
		}
		
		// toggle the switch to on if it's enabled
		if (this.model.get("enabled")) {
			this.$el.find("#option"+this.model.get("id")).attr("checked", true);
		} else {
			this.$el.find(".suboptions").hide();
		}
		
	},

	toggleEnabled: function(click) {
		if (click.srcElement.id === "option"+this.model.id) // so it doesn't trigger it's parents
			this.model.toggleEnabled();
	},
	
	remove: function(){
		this.$el.remove();
	},

});


var OptionsCollectionView = Backbone.View.extend({

	collection: OptionCollection,
	
	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(type){
		this.collection.forEach(this.addOne, this);
		return this;
	},

	addOne: function(m){
		var gv = new OptionsView({model: m});
		gv.render();
		this.$el.append(gv.el);
	},
});

var RemindersView = Backbone.View.extend({

	model: Option,
	tagName: "div",
	className: "option",

	events: {
		"click input" : "toggleEnabled",
		"blur .other" : "blurOther",
	},
	
	checkboxtemplate: _.template("<input type='checkbox' id='option<%= id %>' name='<%= group %>'>"+
						"<label for='option<%= id %>'><span></span><%= name %></label>"+
						""),
	radiotemplate: _.template("<input type='checkbox' class='radio' id='option<%= id %>' name='<%= group %>'>"+
						"<label for='option<%= id %>'><span></span><%= name %></label>"+
						""),
	othertemplate: _.template("<input type='checkbox' id='option<%= id %>' name='<%= group %>'>"+
						"<label for='option<%= id %>'><span></span><%= name %></label>"+
						"<textarea class='other'><%= data %></textarea>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},
	
	render: function(){
		// basic display
		
		if (this.model.get("selectoption")){
			this.$el.html(this.radiotemplate(this.model.toJSON()));
		} else {
			
			if (this.model.get("name") === "Other"){
				this.$el.html(this.othertemplate(this.model.toJSON()));
			} else {
				this.$el.html(this.checkboxtemplate(this.model.toJSON()));
			}
		} 
		
		// add suboptions below the main option
		if (this.model.get("subOptions") != "null"){
			var suboptionscollection = this.model.get("subOptions");
			var reminderCollectionView = new ReminderCollectionView({ collection: suboptionscollection });
			reminderCollectionView.render();
			
			$("<div class='suboptions'></div>").html(reminderCollectionView.el).appendTo(this.$el);
		}
		
		// toggle the switch to on if it's enabled
		if (this.model.get("enabled")) {
			this.$el.find("#option"+this.model.get("id")).attr("checked", true);
		} else {
			this.$el.find(".suboptions").hide();
		}
		
	},

	toggleEnabled: function(click) {
		if (click.currentTarget.id === "option"+this.model.id) { // so it doesn't trigger it's parents
			if (this.model.get("selectoption")) {
				var thatid = "option"+this.model.id;
				$("input[name="+this.model.get("group")+"]:checked").each(function(){
					if (this.id != thatid) {
						this.click();
					}
				});
			}
				
			this.model.toggleEnabled();
		}
	},
	
	blurOther: function(blur) {
		this.model.updateData(blur.target.value)
	},
	
	remove: function(){
		this.$el.remove();
	},

});


var ReminderCollectionView = Backbone.View.extend({

	collection: OptionCollection,
	
	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(type){
		this.collection.forEach(this.addOne, this);
		return this;
	},

	addOne: function(m){
		var gv = new RemindersView({model: m});
		gv.render();
		this.$el.append(gv.el);
	},
});



