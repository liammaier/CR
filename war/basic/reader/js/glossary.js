function getURLParameter(name) {
    return decodeURI((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

$(document).ready(function() {

	$.post("/getGlossaryItems", {contentID: getURLParameter("c")}, function(data) {
		var glossaryItemCollection = new GlossaryItemCollection(data);
		var glossaryItemCollectionView = new GlossaryItemCollectionView({ collection: glossaryItemCollection });
		$("body").html(glossaryItemCollectionView.render().el);
	});
	
});