//essentially a section summary
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
});

//essentially a section
var NoteCollection = Backbone.Collection.extend({
	model: Note,
})

var Section = Backbone.Model.extend({
	defaults: function() {
		return {
			title: "",
			collection: NoteCollection,
		}
	},
});

// essentially a content
var SectionCollection = Backbone.Collection.extend({
	model: Section,
})

var Content = Backbone.Model.extend({
	defaults: function() {
		return {
			title: "",
			collection: SectionCollection,
		}
	},
});