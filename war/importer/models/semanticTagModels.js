var SemanticTag = Backbone.Model.extend({
	urlRoot: "/updateHighlight",
	defaults: function() {
		return {
			startContainer: "null",
			endContainer: "null",
			startOffset: "null",
			endOffset: "null",
			initialParent: "null",
			sentenceOffset: 0,
			type: "new",
			othertype: "",
			contents: "null",
			sectionNum: -1,
			sectionID: "null",
			timeCreated: "null",
			name:"",
		}
	},
	initialize:function(){
		//put the spans in the html if we need highlighting
	},
	clear: function() {
		
    },
    /**FUNCTIONS FOR HIGHLIGHTING IN THE TEXT**/
    //Highlights the given range as specified by its offsets.
	showHighlight : function(color){
		//first check if we have a highlight as a parent, if so dont highlight, add the option to delete a highlight
		
		var id = this.get("id");
		// Use client id if normal id is not set yet OR if id_type == "cid"
		if(id == null || id_type == "cid"){
			id = this.cid;
		}	
		if(color == null){
			color = "yellow";
		}
		
		if(this.placeHighlightSpans(color,id)){
			this.highlight(color,id);
		}
		//clears the user selection
		var sel = window.getSelection();
		sel.removeAllRanges();
	},
	
    //static method that Removes the highlight for the given id.
	removeTag: function(id_type){
		var id = this.get("id");
		// Use client id if normal id is not set yet OR if id_type == "cid"
		if(id == null || id_type == "cid"){
			id = this.cid;
		}
		$(this.root).find("[data-taggroup=" + id + "]").contents().unwrap();
		$(this.root).find("[data-wrapper=" + id + "]").contents().unwrap();
		$(this.root).find("[data-tagname=" + id + "]").remove();
		
		$("[data-sara-start-marker=" + id + "]").remove();
		
		$("[data-sara-end-marker=" + id + "]").remove();
	},
	
	highlight:function(color,id){
		var start = $(this.root).find("[data-sara-start-marker="+id+"]")[0];
		var end = $(this.root).find("[data-sara-end-marker="+id+"]")[0];
		var wrapper = $("<span style = 'line-height: 28px;' class = 'tagWrapper'></span>")
		wrapper.data("wrapper",id)
		$(start).before(wrapper);

		var $contents = $(this.nodesBetween(start,end,[]));
		
		var html = "";
		//if we haven't overlapped highlights
		_.each($contents,function(part){
			html += part.outerHTML;
			$(part).remove();
		},this);
		var tag = $("<span class = 'tagTypeName'>"+this.get("name")+"</span>");
		var style = " z-index:100; color:red; -moz-user-select: none; -khtml-user-select: none; -webkit-user-select: none; -o-user-select: none; position: relative; top: -14px; left: 7px;"
		tag.attr("style",style);
		tag.data("tagname",id);
		$(wrapper).html(html).before(tag);	
		tag.css("margin-left",-tag.width());
		
		//var tag = $('<canvas id="tagTypeName" width="100" height="50" style="border:1px solid #000000;"></canvas>');
//		
//		var style = " z-index:100; color:red; -moz-user-select: none; -khtml-user-select: none; -webkit-user-select: none; -o-user-select: none; position: relative; top: -14px; left: 7px; "
//			tag.attr("style",style);
//		$(wrapper).html(html).before(tag);
//		
//		var c= $(this.root).find("#tagTypeName")[0];
//		var ctx=c.getContext("2d");
//		ctx.font="20px Arial";
//		ctx.fillText("Hello World",10,50);
	},
	nodesBetween:function(start,end,acc){
		if(start == null){
			return acc;
		}else if(start == end){
			acc.push(start);
			return acc;
		}else{
			acc.push(start)
			this.nodesBetween($(start).next()[0],end,acc);
			return acc;
		}
	},
	unhighlight : function(){
		$(this.root).find("[data-taggroup="+this.get("id")+"]").css("border", "none");
	},
	/**END OF FUNCTIONS FOR HIGHLIGHTING IN THE TEXT**/
	
	/**HELPER FUNCTIONS THAT DO PARTS OF HIGHLIGHTING**/
	//when a highlight needs to be put in the text
    placeHighlightSpans : function(color, id){

		var startContainer = this.get("startContainer")
		var endContainer = this.get("endContainer")
		var startOffset = this.get("startOffset");
		var endOffset =  this.get("endOffset");
		
	
		
		var element1 = document.createElement ("span");
		element1.className = "highlightMarker";
		$(element1).attr("data-sara-start-marker", id);
		$(element1).attr("data-taggroup", id);

		var element2 = document.createElement ("span");
		element2.className = "highlightMarker";
		$(element2).attr("data-sara-end-marker", id);

		this.addElementAtLocation(element1, startContainer, startOffset);
		this.addElementAtLocation(element2, endContainer, endOffset);
		
		var style = "border: dotted 1px red; position: relative;";
			var $contents = $(this.nodesBetween(element1, element2,[]));
		//if there are no tags in the selection or within the selection
		if(!$contents.hasClass("tagWrapper") && $contents.find(".tagWrapper").length == 0){
			
			var textNodes = this.getTextNodesBetween(element1, element2);
			for(var i = 0; i < textNodes.length; ++i){
				$(textNodes[i]).wrap("<span style='"+style+"' data-taggroup='" + id + "'/>");
			}
			return true;
//		}else if($contents.parents(".tagWrapper").length != 0){
//			$(element1).remove();
//			$(element2).remove();
//			this.collection.editor.deleteEnable(this);
//			return false;
		}else{
			$(element1).remove();
			$(element2).remove();
			return false;

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
	getTextNodesBetween : function(startNode, endNode) {
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
		getTextNodes(this.root);
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

var SemanticTagCollection = Backbone.Collection.extend({
	model: SemanticTag,
	url: "/updateHighlight",
	sectionID: -1,
	
	/**FUNCTIONS FOR HIGHLIGHTING IN THE TEXT**/
    //Takes a user selection, gets the range, then converts it into something
	//that we can use to highlight
	
	//Removes all highlights in the text.
	removeAllHighlights : function(){
		$("[data-taggroup]").contents().unwrap();
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
		getTextNodes(this.root);
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
		if(tempHighlight && tempHighlight != tts.currPlayingRange) sara.removeTagById(tempHighlight.id)
		tempHighlight = null;
	},
	//removes a highlight in the reader given a an id
	removeTag : function(id){
		var tag = this.get(id);
		//remove from the text
		tag.removeTag();
		//then from the collections
		this.remove(id)
	},
	textById : function(id){
		return $(this.root).find("[data-taggroup="+id+"]").text();
	},

	addTag : function(range,root,tagTypeName){
		
		var startContainer = range.startContainer.$;
		var endContainer  = range.endContainer.$;;
		var startOffset = range.startOffset;
		var endOffset = range.endOffset;
		
		var contents = range.toString();

		if(startContainer.nodeType == 3){
			startOffset = this.getCharOffsetRelativeTo($(startContainer).closest('p').get(0), startContainer, startOffset);
			startContainer = $(startContainer).closest('p').get(0);

		}else if(startContainer.childNodes[startOffset] == null || startContainer.childNodes[startOffset] == undefined){
			var n = startContainer.childNodes[startOffset - 1];
			if(n == null || n == undefined) n = startContainer;
			var nextTextNode = this.getNextTextNode(n);
			startContainer = $(nextTextNode).closest('p').get(0);
			startOffset = this.getCharOffsetRelativeTo(startContainer, nextTextNode, 0);
		}else{
			var n = startContainer.childNodes[startOffset]
			var previousTextNode = this.getPreviousTextNode(n);
			startContainer = $(previousTextNode).closest('p').get(0);
			startOffset = this.getCharOffsetRelativeTo(startContainer, previousTextNode, previousTextNode.nodeValue.length);
		}
		
		if(endContainer.nodeType == 3){
			endOffset = this.getCharOffsetRelativeTo($(endContainer).closest('p').get(0), endContainer, endOffset);
			endContainer = $(endContainer).closest('p').get(0);

		}else if(endContainer.childNodes[endOffset] == null || endContainer.childNodes[endOffset] == undefined){
			var n = endContainer.childNodes[endOffset - 1];
			if(n == null || n == undefined) n = endContainer;
			var nextTextNode = this.getNextTextNode(n);
			endContainer = $(nextTextNode).closest('p').get(0);
			endOffset = this.getCharOffsetRelativeTo(endContainer, nextTextNode, 0);
		}else{
			var n = endContainer.childNodes[endOffset]
			var previousTextNode = this.getPreviousTextNode(n);
			endContainer = $(previousTextNode).closest('p').get(0);
			endOffset = this.getCharOffsetRelativeTo(endContainer, previousTextNode, previousTextNode.nodeValue.length);
		}
		
	
		
		//create the new highlight and save it to the database, then highlight it in the text
		var newTag =  new SemanticTag({
			instructor:false,
			contents:contents,
			startContainer:startContainer,
			startOffset:startOffset,
			endContainer:endContainer,
			endOffset:endOffset,
			sectionNum: $(startContainer).closest("section").data("number"),
			name:tagTypeName,
//			sectionID: CR.sections.at($(startContainer).closest("section").data("number")).id,
		});
		newTag.root = root;
		//highlight in the text
		newTag.showHighlight();
		this.add(newTag);
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
