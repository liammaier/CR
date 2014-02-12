
var HeatmapView = Backbone.View.extend({
	paragraphNumber: 0,
	currentParagraph: 0,
//	allUsersHLParagraph: [],
//	allUsersHLParagraphSet: false,
	
	cloudView: null,
	textView: null,
	
	model: StratData,
	id: "heatmapContainer",
	
	highlight: null,
	allowHighlight: true,
	noMoreHL: false,
	
	// mobile highlight
	wordOffsetTable	: new Array(),
	mobileHLCount	: 0,
//	prevHL			: null,
	
	events: {
		"mouseup #heatmapBody" : "tryHighlight",
//		"click #heatMapPrev" : "previousParagraph",
		"click #heatMapNext" : "nextParagraph",
//		"click #heatMapAccept" : "apply",
//		"click #heatMapCancel" : "cancel",
		"click #heatmapRefreshBtn" : "refreshUsersHighlight",
		"click span" : "mobileHighlight",
	},
	
	template: _.template('\
			<header id="heatmapHeader" class="instructions">\
				<h2>\
					<span id="heatmapHeaderTxt">Highlight the important point in this paragraph</span>\
					<input id="heatmapRefreshBtn" type="button" class="btn btn-success btn-large" value="Refresh">\
				</h2>\
			</header>\
			<br>\
			<div id="heatmapBody">\
			</div>\
	'),

	initialize: function(){
		//load the content into this view
		var that = this;
		
		// load content css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', CR.content.cssURL) );

		//loads the html
		if (CR.content.type === "import") {
			
			// load the general imported css
			$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', "/contents/imported/general.css") );
			
			// add instruction bar
			this.$el.append(this.template(this.model.toJSON()));
			
			// load the actual content
			this.cloudView = new HeatmapCloudView({model: new HeatmapCloudModel({content: CR.content.importedHTML}), id: "heatmapUsersContentContainer"  });
			this.textView = new HeatmapCloudView({model: new HeatmapCloudModel({content: CR.content.importedHTML}), id: "heatmapContentContainer"  });
			this.$el.find('#heatmapBody').append(this.cloudView.render().el).hide();
			this.$el.find('#heatmapBody').append(this.textView.render().el).hide();
			
			//first preprocess the content
//			this.preprocessBySentences();
			
			// get the number of paragraphs
			this.paragraphNumber = this.$el.find('#heatmapContentContainer').find('p').length;
			
		} else {
			this.$el.load(CR.content.url,function(response, status, xhr){
				// get the html of this el
				var content = that.$el.html();
				that.$el.html('');

				// add instruction bar
				that.$el.append(that.template(that.model.toJSON()));
				
				// put the content back
				that.cloudView = new HeatmapCloudView({model: new HeatmapCloudModel({content: content}), id: "heatmapUsersContentContainer" });
				that.textView = new HeatmapCloudView({model: new HeatmapCloudModel({content: content}), id: "heatmapContentContainer" });
				that.$el.find('#heatmapBody').append(that.cloudView.render().el).hide();
				that.$el.find('#heatmapBody').append(that.textView.render().el).hide();
				
				//first preprocess the content
//				that.preprocessBySentences();
				
				// get the number of paragraphs
				that.paragraphNumber = that.$el.find('#heatmapContentContainer').find('p').length;
			});	
		}
		
		// show content when user cancel the highlight
		CR.events.bind("removeHeatmapHL", this.cancel, this);
		CR.events.bind("showHeatmapNewHL", $.proxy(this.newHighlight, this));
		
	},
	
	// show the header
//	showHeader: function(){
//		$heatMapPrev = this.$el.find('#heatMapPrev');
//		$heatMapPrev.show();
//		$heatMapPrev.parents().show();
//		$heatMapNext = this.$el.find('#heatMapNext');
//		$heatMapNext.show();
//		$heatMapNext.parents().show();
//	},
	
	// check whether to disable buttons
	checkToDisableButtons: function(){
//		if (this.hasPrevParagraph() == -1){
//			this.$el.find('#heatMapPrev').removeClass('btn-success');
//		}else{
//			this.$el.find('#heatMapPrev').addClass('btn-success');
//		}
		if (this.hasNextParagraph() < 0 && this.hasNextParagraph(-1) < 0){
			CR.controllerView.$el.find('#heatMapNext').removeClass('btn-success');
		}else{
			CR.controllerView.$el.find('#heatMapNext').addClass('btn-success');
		}
	},
	
//	hasPrevParagraph: function(){
//		var index = this.currentParagraph-1;
//		while (index >= 0 && this.checkImportPointInParagraph(index)){
//			index--;
//		}
//		if (index >= 0){
//			return index;
//		}
//		return -1;
//	},
	
	// return the index of next avalible paragraph
	// return -1 if no other users paragraph
	// return -2 if the user has done a higlight in every single paragraph
	hasNextParagraph: function(paragraphNum){
		var index;
		
		if (paragraphNum == null){
			index = this.currentParagraph+1;
		}
		var foundParagraphWOHL = false;
		
		for (; index < this.paragraphNumber; index++){
			if (!this.checkImportPointInParagraph(index)){
				if (this.checkImportPointInCloudParagraph(index)){
					return index;
				}
				foundParagraphWOHL = true;
			}
		}
		
		// no more users highlight
		if (foundParagraphWOHL){
//			alert("waiting for more users highlight")
			return -1;
			
		// the user has done a highlight in every single paragraph
		}else{
//			alert("you have done with highlgiht")
			return -2;
		}
	},
	
//	// show the previous paragraph
//	previousParagraph: function(){
//		if (this.highlight != null){ this.cancel() }
//		
//		var index = this.hasPrevParagraph();
//		if (index != -1){
//			this.showParagraph(index);
//		}else{
//			alert("No previous paragraph");
//		}
//	},
	
	// show the next paragraph
	nextParagraph: function(){
		if (this.highlight != null){ this.cancel() }
		
		var index = this.hasNextParagraph();
		var prevParagraphNumber = this.currentParagraph;
		
		if (index > -1){
			this.showParagraph(index);
			this.resetHeader();

			this.noMoreHL = false;
			this.allowHighlight = true;
			
		// no next paragraph avalible, loop around
		}else if (index == -2 || index == -1){
			
			this.currentParagraph = -1;
			index = this.hasNextParagraph();
			
			// found a valid paragraph
			if (index > -1){
				alert('Looped around.')
				if (prevParagraphNumber == index){ alert('No next paragraph found.')}
				
				this.showParagraph(index);
				this.resetHeader();

				this.noMoreHL = false;
				this.allowHighlight = true;
				
			// user is done with highlight
			}else if(index == -2){
				// change the header's text
				this.$el.find('#heatmapHeaderTxt').html('You have done with highlgiht. No next paragraph.')
				
				// hide the content
				this.$el.find('#heatmapUsersContentContainer').hide();
				this.$el.find('#heatmapContentContainer').hide();

				this.hideButtons();
					
				// disable highlight
				this.allowHighlight = false;
				
				this.noMoreHL = true;
			// not valid paragraph from the server
			}else if (index == -1){
				// change the header's text
				this.$el.find('#heatmapHeaderTxt').html('Waiting for more users highlight. No next paragraph.')
				
				// hide the content
				this.$el.find('#heatmapUsersContentContainer').hide();
				this.$el.find('#heatmapContentContainer').hide();

				this.hideButtons();
					
				// disable highlight
				this.allowHighlight = false;
				
				this.noMoreHL = true;
			}
		}
		
		this.checkToDisableButtons();
	},
	
	checkForNextParagraph: function(){
		if (this.noMoreHL){
			this.nextParagraph();
		}
	},
	
	// returns true if there is already import points made in this paragraph
	checkImportPointInCloudParagraph: function(index){
		var $curParagraph = $(this.$el.find('#heatmapUsersContentContainer').find('p')[index]);
		var $allHighlight = $curParagraph.find('.highlightMarker[data-sara-start-marker]');
		
		if ($allHighlight.length != 0){
			return true;
		}else{
			return false;
		}
	},
	
	// returns true if there is already import points made in this paragraph
	checkImportPointInParagraph: function(index){
		var $curParagraph = $(this.$el.find('#heatmapContentContainer').find('p')[index]);
		var $allHighlight = $curParagraph.find('.highlightMarker[data-sara-start-marker]');
		
		// get each highlight in the current paragraph and check whether it is a import point
		for (var i = 0; i < $allHighlight.length; i++){
			var $highlight = $($allHighlight[0]);
			var secNum = $highlight.closest("section").data("number");

			// Find the highlight model in the collection
			var model = CR.highlights[secNum].where({id: $highlight.data("highlightgroup")})[0];
			if (model != null && model.get('type') == 'main'){
				return true;
			}
		}
		
		return false;
	},
	
	// show the content paragraph with index
	showParagraph: function(index){
		if (index != null){
			this.currentParagraph = index;
		}else{
			index = this.currentParagraph;
		}
		
		// try to get the paragraph
		var p = $(this.$el.find('#heatmapContentContainer').find('p')[index]);
		if (p.length == 0){
			console.error('invalid paragraph index');
			return;
		}

		// hide everything
		this.$el.find('*').hide();

		// show paragraph's parents, itself, and its children
		p.parents().show();
		p.show();
		var cindex = 0;
		var children = p.find('*:nth-child(' + ++cindex + ')');
		// show all paragraph's children and grandchildren
		while (children.length != 0){
			children.show();
			var children = p.find('*:nth-child(' + ++cindex + ')');
		}
		
		// show header and buttons
//		this.showHeader();
//		this.checkToDisableButtons();
		this.$el.find('#heatmapHeader').show();
		this.$el.find('#heatmapHeader').find('*').show();
		
		this.$el.find('.hidden').hide();
	},
	
	// show the users paragraph with index
	showUsersParagraph: function(index){
		this.currentParagraph = index;
		
		// try to get the paragraph
		var p = $(this.$el.find('#heatmapUsersContentContainer').find('p')[index]);
		if (p.length == 0){
			console.error('invalid paragraph index');
			return;
		}

		// hide everything
		this.$el.find('*').hide();

		// show paragraph's parents, itself, and its children
		p.parents().show();
		p.show();
		var cindex = 0;
		var children = p.find('*:nth-child(' + ++cindex + ')');
		// show all paragraph's children and grandchildren
		while (children.length != 0){
			children.show();
			var children = p.find('*:nth-child(' + ++cindex + ')');
		}
		
		// show header and buttons
//		this.showHeader();
//		this.checkToDisableButtons();
		this.$el.find('#heatmapHeader').show();
		this.$el.find('#heatmapHeader').find('*').show();
		
		this.$el.find('.hidden').hide();
	},
	
	resetHeader: function(){
		this.$el.find('#heatmapHeaderTxt').html('Please make an important point highlight.');		
	},
	
	/*
	 * Functions to highlight 
	 */
	
	//see if there is a valid highlight selected, if so save and highlight it
	tryHighlight: function(){
		// if there is already a highlight, do nothing
		if (this.highlight != null || !this.allowHighlight){ return; }
		try{
			console.log("TryHighlight")
			console.log(this.lastSelectionRange)
			if (typeof event != 'undefined' && CR.isMobile && event.type == "mouseup"){
				return true;
			}
			
			// First get the section the highlight is in (based on startContainer)
			var range = CR.highlights[0].getSelectionRange();
			var highlightSection = $(range.startContainer).closest("section").data("number");
			// Now try the highlight
			CR.highlights[highlightSection].tryHighlight(CR.sections.at(CR.curSection), true);
			
		}catch(e){
			console.log("not a highlight");
		}
	},
	
	newHighlight: function(newHighlight){
		CR.events.trigger("showHeatmapHLBtn");
		
		this.highlight = newHighlight;
		
		this.showUsersParagraph(this.currentParagraph);
		this.$el.find('#heatMapAccept').show();
		this.$el.find('#heatMapCancel').show();
		
		// change the header's text
		this.$el.find('#heatmapHeaderTxt').html('Click "Accept" to comfirm highlight and go to next paragraph. "Cancel" to undo highlight.')
	},
	
	submitHighlight: function() {
		// Set the type of highlight
		this.highlight.set({ type: "main" });
		CR.highlights[this.highlight.get("sectionNum")].add(this.highlight);
		
		// Saving Highlights to server
		if (!CR.offlineHL){
			this.highlight.save(null, 
				// Prepare callback for when server returns ID
				{
				error: function(model, response){
					/** TODO implement local store for highlights here **/
					CR.offlineHL = true;  // set to offline highlighting
					
					var s = model.get("sectionNum");
					for(var i = 0; i < CR.highlights[s].length; i++){
						if(CR.highlights[s].at(i).cid == model.cid){
							// Found the highlight! First unhighlight the text
							CR.highlights[s].at(i).removeHighlight("cid");
							// id has been updated automatically in the model
							CR.highlights[s].at(i).showHighlight(); // Reshow the highlight
						}
					}
	
					// find the model from hightlights and save it (with cid) in the localStorage
					if (!localStorage.highlights) localStorage.highlights = JSON.stringify([]);
					var highlights = JSON.parse(localStorage["highlights"]);
					highlights.push({cid: model.cid, model: model});
					localStorage["highlights"] = JSON.stringify(highlights);
					
					CR.controllerView.heatmapView.nextParagraph();
				},
				success: function(model, response){
					// Update local ID with the real id.
					var s = model.get("sectionNum");
					for(var i = 0; i < CR.highlights[s].length; i++){
						if(CR.highlights[s].at(i).cid == model.cid){
							// Found the highlight! First unhighlight the text
							CR.highlights[s].at(i).removeHighlight("cid");
							// id has been updated automatically in the model
							CR.highlights[s].at(i).showHighlight(); // Reshow the highlight
						}
					}
					
					CR.controllerView.heatmapView.nextParagraph();
				}
			});
		
		// Saving Highlights to local storage
		}else{
			var s = this.highlight.get("sectionNum");
			for(var i = 0; i < CR.highlights[s].length; i++){
				if(CR.highlights[s].at(i).cid == this.highlight.cid){
					// Found the highlight! First unhighlight the text
					CR.highlights[s].at(i).removeHighlight("cid");
					// id has been updated automatically in the model
					CR.highlights[s].at(i).showHighlight(); // Reshow the highlight
				}
			}

			// find the model from hightlights and save it in the localStorage
			if (!localStorage.highlights) localStorage.highlights = JSON.stringify([]);
			var highlights = JSON.parse(localStorage["highlights"]);
			highlights.push({cid: this.highlight.cid, model: this.highlight});
			localStorage["highlights"] = JSON.stringify(highlights);
		}
	},
						 
	apply: function() {
		this.submitHighlight();
		this.resetHeader();

		this.highlight = null;
		this.mobileHLCount = 0;
	},
	
//	// hide accept and cancel buttons
//	hideButtons: function(){
//		this.$el.find('#heatMapAccept').hide();
//		this.$el.find('#heatMapCancel').hide();
//	},
	
	resetHighlight: function(){
		if (this.highlight != null){
			this.highlight.removeHighlight();
			this.mobileHLCount = 0;
		}
	},
	
	cancel: function(){
		this.resetHighlight();
//		this.hideButtons();

		this.highlight = null;
		this.resetHeader();
	},
	
	/* functions for mobile highlight */
	// new version memorizing ranges
	updateOffsetTable: function (parentNode, offset, wholeTxt, table){
		// traverse all the child nodes
		for(var nChild = 0; nChild < parentNode.childNodes.length; nChild++){
			// check whether the child node is a text node
			if (parentNode.childNodes[nChild].nodeType == 3){
				var nodeTxt = parentNode.childNodes[nChild].textContent
				var start = 0;
				var newWord = false;
				
				// traverse all character, create an object when space or break is found
				for (var charIndex = 0; charIndex < nodeTxt.length; charIndex++){
					if (!newWord){						
						if (nodeTxt[charIndex] == ' ' || nodeTxt[charIndex] == '\n' || nodeTxt[charIndex] == '\t'){
							start++
						}else{
							newWord = true;
							
							// if has not seen a non-break char and at the last position of the text node, creates new object
							if (charIndex+1 == nodeTxt.length){
								// its the last character in node and not a space, includes the last character
								if (charIndex == nodeTxt.length-1 && !(nodeTxt[charIndex] == ' ' || nodeTxt[charIndex] == '\n' || nodeTxt[charIndex] == '\t')){
									charIndex++
								}
								
								var range = document.createRange();
								
								// set the boundary points
								range.setStart(parentNode.childNodes[nChild], start)
								range.setEnd(parentNode.childNodes[nChild], charIndex)
																
								table.push({range: range, startOS: offset+start, endOS: offset+charIndex, txt: wholeTxt.slice(0, offset+charIndex).slice(offset+start)})
							}
						}
	
					}else if ((nodeTxt[charIndex] == ' ' || nodeTxt[charIndex] == '\n' || nodeTxt[charIndex] == '\t' || charIndex == nodeTxt.length-1) && newWord){
						// its the last character in node and not a space, includes the last character
						if (charIndex == nodeTxt.length-1 && !(nodeTxt[charIndex] == ' ' || nodeTxt[charIndex] == '\n' || nodeTxt[charIndex] == '\t')){
							charIndex++
						}
						
						var range = document.createRange();
						
						// set the boundary points
						range.setStart(parentNode.childNodes[nChild], start)
						range.setEnd(parentNode.childNodes[nChild], charIndex)
												
						table.push({range: range, startOS: offset+start, endOS: offset+charIndex, txt: wholeTxt.slice(0, offset+charIndex).slice(offset+start)})
						
						// reset variables
						start = charIndex+1
						newWord = false
					}
				}
				offset += nodeTxt.length
			// not a text node, find its text node
			}else{
				offset = this.updateOffsetTable(parentNode.childNodes[nChild], offset, wholeTxt, table)
			}
		}
		return offset;
	},
	
	// return the closest object from curTable
	highlightFormTable: function(x, y, curTable){
		var minIndex = 0;
		var minDiff = 9999999999;
		
		for (var tableIndex = 0; tableIndex < curTable.length; tableIndex++){
			
			var rangeRec = curTable[tableIndex].range.getBoundingClientRect();
						
			//distance from the current selection
	        var temp = Math.abs(Math.abs((rangeRec.right + rangeRec.left)/2) - x);
			
		    if ((rangeRec.top < y) && (rangeRec.bottom > y)){
				if(temp < minDiff){
					minIndex = tableIndex;
					minDiff = temp;
				}
		    }
		}

		return curTable[minIndex]
	},
	
	singleClickHL: function(event){
		// find the element at the point
		var elementAtPoint = document.elementFromPoint(event.pageX, event.pageY);
		
		// find the element's parent to determine the data-sara-original
		var parentN = elementAtPoint
		
		// look for data-sara-original span
		while (parentN != null && $(parentN).attr("data-sara-original") == undefined){
			parentN = parentN.parentElement;
		}
		
		// not a data-sara-original
		if (parentN == null){
//			console.log("not a data-sara-original")
			return null;
		}
		
//		console.log('a data-sara-original')
		
		var dataSaraOrig = $(parentN).attr("data-sara-original");
		
		// the data-sara-original span not in the offset table
		if (this.wordOffsetTable[dataSaraOrig] == null){
			console.log(dataSaraOrig)
			var tempTable = new Array();
			this.updateOffsetTable(parentN, 0, parentN.textContent, tempTable)

			for (var some = 0; some < tempTable.length; some++){
				console.log(":::"+tempTable[some].txt+":::")
			}
		
//			console.log(tempTable)
			
//			console.log(dataSaraOrig)
			this.wordOffsetTable[dataSaraOrig] = tempTable
		}
		
		// look up the offset table to find the object with closest distance from x and y
		var minObj = this.highlightFormTable(event.pageX, event.pageY, this.wordOffsetTable[dataSaraOrig])
		
		this.wordOffsetTable[dataSaraOrig] = null;
		
		// create highlight object
		return {
			instructor:			false,
			contents:			minObj.txt,
			completesentences: 	$(parentN).text(),
			sentenceOffset: 	minObj.startOS,
			startContainer:		dataSaraOrig,
			startOffset:		minObj.startOS,
			endContainer:		dataSaraOrig,
			endOffset: 			minObj.endOS,
			sectionNum: 		$(parentN).closest("section").data("number"),
			sectionID: 			CR.sections.at($(parentN).closest("section").data("number")).id,
		};
//		
//		newHighlight.showHighlight();
//		CR.events.trigger("showHighlightPopup", newHighlight);
//		
//		return newHighlight;
	},
	
	mobileHighlight: function(event){
		if (!CR.isMobile){ return true; }
		
		console.log(event)
		event.preventDefault();
		event.stopPropagation();
		
		var newHighlighInfo = this.singleClickHL(event);
		
		// create new highlight
		if (this.mobileHLCount == 0){
			this.mobileHLCount++;
			
			var newHighlight =  new Highlight(newHighlighInfo);
			this.highlight = newHighlight;
			
			this.highlight.showHighlight("#66CCFF");
			
		// compare the previous highlight to the current one
		}else if (this.mobileHLCount == 1){
			this.mobileHLCount++;
			var prevStartContainer = parseInt(this.highlight.get('startContainer'));
			var preStartOffset = parseInt(this.highlight.get('startOffset'));
			
			var curStartContainer = parseInt(newHighlighInfo.startContainer);
			var curStartOffset = parseInt(newHighlighInfo.startOffset);
			
			// case: after
			if ((prevStartContainer < curStartContainer) || (prevStartContainer == curStartContainer && preStartOffset < curStartOffset)){
//					console.log('======================AFTER======================')
				// get the complete sentences
				var sentences = "";
//					console.log(this.touchedHLObj.get('startContainer')+":::VS:::"+dataSaraOrig)
				for (var curDSO = prevStartContainer; curDSO <= curStartContainer; curDSO++){
//						console.log($('span[data-sara-original|=' + curDSO + ']').text())
					sentences += $('span[data-sara-original|=' + curDSO + ']').text()
				}
				
//					console.log(sentences)
				
				// get the new contents
				var content = sentences.slice(0, sentences.length - $('span[data-sara-original|=' + newHighlighInfo.startContainer + ']').text().length + parseInt(newHighlighInfo.endOffset));
//					console.log("line1712newWord:::" + content+":::")
				content = content.slice(preStartOffset)
//					console.log("FINAL:::" + content+":::")
				
				// traverses each of the spans within the start and end range
		        // to check whether there are table in between
				var $startContainer = $('span[data-sara-original|=' + this.highlight.get('startContainer') + ']');
		        var $startTd = $startContainer.closest('td');
		        var $startTr = $startContainer.closest('tr');
		        var $startTh = $startContainer.closest('th');
		        
//			        var textContents = "";
		        for (var i = parseInt(this.highlight.get('startContainer')); i <= newHighlighInfo.endContainer; i++){
//			        	console.log(textContents)
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
//			                contents = textContents.slice(this.highlight.get('startOffset'));
//			                allSentences = textContents;
//			                endId = i-1;
//			                endOffset = $('span[data-sara-original|='+(i-1)+']').text().length;
						
		            	
		                return;
		            }
//			            textContents += $('span[data-sara-original|='+i+']').text();
		        }
				
				var newHighlight =  new Highlight({
					instructor:			false,
					contents:			content,
					completesentences: 	sentences,
					sentenceOffset: 	this.highlight.get('startOffset'),
					startContainer:		this.highlight.get('startContainer'),
					startOffset:		this.highlight.get('startOffset'),
					endContainer:		newHighlighInfo.endContainer,
					endOffset: 			newHighlighInfo.endOffset,
					sectionNum: 		$('span[data-sara-original|=' + this.highlight.get('startContainer') + ']').closest("section").data("number"),
					sectionID: 			CR.sections.at($('span[data-sara-original|=' + this.highlight.get('startContainer') + ']').closest("section").data("number")).id,
				});

				this.highlight.removeHighlight();
				this.highlight = newHighlight;
				
				this.highlight.showHighlight("#66CCFF");
				
//					console.log('==================END=AFTER======================')
			// case: before
			}else if ((curStartContainer < prevStartContainer) || (prevStartContainer == curStartContainer && preStartOffset > curStartOffset)){
//					console.log('======================BEFORE======================')
				// get the complete sentences
				var sentences = "";
				for (var curDSO = curStartContainer; curDSO <= prevStartContainer; curDSO++){
//						console.log($('span[data-sara-original|=' + curDSO + ']').text())
					sentences += $('span[data-sara-original|=' + curDSO + ']').text()
				}
				
//					console.log(sentences)
				
				// get the new contents
				var content = sentences.slice(0, sentences.length - $('span[data-sara-original|=' + this.highlight.get('endContainer') + ']').text().length + parseInt(this.highlight.get('endOffset')));
//					console.log("line1712newWord:::" + content+":::")
				content = content.slice(curStartOffset)
				
				// traverses each of the spans within the start and end range
		        // to check whether there are table in between
				var $startContainer = $('span[data-sara-original|=' + newHighlighInfo.startContainer + ']');
		        var $startTd = $startContainer.closest('td');
		        var $startTr = $startContainer.closest('tr');
		        var $startTh = $startContainer.closest('th');
		        
//			        var textContents = "";
		        for (var i = parseInt(newHighlighInfo.startContainer); i <= this.highlight.get('endContainer'); i++){
//			        	console.log(textContents)
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
//			                contents = textContents.slice(this.highlight.get('startOffset'));
//			                allSentences = textContents;
//			                endId = i-1;
//			                endOffset = $('span[data-sara-original|='+(i-1)+']').text().length;
						
		            	
		                return;
		            }
//			            textContents += $('span[data-sara-original|='+i+']').text();
		        }
				
				var newHighlight =  new Highlight({
					instructor:			false,
					contents:			content,
					completesentences: 	sentences,
					sentenceOffset: 	newHighlighInfo.startOffset,
					startContainer:		newHighlighInfo.startContainer,
					startOffset:		newHighlighInfo.startOffset,
					endContainer:		this.highlight.get('endContainer'),
					endOffset: 			this.highlight.get('endOffset'),
					sectionNum: 		$('span[data-sara-original|=' + this.highlight.get('startContainer') + ']').closest("section").data("number"),
					sectionID: 			CR.sections.at($('span[data-sara-original|=' + this.highlight.get('startContainer') + ']').closest("section").data("number")).id,
				});

				this.highlight.removeHighlight();
				this.highlight = newHighlight;
				
				this.highlight.showHighlight("#66CCFF");
//					console.log('==================END=BEFORE======================')
			
			// case: the starting word of the span
			}else if (curStartOffset == preStartOffset){
//				prevStartContainer=========SAME======================')
//					console.log('==================END=SAME======================')
			}else{
				console.error("MOBILE HIGHLIGHTING ERROR");
			}
		
		// set to the 1st highlight
		}else if (this.mobileHLCount == 2){
			this.mobileHLCount = 1;
			this.highlight.removeHighlight();
			
			var newHighlight =  new Highlight(newHighlighInfo);
			this.highlight = newHighlight;
			
			this.highlight.showHighlight("#66CCFF");
			
		}else if (this.mobileHLCount == 3){
			console.error("mobile count is 3")
		}
		
		this.newHighlight(this.highlight);
		
		return false;
	},
	
	/* function for refreshing */
	// remove all the users' highlight and then get all the users' highlight and place highlight spans
	refreshUsersHighlight: function(){
		this.initAllHeatMapHighlights();
	},
	
	// TODO: initialzie all users highlights
	initHeatMapHighlights: function(sectionNum, callback){
		$.post('/getContentHighlights', {section: CR.sections.at(sectionNum).id, contentID:CR.contentID, libID:CR.libID}, function(data){
			CR.heatMapHighlights[sectionNum] = new HighlightCollection(data.highlights);
			CR.heatMapHighlights[sectionNum].sectionID = data.section;
			if(callback)callback();
		});
	},
	
	// initialzie all users highlights in all sections
	initAllHeatMapHighlights: function(){
		CR.sections.each(function(section,index){
			CR.initHeatMapHighlights(index, function(){});
		})
	},
	
	placeHeatMapHighlights: function(sectionNum){
		for(var j = 0; j < CR.heatMapHighlights[sectionNum].length; j++){
			CR.heatMapHighlights[sectionNum].at(j).placeHeatmapHighlightSpans(false, "#heatmapUsersContentContainer");
		}
	},
	
	render: function(){
		// show the first paragraph
		// check whether 0th paragraph has important points
		this.currentParagraph = -1;
		this.allowHighlight = true;
		this.resetHeader();
		this.mobileHLCount = 0;
		
		this.$el.find('#heatmapBody').hide();
		
		if (this.checkImportPointInParagraph(0) || !this.checkImportPointInCloudParagraph()){
			this.nextParagraph();
		}else{
			this.showParagraph(this.currentParagraph);
		}
		
		return this;
	},
	
});

