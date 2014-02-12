//var Option = Backbone.Model.extend({
//	defaults: function() {
//		return {
//			name:"null",
//			description:"null",
//			type:"null",
//			message:"<%= name %>-justseeit-periodically-",
//			hearit:false,
//			frequencytype:"<%= name %>-justseeit-periodically-",
//			frequency:0,
//			time:0,
//		}
//	},
//	
//	initialize:function(){
//
//	},
//	
//	clear: function() {
//        this.destroy();
//    },
//	
//});
//
//var OptionCollection = Backbone.Collection.extend({
//	model: Option,
//	
//	
//})

var ReminderView = Backbone.View.extend({

	tagName: "div",
	className: "option",

	events: {
		"click input" : "toggleEnabled",
		"blur .other" : "blurOther",
	},
	template: _.template('<input type="checkbox" id="<%= name %>" name="<%= name %>">\
							<label for="<%= name %>"><span></span><%= message %></label>\
							<input type="hidden" name="<%= name %>-message" value="<%= message %>">\
							<% if (name.indexOf("other") !== -1) { %>\
								<textarea id="<%= name %>-text" name="<%= name %>-text" class="other"></textarea>\
							<% } %>\
							<div class="fields" hidden>\
								<input type="radio" id="<%= name %>-seeithearit" name="<%= name %>-seeorhear" value="seeithearit"><label for="<%= name %>-seeithearit"><span></span>See it and hear it</label><br/>\
								<div class="fields" hidden>\
									<input type="radio" id="<%= name %>-seeithearit-once" name="<%= name %>-seeithearit-frequencytype" value="once"><label for="<%= name %>-seeithearit-once"><span></span>Once</label><br/>\
									<div class="fields" hidden>\
										<input type="radio" id="<%= name %>-seeithearit-once-5" name="<%= name %>-seeithearit-once-frequency" value="5"><label for="<%= name %>-seeithearit-once-5"><span></span>After 5 minutes</label><br/>\
										<input type="radio" id="<%= name %>-seeithearit-once-10" name="<%= name %>-seeithearit-once-frequency" value="10"><label for="<%= name %>-seeithearit-once-10"><span></span>After 10 minutes</label><br/>\
										<input type="radio" id="<%= name %>-seeithearit-once-20" name="<%= name %>-seeithearit-once-frequency" value="20"><label for="<%= name %>-seeithearit-once-20"><span></span>After 20 minutes</label><br/>\
										<input type="radio" id="<%= name %>-seeithearit-once-30" name="<%= name %>-seeithearit-once-frequency" value="30"><label for="<%= name %>-seeithearit-once-30"><span></span>After 30 minutes</label><br/>\
									</div>\
									<input type="radio" id="<%= name %>-seeithearit-periodically" name="<%= name %>-seeithearit-frequencytype" value="periodically"><label for="<%= name %>-seeithearit-periodically"><span></span>Periodically</label><br/>\
									<div class="fields" hidden>\
										<input type="radio" id="<%= name %>-seeithearit-periodically-5" name="<%= name %>-seeithearit-periodically-frequency" value="5"><label for="<%= name %>-seeithearit-periodically-5"><span></span>Every 5 minutes</label><br/>\
										<input type="radio" id="<%= name %>-seeithearit-periodically-10" name="<%= name %>-seeithearit-periodically-frequency" value="10"><label for="<%= name %>-seeithearit-periodically-10"><span></span>Every 10 minutes</label><br/>\
										<input type="radio" id="<%= name %>-seeithearit-periodically-20" name="<%= name %>-seeithearit-periodically-frequency" value="20"><label for="<%= name %>-seeithearit-periodically-20"><span></span>Every 20 minutes</label><br/>\
										<input type="radio" id="<%= name %>-seeithearit-periodically-30" name="<%= name %>-seeithearit-periodically-frequency" value="30"><label for="<%= name %>-seeithearit-periodically-30"><span></span>Every 30 minutes</label><br/>\
									</div>\
									<input type="radio" id="<%= name %>-seeithearit-permanent" name="<%= name %>-seeithearit-frequencytype" value="permanent"><label for="<%= name %>-seeithearit-permanent"><span></span>Keep on screen at all times</label><br/>\
								</div>\
								<input type="radio" id="<%= name %>-justseeit" name="<%= name %>-seeorhear" value="justseeit"><label for="<%= name %>-justseeit"><span></span>Just see it</label><br/>\
								<div class="fields" hidden>\
									<input type="radio" id="<%= name %>-justseeit-once" name="<%= name %>-justseeit-frequencytype" value="once"><label for="<%= name %>-justseeit-once"><span></span>Once</label><br/>\
									<div class="fields" hidden>\
										<input type="radio" id="<%= name %>-justseeit-once-5" name="<%= name %>-justseeit-once-frequency" value="5"><label for="<%= name %>-justseeit-once-5"><span></span>After 5 minutes</label><br/>\
										<input type="radio" id="<%= name %>-justseeit-once-10" name="<%= name %>-justseeit-once-frequency" value="10"><label for="<%= name %>-justseeit-once-10"><span></span>After 10 minutes</label><br/>\
										<input type="radio" id="<%= name %>-justseeit-once-20" name="<%= name %>-justseeit-once-frequency" value="20"><label for="<%= name %>-justseeit-once-20"><span></span>After 20 minutes</label><br/>\
										<input type="radio" id="<%= name %>-justseeit-once-30" name="<%= name %>-justseeit-once-frequency" value="30"><label for="<%= name %>-justseeit-once-30"><span></span>After 30 minutes</label><br/>\
									</div>\
									<input type="radio" id="<%= name %>-justseeit-periodically" name="<%= name %>-justseeit-frequencytype" value="periodically"><label for="<%= name %>-justseeit-periodically"><span></span>Periodically</label><br/>\
									<div class="fields" hidden>\
										<input type="radio" id="<%= name %>-justseeit-periodically-5" name="<%= name %>-justseeit-periodically-frequency" value="5"><label for="<%= name %>-justseeit-periodically-5"><span></span>Every 5 minutes</label><br/>\
										<input type="radio" id="<%= name %>-justseeit-periodically-10" name="<%= name %>-justseeit-periodically-frequency" value="10"><label for="<%= name %>-justseeit-periodically-10"><span></span>Every 10 minutes</label><br/>\
										<input type="radio" id="<%= name %>-justseeit-periodically-20" name="<%= name %>-justseeit-periodically-frequency" value="20"><label for="<%= name %>-justseeit-periodically-20"><span></span>Every 20 minutes</label><br/>\
										<input type="radio" id="<%= name %>-justseeit-periodically-30" name="<%= name %>-justseeit-periodically-frequency" value="30"><label for="<%= name %>-justseeit-periodically-30"><span></span>Every 30 minutes</label><br/>\
									</div>\
									<input type="radio" id="<%= name %>-justseeit-permanent" name="<%= name %>-justseeit-frequencytype" value="permanent"><label for="<%= name %>-justseeit-permanent"><span></span>Keep on screen at all times</label><br/>\
								</div>\
							</div>\
						'),

	initialize: function(){
//		this.model.on("change", this.render, this);
	},
	
	render: function(){
		// basic display
		this.$el.html(this.template(this.options));
		return this;
	},

	toggleEnabled: function(click) {
		var target = $(click.target);
		
		if (target.attr("checked")){
			target.siblings(".fields").hide();
			target.nextAll(".fields").first().show();
		} else {
			target.siblings(".fields").hide();
		}
		
		

//		alert(target.attr("checked"));
		
	},
	
	blurOther: function(blur) {
		this.model.updateData(blur.target.value)
	},
	
	remove: function(){
		this.$el.remove();
	},

});


//var ReminderCollectionView = Backbone.View.extend({
//
//	collection: OptionCollection,
//	
//	initialize: function() {
//		this.collection.on("add", this.addOne, this);
//	},
//
//	render: function(type){
//		this.collection.forEach(this.addOne, this);
//		return this;
//	},
//
//	addOne: function(m){
//		var gv = new RemindersView({model: m});
//		gv.render();
//		this.$el.append(gv.el);
//	},
//});



