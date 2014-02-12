var Library = Backbone.Model.extend({
	urlRoot: "/updateLibrary",
	defaults: function(){
		return {
			id: -1,
			name: "null",
			description: "null",
			type: "null",
			resources: "null",
			role:"null",
			members: "null",
			leaders: "null",
			banlist: "null",
			hasSchedule: "false",
			timeCreated: "null",
		}
	},
});

var LibraryCollection = Backbone.Collection.extend({
	model: Library,
});