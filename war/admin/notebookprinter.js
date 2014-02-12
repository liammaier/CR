$(document).ready(function() {
	
	$("#searchBtn").click(function() {
		
		$("#notebook-text").html("<i>Loading...</i>");
		$.post("/getNotebookDataForUser", {email: $("#usernameDropdown").val(), contentID: $("#contentDropdown").val()}, function(data) {
			// Data is now an array of JSONs, where each JSON holds the name of the section, notes and highlights arrays for the section, and the section summary for the section
			$("#notebook-text").html("");
			console.log(data);
			for(var i = 0; i < data.length; i++){
				// add them all to section views and render
				var printableSectionView = new PrintableSectionView({ model: new Section(data[i]) });
				$("#notebook-text").append(printableSectionView.render().el);
			}
		});
		
	});
	
});