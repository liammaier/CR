var Highlight = Backbone.Model.extend({
	urlRoot: "/updateHighlight",
	defaults: function() {
		return {
			startContainer: "null",
			endContainer: "null",
			startOffset: "null",
			endOffset: "null",
			initialParent: "null",
			completesentences: "null",
			sentenceOffset: 0,
			question: null,
			answer: "",
			type: "new",
			othertype: "",
			instructor: false,
			contents: "null",
			sectionNum: -1,
			sectionID: "null",
			annotation: "",
			timeCreated: "null",
			reviewed: false,
		}
	},
	initialize:function(){
		//put the spans in the html if we need highlighting
		CR.events.bind("contentLoaded", this.preprocess, this);
	},
	clear: function() {
		// if off-line highlighting enabled, check whether this model is in the local storage
		// and remove it if it is in the local storage
		if (CR.offlineHL){
			this.removeLocalStorageHL();
		}
		
        this.destroy({error: function(model, response) {
        	CR.offlineHL = true;
			// put into local storage to be destroy later 
			if (!localStorage.highlightsRemove) localStorage.highlightsRemove = JSON.stringify([]);
			var highlights = JSON.parse(localStorage["highlightsRemove"]);
			highlights.push(model);
			localStorage["highlightsRemove"] = JSON.stringify(highlights);
        }});
    },
    /**FUNCTIONS FOR HIGHLIGHTING IN THE TEXT**/
    //Highlights the given range as specified by its offsets.
	showHighlight : function(color){
		this.placeHighlightSpans(color);
		this.highlight(color);
		//clears the user selection
		var sel = window.getSelection();
		sel.removeAllRanges();
		
		// fade it if necessary
		if (CR.highlightFilter === "all") {
			return;
		} else if (CR.highlightFilter === "fade") {
			this.fadeHighlight();
		} else if (CR.highlightFilter !== this.get("type")) {
			this.fadeHighlight();
		}
		
	},
	
    //Removes the highlight for the given id.
	removeHighlight: function(id_type){
		var id = this.get("id");
		// Use client id if normal id is not set yet OR if id_type == "cid"
		if(id == null || id_type == "cid"){
			id = this.cid;
		}
		CR.controllerView.readerView.$el.find("[data-highlightgroup=" + id + "]").contents().unwrap();
		
		CR.controllerView.readerView.$el.find("[data-sara-start-marker=" + id + "]").remove();
		
		CR.controllerView.readerView.$el.find("[data-sara-end-marker=" + id + "]").remove();
		
		// TODO: move this?
		this.removeHeatmapHighlight(id_type, "#heatmapUsersContentContainer");
		this.removeHeatmapHighlight(id_type, "#heatmapContentContainer");
	},
	
	removeHeatmapHighlight: function(id_type, divid){
		var id = this.get("id");
		// Use client id if normal id is not set yet OR if id_type == "cid"
		if(id == null || id_type == "cid"){
			id = this.cid;
		}
		CR.controllerView.heatmapView.$el.find(divid).find("[data-highlightgroup=" + id + "]").contents().unwrap();
		
		CR.controllerView.heatmapView.$el.find(divid).find("[data-sara-start-marker=" + id + "]").remove();
		
		CR.controllerView.heatmapView.$el.find(divid).find("[data-sara-end-marker=" + id + "]").remove();
	},
	
	highlight : function(color){
		if(color == null){
			color = "yellow";
		}
		if (this.get('id')){
			CR.controllerView.readerView.$el.find("[data-highlightgroup="+this.get("id")+"]").css("background-color", color).attr("class","highlight");
		}else{
			CR.controllerView.readerView.$el.find("[data-highlightgroup="+this.cid+"]").css("background-color", color).attr("class","highlight");
		}
	},
	unhighlight : function(){
		$("[data-highlightgroup="+this.get("id")+"]").css("background-color", "");
	},
	fadeHighlight : function(){
		$("[data-highlightgroup="+this.get("id")+"]").css("background-color", "rgba(255,255,0,.2)");
	},
	
	/**END OF FUNCTIONS FOR HIGHLIGHTING IN THE TEXT**/
	
	/**HELPER FUNCTIONS THAT DO PARTS OF HIGHLIGHTING**/
	//when a highlight needs to be put in the text
    placeHighlightSpans : function(color){
		if (color == null){
			color = 'yellow'
		}

		var startContainer = CR.controllerView.readerView.$el.find("[data-sara-original=" + this.get("startContainer")+"]").get(0);
		var endContainer = CR.controllerView.readerView.$el.find("[data-sara-original=" + this.get("endContainer")+"]").get(0);
		var startOffset = this.get("startOffset")
		var endOffset =  this.get("endOffset")
		var id = this.get("id");
		// If the id is null, this means we just created the highlight, so use the cid.
		if(id == null){
			id = this.cid;
		}

		var element1 = document.createElement ("span");
		element1.className = "highlightMarker";
		$(element1).attr("data-sara-start-marker", id);
		$(element1).attr("data-highlightgroup", id);

		var element2 = document.createElement ("span");
		element2.className = "highlightMarker";
		$(element2).attr("data-sara-end-marker", id);

		this.addElementAtLocation(element1, startContainer, startOffset);
		this.addElementAtLocation(element2, endContainer, endOffset);
		
		var startNode = CR.controllerView.readerView.$el.find("[data-sara-start-marker=" + id + "]").get(0);
		var endNode = CR.controllerView.readerView.$el.find("[data-sara-end-marker=" + id + "]").get(0);
		var textNodes = this.getTextNodesBetween(startNode, endNode);
		for(var i = 0; i < textNodes.length; ++i){
			$(textNodes[i]).wrap("<span style='background-color: "+ color +"' data-highlightgroup='" + id + "'/>");
		}
		
		// TODO: do we want this?
		if (this.get('type') == 'main' || this.get('type') == 'new'){
			this.placeHeatmapHighlightSpans(true, "#heatmapUsersContentContainer");
			this.placeHeatmapHighlightSpans(true, "#heatmapContentContainer");
		}
	},
	
	// place highlight span in the heatmap
	placeHeatmapHighlightSpans : function(cloud, divid){
		if (cloud){
			style = "border-style:dotted none"
		}else{
			style = "background-color:rgba(255, 50, 50, 0.15)";
		}

		var startContainer = CR.controllerView.heatmapView.$el.find(divid).find("[data-sara-original=" + this.get("startContainer")+"]").get(0);
		var endContainer = CR.controllerView.heatmapView.$el.find(divid).find("[data-sara-original=" + this.get("endContainer")+"]").get(0);
		var startOffset = this.get("startOffset")
		var endOffset =  this.get("endOffset")
		var id = this.get("id");
		// If the id is null, this means we just created the highlight, so use the cid.
		if(id == null){
			id = this.cid;
		}

		var element1 = document.createElement ("span");
		element1.className = "highlightMarker";
		$(element1).attr("data-sara-start-marker", id);
		$(element1).attr("data-highlightgroup", id);

		var element2 = document.createElement ("span");
		element2.className = "highlightMarker";
		$(element2).attr("data-sara-end-marker", id);

		this.addElementAtLocation(element1, startContainer, startOffset);
		this.addElementAtLocation(element2, endContainer, endOffset);
		
		var startNode = CR.controllerView.heatmapView.$el.find(divid).find("[data-sara-start-marker=" + id + "]").get(0);
		var endNode = CR.controllerView.heatmapView.$el.find(divid).find("[data-sara-end-marker=" + id + "]").get(0);
		var textNodes = this.getTextNodesBetweenHeatmap(startNode, endNode, divid);
		for(var i = 0; i < textNodes.length; ++i){
			$(textNodes[i]).wrap("<span style='" + style + "' data-highlightgroup='" + id + "'/>");
		}
	},
	
	//Adds an html node to the given location using SARA offsets.
	addElementAtLocation:function (node, container, offset){
		if(offset == 0){
			var textNodes = this.getTextNodesInContainer(container);
			$(node).insertBefore(textNodes[0]);
			return;
		}

		var charCount = 0; //position in text
		var textNodes = this.getTextNodesInContainer(container);

		for(var i = 0; i < textNodes.length; ++i){
			if(charCount+textNodes[i].nodeValue.length < offset){
				charCount += textNodes[i].nodeValue.length;
			}else if(charCount+textNodes[i].nodeValue.length == offset){
				$(node).insertAfter(textNodes[i]);    
				return;
			}else{
				var textNodeRight = textNodes[i].splitText(offset-charCount);
				$(node).insertBefore(textNodeRight)
				return;
			}
		}
		console.log("Invalid Offset Given");
		$(node).insertAfter(textNodes[textNodes.length-1]); //just attach to the end if invalid
		
		
	},
	//Returns an array of all textnodes inside the given node.
	getTextNodesInContainer : function(node) {
		var textNodes = [];
		var that = this;
		function getTextNodes(node) {
			if(node != null){
				if( node.nodeType == 3) {
					if(that.isValidTextNode(node)){
						textNodes.push(node)
					}
				}else{
					for (var i = 0; i < node.childNodes.length; ++i) {
						getTextNodes(node.childNodes[i]);
					}
				}
			}
		}
		getTextNodes(node);
		return textNodes;
	},
	//This function checks the textnode to see if it should be included in a user selection.
	isValidTextNode : function(textnode){
		if($(textnode).parents(".pageBreak").length != 0) return false;
		if($(textnode).parents("[data-sara-highlight=ignore]").length != 0) return false;

		return true;
	},
	
	//Returns an array of all textnodes between two nodes, not including the contents inside the start and end nodes.
	getTextNodesBetweenHeatmap : function(startNode, endNode, divid) {
		var rootNode = CR.controllerView.heatmapView.$el.find(divid)[0];
		var pastStartNode = false;
		var reachedEndNode = false;
		var textNodes = [];
		
		function isValidTextNode(textnode){
			if($(textnode).parents(".pageBreak").length != 0) return false;
			if($(textnode).parents("[data-sara-highlight=ignore]").length != 0) return false;

			return true;
		};

		function getTextNodes(node) {
			if (node == startNode) {
				pastStartNode = true;
			} else if (node == endNode) {
				reachedEndNode = true;
			} else if (node.nodeType == 3) {
				if (pastStartNode && !reachedEndNode) {
					if(isValidTextNode(node)) textNodes.push(node)
				}
			} else {
				for (var i = 0, len = node.childNodes.length; !reachedEndNode && i < len; ++i) {
					getTextNodes(node.childNodes[i]);
				}
			}
		}
		getTextNodes(rootNode);
		return textNodes;
	},
	
	//Returns an array of all textnodes between two nodes, not including the contents inside the start and end nodes.
	getTextNodesBetween : function(startNode, endNode) {
		var rootNode = CR.readerView.el;
		var pastStartNode = false;
		var reachedEndNode = false;
		var textNodes = [];
		
		function isValidTextNode(textnode){
			if($(textnode).parents(".pageBreak").length != 0) return false;
			if($(textnode).parents("[data-sara-highlight=ignore]").length != 0) return false;

			return true;
		};

		function getTextNodes(node) {
			if (node == startNode) {
				pastStartNode = true;
			} else if (node == endNode) {
				reachedEndNode = true;
			} else if (node.nodeType == 3) {
				if (pastStartNode && !reachedEndNode) {
					if(isValidTextNode(node)) textNodes.push(node)
				}
			} else {
				for (var i = 0, len = node.childNodes.length; !reachedEndNode && i < len; ++i) {
					getTextNodes(node.childNodes[i]);
				}
			}
		}
		getTextNodes(rootNode);
		return textNodes;
	},
	/**END OF HELPER FUNCTIONS THAT DO PARTS OF HIGHLIGHTING**/
	
	// traverses highlights in local storage and update if the highlight is found; otherwise, add to the local storage
	updateLocalStorageHL: function(){
		if (!localStorage.highlights) localStorage.highlights = JSON.stringify([]);
		var highlights = JSON.parse(localStorage["highlights"]);
		
		for (var i = 0; i < highlights.length; i++){
			if (this.cid == highlights[i].cid){
				highlights[i].model = this;
				localStorage["highlights"] = JSON.stringify(highlights);
				return true;
			}
		}
		
		highlights.push({cid: this.cid, model: this});
		localStorage["highlights"] = JSON.stringify(highlights);	
	},
	
	// traverses highlights in local storage and remove the highlight, return true when success; false otherwise
	removeLocalStorageHL: function(){
		if (!localStorage.highlights) localStorage.highlights = JSON.stringify([]);
		var highlights = JSON.parse(localStorage["highlights"]);
		
		for (var i = 0; i < highlights.length; i++){
			// remove the highlight when found in the highlights array
			if (this.cid == highlights[i].cid){
				highlights.splice(i, 1);
				localStorage["highlights"] = JSON.stringify(highlights);
				return true;
			}
		}
		
		return false;
	},
});

