
CR = {};
CR.events = _.extend({},Backbone.Events);

// Not sure why this is in the collection views.
function btnListeners() {}


$(document).ready(function(){
	
	// Text updates and JavaScript calls
	createUserbar();
	
	// Button click listeners
	$("#backBtn").click(function() {
		window.location.href = "/menu";
	});
	
	var resourceCollection, resourceCollectionView;
	
	$.get("/getallresources", {chapters: true}, function(data){
		if (data != null && data.length != 0) {
			resourceCollection = new ResourceCollection(data);
			resourceCollectionView = new SuperbookResourceCollectionView({ collection: resourceCollection });
			
			// hide the spinner and show the start button
			$("#loading").hide();
			document.getElementById("Start").style.display="block";
			
			resourceCollectionView.render();
			$("#books").html(resourceCollectionView.el);
		}
	});
	
	var totalchapters = 0;
	var receivedchapters = 0;
	
	$("#Start").click(function() {
		
		// find all the resources marked for review
		var toReviewResourceCollection = new ResourceCollection(resourceCollection.filter(function(cur){
			return cur.get("toReview") != "none";
		}));

		// if any exist, continue
		if (toReviewResourceCollection.length > 0) {

			$("#step1").fadeOut(300, function(){
				// Start a spinner
				$("#loading").show();
				// Root through the collections, remove things that aren't being reviewed
				var i = 0;
	
				toReviewResourceCollection.each(function(resource) {
					// Filter the chapters
					var chapterCollection = resource.get("chapters");
					var toremove = new Array();
					chapterCollection.forEach(function(chapter){
						if(chapter.get("toReview") == "none"){
							toremove.push(chapter);
						}
					});
					chapterCollection.remove(toremove);
					totalchapters += chapterCollection.length;
					
					chapterCollection.each(function(chapter){
						// Filter the sections
						var sectionCollection = chapter.get("sections");
						toremove = new Array();
						sectionCollection.forEach(function(section){
							if(section.get("toReview") == "none"){
								toremove.push(section);
							}
						});
						sectionCollection.remove(toremove);
						
						// Get highlights, list for each chapter as a batch
						var models = sectionCollection.pluck("id");
						$.ajax({
							type: "POST",
							url: "/getSNdata",
							dataType: "json",
							data: {sections: JSON.stringify(models)},
							success: function(data){
								for(var x = 0; x < data.length; x++){
									if(sectionCollection.at(x) != undefined){
										var highColl = new HighlightCollection(data[x].highlights);
										var listColl = new NoteCollection(data[x].list);
										sectionCollection.at(x).set({highlights: highColl, notes: listColl});
									}
								}
								receivedchapters ++;
								if(receivedchapters >= totalchapters){
									// resourceCollection is now ready to rumble
									var finalResourceCollectionView = new ResourceCollectionViewSN({ collection: toReviewResourceCollection });
									$("#leftColumn").prepend(finalResourceCollectionView.render().el);
									
									var finalChapterCollection = new ContentCollection();
									for(var l = 0; l < toReviewResourceCollection.length; l++){
										var chapterArray = toReviewResourceCollection.at(l).get("chapters").models;
										for(var m = 0; m < chapterArray.length; m++){
											chapterArray[m].set("resource", toReviewResourceCollection.at(l).get("title"));
										}
										finalChapterCollection.add(chapterArray);
									}
									finalChapterCollectionView = new ChapterCollectionView({ collection: finalChapterCollection });
									$("#rightColumn").html(finalChapterCollectionView.render().el);
									$("#loading").hide();
									$("#mainBody").fadeIn(300);
								}
							},
						});
					});
					
				});
				
			});

		} else {
			alert ("Please choose at least one section");
		}
		
		

		
		
	});
	
	/* END */
	
	
	
	/* MAIN JS */
	var highPopView = new HighlightPopupView({model: new Highlight()});
	
	
});