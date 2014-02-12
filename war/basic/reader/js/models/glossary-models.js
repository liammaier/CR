var GlossaryItem = Backbone.Model.extend({
	defaults: function() {
		return {
			name: "",
			description: "",
		}
	}
});

var GlossaryItemCollection = Backbone.Collection.extend({
	model: GlossaryItem,
});