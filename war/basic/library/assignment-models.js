var Assignment = Backbone.Model.extend({
	defaults: function() {
		return {
			id: -1,
			name: "null",
			description: "null",
			dueDate: "null",
			late: false,
			library: "null",
			resource: "null",
			timeCreated: "null",
		}
	},
});

var AssignmentCollection = Backbone.Collection.extend({
	model: Assignment,
});