
var resourceCollection;
var resourceCollectionView;
var resourceDropdownCollection;
var resourceDropdownCollectionView;
var library;

$(document).ready(function(){
		
	$.get("/getallresources", {}, function(data){
		if (data != null && data.length != 0) {
			resourceCollection = new ResourceCollection(data);
			resourceCollectionView = new UserResourceCollectionView({ collection: resourceCollection });
			resourceCollectionView.render();
			$("#resourcesSection").html(resourceCollectionView.el);
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
