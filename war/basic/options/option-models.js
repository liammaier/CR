var Option = Backbone.Model.extend({
	defaults: function() {
		return {
			name:"null",
			description:"null",
			type:"null",
			enabled:false,
			data:"",
			suboption:false,
			subOptions:"null",
			locked:false,
			selectoption:false,
			parentKey:"",
			group: "",
		}
	},
	urlRoot: "/updateoption",
	
	initialize:function(){
		console.log();
		if(this.get("subOptions") != "null" && this.get("subOptions").length >0){
			this.set("subOptions", new OptionCollection(this.get("subOptions")));
		}
	},
	
	toggleEnabled:function(){
		if (this.get("enabled")) {
			// Disable
			this.set("enabled",false);
		} else {
			// Make enabled
			this.set("enabled",true);
		}
		this.save();
	},
	
	updateData: function(newdata){
		if (this.get("data") != newdata) {
			this.set("data", newdata);
			this.save();
		}
	},
	
	clear: function() {
        this.destroy();
    },
	
});

var OptionCollection = Backbone.Collection.extend({
	model: Option,
	url: "/updateoption",
	
	options: function () {
		return this.filter(function(option) {
			return option.get('type').indexOf("option") == 0;
		});
	},

	preview: function () {
		return this.filter(function(option) {
			return option.get('type').indexOf("preview") == 0;
		});
	},
	
	read: function () {
		return this.filter(function(option) {
			return option.get('type').indexOf("read") == 0;
		});
	},
	
	review: function () {
		return this.filter(function(option) {
			return option.get('type').indexOf("review") == 0;
		});
	},
	
	reminders: function () {
		return this.filter(function(option) {
			return option.get('type').indexOf("reminder") == 0;
		});
	},
	
	remindersPrior: function () {
		return this.filter(function(option) {
			return option.get('type') === "reminder-prior";
		});
	},
	
	remindersDuring: function () {
		return this.filter(function(option) {
			return option.get('type') === "reminder-during";
		});
	},
	
	remindersReview: function () {
		return this.filter(function(option) {
			return option.get('type') === "reminder-review";
		});
	},
	
	remindersPlan: function () {
		return this.filter(function(option) {
			return option.get('type') === "reminder-plan";
		});
	},
})
