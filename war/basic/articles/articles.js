function getURLParameter(name) {
    return decodeURI((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}


$(document).ready(function(){
	
	// Set up chapters
	$.post("/getArticles", {libID: getURLParameter("lib")}, function(data){
		var articleCollection = new ContentCollection(data);
		var articleCollectionView = new ContentCollectionView({ collection: articleCollection });
		articleCollectionView.render();
		$("#resourcesSection").html(articleCollectionView.el);
		
		resizeElements();
	});
	
	
	// Text updates and JavaScript calls
	createUserbar();
	
	
	// Button click listeners
	$("#backBtn").click(function() {
		window.location.href = "/menu";
	});
	
	$(".goBtn").click(function() {
		
		window.location.href = "/b/reader?lib=" + getURLParameter("lib");
	});

	
	// Resize functions
	resizeElements = function(){
		$('.articleDesc').width($(window).width() - 200);
	};
	$(window).resize(function(){
		resizeElements();
	});

	resizeElements();
	
});