var Highlight = Backbone.Model.extend({
	
	defaults: function() {
		return {
			completesentences: "null",
			sentenceOffset: 0,
			question: "",
			answer: "",
			type: "new",
			instructor: false,
			contents: "null",
			sectionNum: -1,
			sectionID: "null",
			annotation: "",
			timeCreated: "null",
			reviewed: false,
			othertype: "",
		}
	},
	urlRoot: "/updateHighlight",
	clear: function() {
        this.destroy();
    },
    
});

var HighlightCollection = Backbone.Collection.extend({
	model: Highlight,
	url: "/updateHighlight",
	sectionID: -1,
});
