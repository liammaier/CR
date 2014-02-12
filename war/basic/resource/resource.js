function getURLParameter(name) {
    return decodeURI((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

$(document).ready(function(){
	
	$.post("/getContent", {resourceID: getURLParameter("r")}, function(data){
		var contentCollection = new ContentCollection(data);
		var contentCollectionView = new ContentCollectionView({ collection: contentCollection });
		contentCollectionView.render();
		$("#resourcesSection").html(contentCollectionView.el);
		
		resizeElements();
	});
		
	// Text updates and JavaScript calls
	createUserbar();
	
	
	// Button click listeners
	$("#backBtn").click(function() {
		window.location.href = "/menu";
	});
	
	
	
	// Resize functions
	resizeElements = function(){
		//$('.chapDesc').width($(window).width() - 200);
	};
	$(window).resize(function(){
		resizeElements();
	});

	resizeElements();
	
	$.post("/log", {type: "resourcepage", strategy: "menus", contentkey: "", sectionkey: "", data1: "", data2: getURLParameter('r')});
	
});