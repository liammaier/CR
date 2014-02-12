$(document).ready(function() {
	
	$("#searchBtn").click(function() {
		
		$("#logTableContainer").html("<i>Loading...</i>");
		
		 $.post("getLogsForUser", {email: $("#emailTextbox").val()}, function(data) {
			 var logCollection = new LogCollection(data);
			 var logCollectionView = new LogCollectionView({ collection: logCollection });
			 $("#logTableContainer").html(logCollectionView.render().el);
		 });
		
	});
	
});