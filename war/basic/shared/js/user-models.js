var User = Backbone.Model.extend({
	defaults: function() {
		return {
			id: -1,
			userEmail: "null",
			email: "null",
			name: "null",
			nickname: "null",
			resources: "null",
			seenTutorial: false,
			timeCreated: "null",
			highlightsNum: 0,
			notesNum: 0,
			sectionsRead: 0,
		}
	},
	
});

var UserCollection = Backbone.Collection.extend({
	model: User,
});

