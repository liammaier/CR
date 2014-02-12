var Question = Backbone.Model.extend({
	defaults: function() {
		return {
			id:-1,
			question: "",
			answer: null,
			practice: false,
		}
	},
});

var QuestionCollection = Backbone.Collection.extend({
	model: Question,
});