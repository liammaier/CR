var Reminder = Backbone.Model.extend({
	defaults: function() {
		return {
			message: "",
		}
	},
	clear: function() {
        this.destroy();
    },
});

var ReminderCollection = Backbone.Collection.extend({
	model: Reminder,
})
