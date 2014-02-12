var PermanentReminderView = Backbone.View.extend({

	model: Reminder,
	tagName: "div",
	className: "reminder",

	events: {

	},
	
	template: _.template('<span class="reminder-text"><%= message %></span>'),
						
	initialize: function(){
		this.model.bind("change", this.render, this);
		this.model.bind('destroy', this.remove, this);
		// Start an expiration time on the fading reminders of 1 minutes
		if(this.model.get("type") == "fade"){
			setTimeout(_.bind(this.expire, this), 1000 * 60 * 1);
		}
	},
	
	expire: function(){
		var that = this;
		this.$el.fadeOut(1000, function() {
			// Faded out, so kill it
			that.clear();
		});
	},

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		// For reminders fading in from being temp
		if(this.model.get("type") == "fade"){
			this.$el.hide();
			this.$el.fadeIn(1000);
		}
		return this;
	},

	clear: function() {
		this.model.clear();
	},

});

var TempReminderView = Backbone.View.extend({

	model: Reminder,
	tagName: "div",
	className: "reminder",

	events: {

	},
	
	template: _.template('<span class="reminder-text"><%= message %></span>'),
						
	initialize: function(){
		this.model.bind("change", this.render, this);
		this.model.bind('destroy', this.remove, this);
	},
	
	switchToSidebar: function() {
		var that = this;
		this.$el.fadeOut(1000, function() {
			// Faded out, so first add to Sidebar group
			that.options.sidebarCollection.add({message: that.model.get("message"), type: "fade"});
			// Then remove it from the Temp group
			that.clear();
		});
	},

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		// Start hidden
		this.$el.hide();
		// Fade in, and set a time of when to swap out
		this.$el.fadeIn(1000);
		// Fade out in 10 seconds
		setTimeout(_.bind(this.switchToSidebar, this), 1000 * 10);
		setTimeout(CR.nextReminder, 1000 * 5);
		return this;
	},

	clear: function() {
		this.model.clear();
	},

});



// Collection views

var ReminderCollectionView = Backbone.View.extend({
	
	collection: ReminderCollection,
	className: "sidebar-content",
	
	initialize: function() {
		this.collection.bind("add", this.addOne, this);
		this.collection.bind("reset", this.reset, this);
	},
	
	render: function(){
		// Add all the reminders
		this.collection.forEach(this.addOne, this);
		return this;
	},
	
	reset: function(){
		this.$el.html("");
		this.render();
	},
	
	addOne: function(m){
		var r;
		if(this.options.type == "permanent"){
			r = new PermanentReminderView({model: m});
		}else if(this.options.type == "temp"){
			r = new TempReminderView({model: m, sidebarCollection: this.options.sidebarCollection});
		}
		r.render();
		this.$el.append(r.el);
	},
	
	remove: function(){
		this.$el.remove();
	}
	
});
