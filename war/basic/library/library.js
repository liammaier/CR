
var resourceCollection;
var resourceCollectionView;
var resourceDropdownCollection;
var resourceDropdownCollectionView;
var library;

$(document).ready(function(){
		
	$('#spinnerbox').fadeIn("fast");
	
	var libId = getURLParameter("lib");	

	$.get("/getResources", {libId: libId, inlibrary: true}, function(data){
		if (data != null && data.length != 0) {
			resourceCollection = new ResourceCollection(data);
			resourceCollectionView = new UserResourceCollectionView({ collection: resourceCollection });
			resourceCollectionView.render();
			$("#resourcesSection").html(resourceCollectionView.el);
			$("#spinnerbox").hide();
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


function getURLParameter(name) {
    return decodeURI((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}