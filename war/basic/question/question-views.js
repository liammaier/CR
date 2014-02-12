var QuestionView = Backbone.View.extend({
	
	model: Question,
	tagName: "div",
	className: "question well",
	timeStarted: 0,

	events: {
		"click .trueBtn": "sendTrue",
		"click .falseBtn": "sendFalse",
	},

	template: _.template("<% if(practice) { %> <i class='topright'>PRACTICE</i> <% } %>" +
						"<h3><%= question %></h3><br>" +
						 "<center>" +
							 "<input type='button' class='btn btn-large btn-success trueBtn'  value='True'/>" +
							 "<input type='button' class='btn btn-large btn-danger  falseBtn' value='False'/>" +
						 "</center>"),

	initialize: function(){
		this.model.on("change", this.render, this);
		timeStarted = new Date();
	},
	
	sendTrue: function() {
		this.model.set({ answer: true });
		this.sendResult();
	},
	
	sendFalse: function() {
		this.model.set({ answer: false });
		this.sendResult();
	},
	
	sendResult: function() {
		$.post("/saveAnswer", {questionId: this.model.get("id"), answer: this.model.get("answer"), timeTaken: new Date() - timeStarted});
		this.$el.fadeOut("fast", function() {
			loadNextQuestion();
		});
	},

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	remove: function(){
		this.$el.remove();
	},
	
});