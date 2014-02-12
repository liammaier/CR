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
		if (CR.offlineHL){
			this.removeLocalStorageHL();
		}
		
        this.destroy({error: function(model, response){
        	CR.offlineHL = true;
        	
			// find the model from hightlights and save it (with cid) in the localStorage
			if (!localStorage.listsRemove) localStorage.listsRemove = JSON.stringify([]);
			var notes = JSON.parse(localStorage["listsRemove"]);
			notes.push(model);
			localStorage["listsRemove"] = JSON.stringify(notes);
        }});
    },
    
	// traverses Notes in local storage and remove the Note, return true when success; false otherwise
	removeLocalStorageHL: function(){
		if (!localStorage.lists) localStorage.lists = JSON.stringify([]);
		var notes = JSON.parse(localStorage["lists"]);
		
		for (var i = 0; i < notes.length; i++){
			// remove the highlight when found in the highlights array
			if (this.cid == notes[i].cid){
				notes.splice(i, 1);
				localStorage["lists"] = JSON.stringify(notes);
				return true;
			}
		}
		
		return false;
	},
});

var NoteCollection = Backbone.Collection.extend({
	model: Note,
	type: "List",
	sectionID: -1,
	sectionNum: -1,
	url: "/updateNote",
    //localStorage: new Store("notes-backbone"),
})
