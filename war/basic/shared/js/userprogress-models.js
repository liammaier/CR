var UserProgress = Backbone.Model.extend({
	defaults: function(){
		return {
			id: -1,
			resourceName: "",
			contentName: "",
			chapterNum: 0,
			notesNum: 0,
			highlightsNum: 0,
			minutesNum: 0,
			lastUpdated: "",
			curSection: 0,
/*here*/	sectionsRead: 0,
			sectionHighLigted: 0,
		}
	},
});

var UserProgressCollection = Backbone.Collection.extend({
	model: UserProgress,
});