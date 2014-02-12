
$(document).ready(function() {

	var libs;
	
	// Global functions
	Handler = {};
	
	// Get the libraries that the user is in
	$.post("/getLibraries", function(data){
		libs = data;
		// initialize library view
		var libCollection = new LibraryCollection(data);
		var libCollectionView = new LibraryStatCollectionView({collection: libCollection});
		$("#libbox").append(libCollectionView.render().el);
	});
	
	// Set up the users window
	var userCollection = new UserCollection();
	var userCollectionView = new UserCollectionView({ collection: userCollection });
	$("#userbox").html(userCollectionView.render().el);
	
	// Set up the user progress window
	var userProgressCollection = new UserProgressCollection();
	var userProgressCollectionView = new UserProgressCollectionView({ collection: userProgressCollection });
	$("#progbox").html(userProgressCollectionView.render().el);
	
	Handler.changeUsers = function(users, lib){
		userCollection = new UserCollection(users);
		userCollection.libID = lib;
		userCollectionView = new UserCollectionView({ collection: userCollection });
		$("#userbox").html(userCollectionView.render().el);
	}
	
	Handler.changeProgress = function(progress){
		userProgressCollection = new UserProgressCollection(progress);
		userProgressCollectionView = new UserProgressCollectionView({ collection: userProgressCollection });
		$("#progbox").html(userProgressCollectionView.render().el);
	}
	
	
	
	
	
	
	
	
	// Text updates and JavaScript calls
	createUserbar();
	
	// Button click listeners
	$("#backBtn").click(function() {
		window.location.href = "/menu";
	});
	
});