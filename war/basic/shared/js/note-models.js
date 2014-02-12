var Note = Backbone.Model.extend({
	defaults: function() {
		return {
			contents: "",
			type: "null",
			section: null,
			sectionID: null,
			reviewed: false,
			instructor: false,
		}
	},
	urlRoot: "/updateNote",
	clear: function() {
        this.destroy();
    },
});

var NoteCollection = Backbone.Collection.extend({
	model: Note,
	type: "List",
	sectionID: -1,
	sectionNum: -1,
	url: "/updateNote",
})