var HighlightCollection = Backbone.Collection.extend({
	model: Highlight,
	url: "/updateHighlight",
	sectionID: -1,
	
	/**FUNCTIONS FOR HIGHLIGHTING IN THE TEXT**/
    //Takes a user selection, gets the range, then converts it into something
	//that we can use to highlight
	
	//Removes all highlights in the text.
	removeAllHighlights : function(){
		$("[data-highlightgroup]").contents().unwrap();
		$("[data-sara-start-marker]").remove();
		$("[data-sara-end-marker]").remove();
	},
	
	/**END OF FUNCTIONS FOR HIGHLIGHTING IN THE TEXT**/
	
	/**HELPER FUNCTIONS THAT DO PARTS OF HIGHLIGHTING**/
	

	//This function checks the textnode to see if it should be included in a user selection.
	isValidTextNode : function(textnode){
		if($(textnode).parents(".pageBreak").length != 0) return false;
		if($(textnode).parents("[data-sara-highlight=ignore]").length != 0) return false;

		return true;
	},

	//Returns the character offset relative to a containing node. 
	getCharOffsetRelativeTo : function(container, textNode, offset){
		var charOffset = offset;
		var cur = this.getPreviousTextNode(textNode);	
		while(this.isAncestor(cur, container)){
			charOffset += cur.nodeValue.length;
			cur = this.getPreviousTextNode(cur);
		}
		return charOffset;
	},

	//Checks to see if the second node is an ancestor of the first.
	isAncestor : function(decendant, ancestor){
		return ($(decendant).closest(ancestor).length == 1)? true : false;
	},
	

	//Returns an array of all textnodes between two nodes, not including the contents inside the start and end nodes.
	getTextNodesBetween : function(startNode, endNode) {
		var rootNode = document.body;
		var pastStartNode = false;
		var reachedEndNode = false;
		var textNodes = [];

		function getTextNodes(node) {
			if (node == startNode) {
				pastStartNode = true;
			} else if (node == endNode) {
				reachedEndNode = true;
			} else if (node.nodeType == 3) {
				if (pastStartNode && !reachedEndNode) {
					if(isValidTextNode(node)) textNodes.push(node)
				}
			} else {
				for (var i = 0, len = node.childNodes.length; !reachedEndNode && i < len; ++i) {
					getTextNodes(node.childNodes[i]);
				}
			}
		}
		getTextNodes(rootNode);
		return textNodes;
	},
	//Returns the closest text node to the left of the given node.
	getPreviousTextNode : function(node){
		var that = this;
		var returnNode = null;
		function searchNode(n){
			if(n.nodeType == 3 && that.isValidTextNode(n)){
				returnNode = n;
			}else{
				for(var i = n.childNodes.length-1; i >= 0 && returnNode == null; --i) {
					searchNode(n.childNodes[i]);
				}
			}
		}
		function searchLeft(n){
			if(n.previousSibling == undefined){
				searchLeft(n.parentNode);
			}else{
				var sybling = n.previousSibling;
				searchNode(sybling);
				if(returnNode == null) searchLeft(sybling);
			}
		}
		searchLeft(node);
		return returnNode;
	},
	//Returns the closest text node to the right of the given node.
	getNextTextNode : function(node){
		var returnNode = null;
		function searchNode(n){
			if(n.nodeType == 3 && isValidTextNode(n)){
				returnNode = n;
			}else{
				for(var i = 0; i < n.childNodes.length && returnNode == null; ++i) {
					searchNode(n.childNodes[i]);
				}
			}
		}
		function searchRight(n){
			if(n.nextSibling == undefined){
				searchRight(n.parentNode);
			}else{
				var sybling = n.nextSibling;
				searchNode(sybling);
				if(returnNode == null) searchRight(sybling);
			}
		}
		searchRight(node);
		return returnNode;
	},
	//deletes the temp highlight if it is not being played by tts, otherwise let tts function do it
	deleteTempHighlight:function() {
		//document.getElementById('documentContent').normalize();
		if(tempHighlight && tempHighlight != tts.currPlayingRange) sara.removeHighlightById(tempHighlight.id)
		tempHighlight = null;
	},
	//removes a highlight in the reader given a an id
	removeHighlight : function(id){
		var highlight = this.get(id);
		//remove from the text
		highlight.removeHighlight();
		highlight.removeHeatmapHighlight(null, "#heatmapUsersContentContainer");
		highlight.removeHeatmapHighlight(null, "#heatmapContentContainer");
		//then from the collections
		this.remove(id)
	},
	textById : function(id){
		return $("[data-highlightgroup="+id+"]").text();
	},

	// @param: fromHeatmap whether it's called from heatmap
	// if call from heatmap, invoke heatmap popup
	tryHighlight : function(section, fromHeatmap){
		if(window.getSelection().toString() == ""){
			/**TODO Alert that we had invalid selection for highlight here**/
			return null;
		}
		
		var range = this.getSelectionRange();
		
		var startContainer;
		var endContainer;
		var startOffset;
		var endOffset;
		
		var contents = document.getSelection().toString();

		if(range.startContainer.nodeType == 3){
			startContainer = $(range.startContainer).closest('[data-sara-original]').get(0);
			startOffset = this.getCharOffsetRelativeTo(startContainer, range.startContainer, range.startOffset);
		}else if(range.startContainer.childNodes[range.startOffset] == null || range.startContainer.childNodes[range.startOffset] == undefined){
			var n = range.startContainer.childNodes[range.startOffset - 1];
			if(n == null || n == undefined) n = range.startContainer;
			var nextTextNode = this.getNextTextNode(n);
			startContainer = $(nextTextNode).closest('[data-sara-original]').get(0);
			startOffset = this.getCharOffsetRelativeTo(startContainer, nextTextNode, 0);
		}else{
			var n = range.startContainer.childNodes[range.startOffset]
			var previousTextNode = this.getPreviousTextNode(n);
			startContainer = $(previousTextNode).closest('[data-sara-original]').get(0);
			startOffset = this.getCharOffsetRelativeTo(startContainer, previousTextNode, previousTextNode.nodeValue.length);
		}
		
		if(range.endContainer.nodeType == 3){
			endContainer = $(range.endContainer).closest('[data-sara-original]').get(0);
			endOffset = this.getCharOffsetRelativeTo(endContainer, range.endContainer, range.endOffset);
		}else if(range.endContainer.childNodes[range.endOffset] == null || range.endContainer.childNodes[range.endOffset] == undefined){
			var n = range.endContainer.childNodes[range.endOffset - 1];
			if(n == null || n == undefined) n = range.endContainer;
			var nextTextNode = this.getNextTextNode(n);
			endContainer = $(nextTextNode).closest('[data-sara-original]').get(0);
			endOffset = this.getCharOffsetRelativeTo(endContainer, nextTextNode, 0);
		}else{
			var n = range.endContainer.childNodes[range.endOffset]
			var previousTextNode = this.getPreviousTextNode(n);
			endContainer = $(previousTextNode).closest('[data-sara-original]').get(0);
			endOffset = this.getCharOffsetRelativeTo(endContainer, previousTextNode, previousTextNode.nodeValue.length);
		}
		
		// Grab the ids of first and last sentences
		var startId = $(startContainer).attr("data-sara-original");
		var endId = $(endContainer).attr("data-sara-original");
		
		if(startId == undefined || endId == undefined){
			/**TODO Alert that we had invalid selection for highlight here**/
			return null;
		}else{
			
			// For quick jQuery access of one container
			var containerText;
			
			// Wrap highlight to next word in front
			containerText = $(startContainer).text();
			for(var i = startOffset-1; i >= 0; i--){
				if(containerText.charAt(i) != " "){
					startOffset--;
					contents = containerText.charAt(i) + contents;
				}else {
					break;
				}
			}
			// And in back
			containerText = $(endContainer).text();
			for(var i = endOffset; i < containerText.length; i++){
				if(containerText.charAt(i) != " "){
					endOffset++;
					contents += containerText.charAt(i);
				}else {
					break;
				}
			}
			
			// Calculate the completeSentences property of the highlight.
			// Luckily we have the data-sara-original tags, already placed by sentences
			containerText = $(startContainer).text();
			var sentenceOffset = 0;
			var pre_contents = "";
			var post_contents = "";
			// Find pre-contents
			for(var i = startOffset-1; i >= 0; i--){
				// Prepend the string with the character, for completesentences
				sentenceOffset ++;
				pre_contents = containerText.charAt(i) + pre_contents;
			}
			// Find post-contents
			containerText = $(endContainer).text();
			for(var i = endOffset; i < containerText.length; i++){
				// Append the character
				post_contents = post_contents + containerText.charAt(i);
			}
			var allSentences = pre_contents + contents + post_contents;
			
			// traverses each of the spans within the start and end range
            // to check whether there are table in between
            var $startTd = $(startContainer).closest('td');
            var $startTr = $(startContainer).closest('tr');
            var $startTh = $(startContainer).closest('th');
            
            var textContents = "";
            for (var i = parseInt(startId); i <= parseInt(endId); i++){
            	console.log(textContents)
            	var startEle;
            	var curEle;
            	
            	// if the td is not defined, check tr; check td otherwise
            	if ($startTd[0] == undefined && $startTh[0] == undefined ){
            		startEle = $startTr[0];
            		curEle = $('span[data-sara-original|='+i+']').closest('tr')[0]; 
            		
            	}else if ($startTh[0] == undefined){
            		startEle = $startTd[0];
            		curEle = $('span[data-sara-original|='+i+']').closest('td')[0];            		
            	}else{
            		startEle = $startTh[0];
            		curEle = $('span[data-sara-original|='+i+']').closest('th')[0];
            	}
            	
                if (startEle != curEle){
                	alert("Please Highlight within one table cell or outside the table.")
                    contents = textContents.slice(sentenceOffset);
                    allSentences = textContents;
                    endId = i-1;
                    endOffset = $('span[data-sara-original|='+(i-1)+']').text().length;
                    break;
                }
                textContents += $('span[data-sara-original|='+i+']').text();
            }
			
			//create the new highlight and save it to the database, then highlight it in the text
			var newHighlight =  new Highlight({
				instructor:false,
				startOffset:0,
				contents:contents,
				completesentences: allSentences,
				sentenceOffset: sentenceOffset,
				startContainer:startId,
				startOffset:startOffset,
				endContainer:endId,
				endOffset:endOffset,
				sectionNum: $(startContainer).closest("section").data("number"),
				sectionID: CR.sections.at($(startContainer).closest("section").data("number")).id,
			});
			
			//highlight in the text
			newHighlight.showHighlight();
			
			// whether the highlight is made in the heatmap view, show popup accordingly
			if (fromHeatmap){
				console.log("from the heatmap")
				CR.events.trigger("showHeatmapNewHL", newHighlight);
			}else{
				// Now we have to popup our highlight window, to see if the user wants to keep the highlight in some manner.
				CR.events.trigger("showHighlightPopup", newHighlight);				
			}
			
			// Done, let the highlight popup handle the rest
			
		}
	},
	//Get the standard javascript range based on what the user has selected.
	getSelectionRange:function() {
		var sel;
		if (window.getSelection) {
			sel = window.getSelection();
			if (sel.rangeCount) {
				return sel.getRangeAt(0);
			}
		} else if (document.selection) {
			return document.selection.createRange();
		}
		return null;
	},
});
