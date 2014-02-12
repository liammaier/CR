var Log = Backbone.Model.extend({
	defaults: function() {
		return {
			id: -1,
			email: "",
			type: "",
			content: "",
			timeCreated: "",
		}
	},
});

var LogCollection = Backbone.Collection.extend({
	model: Log,
});