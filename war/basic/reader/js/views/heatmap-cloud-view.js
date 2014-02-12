var HeatmapCloudView = Backbone.View.extend({
	id: "",
	model: null,
	
	initialize: function(){
	},
	
	//This function checks the textnode to see if it should be included in a user selection.
	isValidTextNode : function(textnode){
		if($(textnode).parents(".pageBreak").length != 0) return false;
		if($(textnode).parents("[data-sara-highlight=ignore]").length != 0) return false;
				
		try{
			var text = $(textnode).context.nodeValue;
			if( text.trim().length > 0 ){ 
				return true;
			}
		}catch(err){}
		
		return false;
	},
	
	//Returns an array of all textnodes inside the given node.
	getTextNodesInContainer : function(node) {
		var textNodes = [];
		var that = this;
		function getTextNodes(node) {
			if(node.nodeType == 3) {
				if(that.isValidTextNode(node)){

					//console.log("TEXT NODE:" +node.nodeValue);

					textNodes.push(node)
				}
			}else{
				for (var i = 0; i < node.childNodes.length; ++i) {
					
					getTextNodes(node.childNodes[i]);
				}
			}
		}
		getTextNodes(node);
		return textNodes;
	},
	
	// This function will place sara-original tags around sentences.
	preprocessBySentences: function() {
		
		/* Algorithm:
		 * 
		 * 1. Start by preprocessing by node, with no data-sara-original tag. Instead, give it a unique class temptag.
		 * 2. Go into each node, and tag by sentence.
		 * 3. Now every sentence is tagged, but with no data-sara-original number. Go back and query every class temptag, give it a number.
		 */
		
		//clean document by getting rid of unnecessary whitespace
		$("*").each(function (i, e){
			$(this).contents().filter(
					function() { return (this.nodeType == 3 && !/\S/.test(this.nodeValue)); })
					.remove();
		});	

		// Next surround each textnode in a span
		var textNodes = this.getTextNodesInContainer(this.el);
		for(var i = 0; i < textNodes.length; i++){

			//Code that will fix inner nodes inside a sentence from being their own sentence.
			if( i>0 && textNodes[i].parentNode.parentNode.parentNode.className != "pagebreak" && (textNodes[i].parentNode.nodeName == "EM" || textNodes[i].parentNode.nodeName == "STRONG") && textNodes[i-1].parentNode.parentNode.nodeName == "P" && textNodes[i].parentNode.parentNode.nodeName == "P" ){

				//console.log(textNodes[i].parentNode.parentNode.parentNode.className);
				//console.log( "EM NODE: "+textNodes[i].nodeName+" "+textNodes[i].parentNode.nodeName+" "+textNodes[i].parentNode.parentNode.nodeName+" "+textNodes[i-1].innerHTML);
				
				$(textNodes[i-1].parentNode).append(textNodes[i].parentNode);
				
				if( !(textNodes[i].nodeValue.indexOf(".") > 0 || textNodes[i].nodeValue.indexOf("?") > 0 || textNodes[i].nodeValue.indexOf("!") > 0 || textNodes[i].nodeValue.indexOf(":") > 0) ){
					$(textNodes[i-1].parentNode).append(textNodes[i+1]);
					i++;
				}
				
			}else
				$(textNodes[i]).wrap("<span class='temptag'/>");
		}
		
		// Get a list of all spans with class temptag
		var tempnodes = this.$el.find(".temptag");
		for(var i = 0; i < tempnodes.length; i++){
			var $node = $(tempnodes[i]);
			// Look through the html of this node. Are there places we can splice sentences?
			var nodehtml = $node.html();
			var newhtml = "";
			// We have the html, let's mess with it and put it back in the html later
			// SENTENCE-FINDING ALGORITHM
			
					//First attempt
					//var sentences = nodehtml.match(/\(?[A-Z][^\.]+[\.!\?]\)?(\s+|$)/g);
  
					//This one works, but breaks up e.g.
					//var sentences = nodehtml.match(/[^.!?]+[.!?]+/gim);
			  
			 
			//Check if the sentence ends with no marking (regex fails to see the endline marker $).
			//If find, then stick a period on it and remove later.
			var endOfLineCheck = false;
			if( nodehtml.length > 0 && nodehtml.charAt(nodehtml.length-1) != '.'){
				endOfLineCheck = true;
				nodehtml = nodehtml+".";
			}
			
			
			//This one seems to be working well (makes sure a period is followed by a space). 
			//Having a hell of a time to get this and quotes to match, so the quote check is done below.  Regex always wants the greater match.
			var sentences = nodehtml.match(/([^.!?]|[.!?]\S)+[.!?\]:$]+/gim);
			
					
			
			// If it is null, then the whole tag is the sentence. Done here
			if(sentences != null){
				
				if( endOfLineCheck )
					sentences[sentences.length-1] = sentences[sentences.length-1].substr(0,sentences[sentences.length-1].length-1); 
				
				// Go through and add each one to nodehtml
				for(var j = 0; j < sentences.length; j++){
									
					if( sentences[j].trim().length > 0 ){

						//Code to correctly break sentences that end in a quote.						
						if( sentences[j].indexOf('?\"') > 0 && sentences[j].indexOf('?\"')+3 < sentences[j].length ){
							var si = sentences[j].indexOf('?\"');
							newhtml += "<span class='temptag'>" + sentences[j].substring(0,si+3) + " </span><span class='temptag'>" + sentences[j].substring(si+3) + " </span>";

						}else if( sentences[j].indexOf('.\"') > 0 && sentences[j].indexOf('.\"')+3 < sentences[j].length ){
							var si = sentences[j].indexOf('?\"');
							newhtml += "<span class='temptag'>" + sentences[j].substring(0,si+3) + " </span><span class='temptag'>" + sentences[j].substring(si+3) + " </span>";
						
						}else if( sentences[j].indexOf('!\"') > 0 && sentences[j].indexOf('!\"')+3 < sentences[j].length ){
							var si = sentences[j].indexOf('?\"');
							newhtml += "<span class='temptag'>" + sentences[j].substring(0,si+3) + " </span><span class='temptag'>" + sentences[j].substring(si+3) + " </span>";												
						}else						
							newhtml += "<span class='temptag'>" + sentences[j] + " </span>";
					}else
						newhtml += sentences[j];
				}
				$node.html(newhtml);
				// Now unwrap the outside span
				$($node.children()[0]).unwrap();
			}
			
		}
		
		// Finally, go through and get every single span tag with class temptag
		tempnodes = this.$el.find(".temptag");
		var count = 0;
		for(var i = 0; i < tempnodes.length; i++){
			var $node = $(tempnodes[i]);
			$node.replaceWith("<span data-sara-original='" + count + "'>" + $node.html() + "</span>");
			count ++;
		}
		
	},
	
	render: function(){
		this.$el.html(this.model.get('content'));
		this.preprocessBySentences();
		return this;
	},
});