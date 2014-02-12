
var libraryCollection;
var libraryCollectionView;
var resourceDropdownCollection;
var resourceDropdownCollectionView;
var library;

$(document).ready(function(){
	$('#spinnerbox').fadeIn("fast");
	
	$.get("/getLibraries", {}, function(data){
		if (data != null && data.length != 0) {
			libraryCollection = new LibraryCollection(data);
			libraryCollectionView = new LibraryCollectionView({ collection: libraryCollection });
			libraryCollectionView.render();
			$("#libraries").html(libraryCollectionView.el);
			$('#spinnerbox').hide();
		}	
	});
	

	// Get the user
	var user;
	createUserbar();
	
	btnListeners();
	
	$.post("/log", {type: "userlibrary", strategy: "menus", contentkey: "", sectionkey: "", data1: "", data2: ""});
	
});

//all listeners
function btnListeners() {
	// Button click listeners
	
	$("#backBtn").click(function() {
		window.location.href = "/menu";
	});
}
