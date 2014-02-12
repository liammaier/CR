console.log('doing long ajax call');
$.post("/getSectionSummaryByChapter", {}, function(data){ console.log("done"); appendTable(data); $('#spinnerbox').remove(); });

function appendTable(data){
	var contentTableId = "";
	var sectionTableId = "";
	
	
	// build table for each content
	for (var i = 0; i < data.length; i++) {
    	contentTableId = data[i].name.replace(/[^a-zA-Z0-9]/g, "_");
    	var curSections = data[i].sections;
		// console.log(contentTableId)
		
		//$('body').append('<table id='+ contentTableId + ' style="width: 900px;border-style:solid;border-width:5px;"><tr style="border-style:solid;border-width:5px;"><td>' + data[i].name + '</td></tr></table>')
		var curContent = new Content();
    	var curSectionCollection = new SectionCollection();
    	
		// build table for each section
		for (var j = 0; j < curSections.length; j++){
			sectionTableId = curSections[j].name.replace(/[^a-zA-Z0-9]/g, "_");
			// console.log(curSections[j])
			var listOfSectSum = curSections[j].sectionSummaries;
			var curSection = new Section({title: curSections[j].name});
			var curNoteCollection = new NoteCollection();
			
			for (var k = 0; k < listOfSectSum.length; k++){
				console.log(listOfSectSum[k]);
				curNoteCollection.add(new Note(listOfSectSum[k]));
			}
			
			curSection.set("collection", curNoteCollection)

			var curSectionView = new SectionView({model : curSection});
			curSectionCollection.add(curSection);
		}
		curContent.set('collection', curSectionCollection);
		curContent.set('title', data[i].name);
		var curContentView = new ContentView({model: curContent});
		curContentView.render();
		console.log(curContentView.el);
		$('body').append(curContentView.el);
	}
}