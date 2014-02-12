
var resourceCollection;
var resourceCollectionView;
var resourceDropdownCollection;
var resourceDropdownCollectionView;
var library;

$(document).ready(function(){
	
	var libId = getURLParameter("lib");
	library = new Library({id:libId});
	library.fetch({
	    error: function(model, response) {
	        console.log(response);
	    },
	    success: function(model, response)  {
	    	$(".title").html(model.get("name"));
	    }
	});
	
	
	$.get("/getResources", {libId: libId, inlibrary: true}, function(data){
		resourceCollection = new ResourceCollection(data);
		resourceCollectionView = new ManageResourceCollectionView({ collection: resourceCollection });
		resourceCollectionView.render();
		$("#resourcesSection").html(resourceCollectionView.el);
		
		// Fill up the add resource button
		$.get("/getResources", {libId: libId, inlibrary: false}, function(data2){
			resourceDropdownCollection = new ResourceCollection(data2);
			resourceDropdownCollectionView = new ResourceDropdownCollectionView({ collection: resourceDropdownCollection });
			resourceDropdownCollectionView.render();
			$("#addResourceButtonGroup").append(resourceDropdownCollectionView.el);
			$(".resourceTitle").dotdotdot();
			$(".desc").dotdotdot();
			$('.removeResourceBtn').tooltip({ title: "Remove resource" });
		});
		
	});
	

	// Get the user
	var user;
	createUserbar();
	
	

	// Text updates and JavaScript calls
	$("#toprightDate").html("<div class='date'>Today's date: " + new Date().toLocaleDateString() + "</div>");
	
	setTimeout(function(){btnListeners();},"400");
	
});




function getURLParameter(name) {
    return decodeURI((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}


//all listeners
function btnListeners() {
	// Button click listeners
	
	$("#articleBtn").click(function() {
		window.location.href = "/articles?lib=" + getURLParameter("lib");
	});
	
	$("#backBtn").click(function() {
		window.location.href = "/menu";
	});
}
