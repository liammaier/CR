var ReaderView = Backbone.View.extend({
	id : "readerPanel",
	readerScrollTop : -1,
	// variables to handle touches
	lastTapTime : 0,
	currentTime : 0,
//	click 		: 1, 
	currObj		: null,
//	lastObj		: null,
//	touchedHLObj: null,
//	touchedEvent: null,
//	scroll		: false,
//	drag		: false,
//	link		: false,
//	touchDragStart: 0,
//	touchDragStartSpan: 0,
	
	wordOffsetTable: new Array(),
	inHighlightMode: false,
	mobileHLMode: 0,
	
	mobileHLCount : 0,
	prevHL		: null,
	
	lastSelectionRange: null,
	updateMobileInterval: null,
	
	hightlightWidget: null,
	
	touchEnded: false,
	
	events: {
//		"touchstart span" : "touchStart",
//		"touchmove span" : "touchMove",
		"touchend span" : "touchEnd",
		"mouseup" : "tryHighlight",
		"scroll" : "readerScroll",
		"click span" : "mobileHighlight",
		"click .highlight" : "editHighlight",
		"click .instructor" : "instructorHighlight",
		"click .playOverlay" : "tryVideo",
		"click a" : "tryLink",
		"click img" : "tryImage",
//		"blur" : "testing",

	},
	defaults: {
		
	},
	
	updateMobileRange: function(){
		console.log("update been called")
		// First get the section the highlight is in (based on startContainer)
		var range = CR.highlights[0].getSelectionRange();
		if (range != null){
			var highlightSection = $(range.startContainer).closest("section").data("number");
			// Now try the highlight
			this.lastSelectionRange = CR.highlights[highlightSection].getSelectionRange();
		}
	},
	
	testing: function(){
		console.log("testing");
	},
	
	template: _.template(""),
	initialize: function(){
	
		CR.readerView = this;

		//load the content into this view
		var that = this;
		
		// load content css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', CR.content.cssURL) );

		//loads the html
		if (CR.content.type === "import") {
			
			// load the general imported css
			$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', "/contents/imported/general.css") );
			
			// load the actual content
			this.$el.html(CR.content.importedHTML);
			
			//first preprocess the content
			that.preprocessBySentences();

			//trigger an event telling everything that the content is loaded
			CR.events.trigger("contentLoaded");

			//update the page offsets when the window is resized
			$(window).resize(function (){
				CR.recalculateOffsets = true;
			});
		} else {
		
			this.$el.load(CR.content.url,function(response, status, xhr){
				//first preprocess the content
				that.preprocessBySentences();
				
				// display the chapter name
				that.$el.prepend('<h1 class="book-title">' + CR.content.resourceTitle + ':</h1> <h1 class="content-title">' + CR.content.title + '</h1>');
				
				//trigger an event telling everything that the content is loaded
				CR.events.trigger("contentLoaded");
	
				//update the page offsets when the window is resized
				$(window).resize(function (){
					CR.recalculateOffsets = true;
				});
			});		
			
		}
		
		// setup hightlight widget
		this.hightlightWidget = new HighlightWidgetView();
		this.hightlightWidget.hide();

		//when the section is changed scroll the reader and update the global currentSection
		CR.events.bind("changeTheSection",this.changeTheSection,this);
		
		//scroll to the page we were given
		CR.events.bind("goToPage", this.changeReaderPage, this);
		
		//Everytime we switch to the reader strategy we need to scroll to where they left off					
		CR.events.bind("strategyChanged", this.readerInit, this);
		
		//Listen for updateOffset event, and then recalculate the page offsets.
		CR.events.bind("updateOffsets",this.updateOffsets,this);

		// listen for highlighting mode
		CR.events.bind("toggleHighlightMode", this.toggleMobileHL, this);
		
		// listen for highlighting widget done
		CR.events.bind("nativeHighlightDone", this.tryHighlight, this);
		
		if (CR.isMobile) document.addEventListener("selectionchange", 
			function() {
				var curTarget = window.getSelection().baseNode;
				// if its found under reader view
				if (this.$el.find(curTarget).length != 0){
					this.tryNativeSelectionHL();
				}else{
					if (this.mobileHLMode == 2){
						this.inHighlightMode = false;
						this.mobileHLMode = 0;
						CR.events.trigger("toggleHighlightDone");
						this.hightlightWidget.hide();
					}
				}
			}.bind(this), false);
	},
	
	
	// functions for adding links, videos, and images to the review multimedia strat
	tryVideo: function(ev) {
		if (CR.options.reviewmultimedia) {
			var target = ev.target.parentNode;
			
			// pull up the popup menu for the user to decide to review later or not
			var modalPop = new MultimediaPopupView({target:target, type: "video", saved: $(target).hasClass("saved")} );
		}
		
	},
	tryLink: function(ev) {
		if (CR.options.reviewmultimedia) {
			ev.preventDefault(); // so it doesn't follow the link
			
			var target = ev.target.parentNode;
			
			// pull up the popup menu for the user to decide to review later or not
			var modalPop = new MultimediaPopupView({target:target, type: "link", saved: $(target).hasClass("saved")} );
		}
	},
	
	tryImage: function(ev) {
		if (CR.options.reviewmultimedia) {
			var target = ev.target.parentNode;
			
			// pull up the popup menu for the user to decide to review later or not
			var modalPop = new MultimediaPopupView({target:target, type: "image", saved: $(target).hasClass("saved")} );
		}
	},
	
	readerInit:function(strat){
		
		if (strat === "read") {
			//This will reset the scroll position if we are coming from another strategy
			if( this.readerScrollTop >= 0 ) {
				this.$el.scrollTop(this.readerScrollTop);
			} else {
				this.updateOffsets();
				this.changeReaderPage(this.curpage);
			}
			var  that = this;
			//If we call updateOffsets too fast, the page offset locations in the html will be wrong.
			setTimeout(function(){ 
				$("#readerPanel").css("-webkit-user-select","none");
				$("#readerPanel span").css("-webkit-user-select","none");
				//find the page and section
			},500);	
		}
	},
	
	/**SCROLLING/SECTION FUNCTIONS**/
	readerScroll:function(){
		this.readerPanelHeight = this.$el.height();	
		//Section calculation
		this.readerScrollTop = $("#readerPanel").scrollTop();
		
		//section stuff
		for(var i = CR.sections.length - 1; i >= 0; i--){
			if(this.readerScrollTop + this.readerPanelHeight/2 > CR.sectionOffsets[i]){
				if (this.curSection != i) {
					this.curSection = i;
					CR.events.trigger("scrollIntoSection", i);
					CR.events.trigger("SectionHasChanged", i);
				}
				break;
			}
		}
		// Page calculation. Get value of page textbox, compare to offsets of prev and next
		var last = null;
		var middle = (this.readerPanelHeight / 2) + this.readerScrollTop

		for(var curpagenum in CR.pageOffsets){
			var curpagelocation = parseInt(CR.pageOffsets[curpagenum]);
		
			if( curpagelocation > 0 && curpagelocation > middle ){
				if(this.curpage != curpagenum){
					CR.log("changepage", "read", CR.contentID, CR.getCurrentSection().id, this.curpage , "");
					CR.updateUserProgress("page", curpagenum);
					$("#gotoPageInput").val(curpagenum);
					this.curpage = curpagenum;			
				}
				break;
			}
			last = curpagenum ;
		}
		
		// THESE ARE FOR THE SECTION SIDEBAR BUTTONS THAT ARE CURRENTLY OFF
		// Scroll Popup Logic
//		$("#scrollPopupBar").scrollTop(this.$el.scrollTop());
//		$("#readerCanvas").scrollTop(this.$el.scrollTop());
//
//		var fadeHeight =  this.readerPanelHeight / 3 ;
//		$("#scrollPopupBar .sectionButtonPanel").each(function() {
//			var heightDif = Math.abs((this.readerPanelOffset + this.readerPanelHeight / 2) - ($(this).offset().top + $(this).height() / 2) );
//			if(heightDif <= fadeHeight){
//				
//				// Adjust opacity
//				var opacity = (fadeHeight - heightDif) / 100;
//				$(this).css("opacity", opacity);
//				if(opacity < 0.7) {
//					$(this).css("pointer-events", "none");
//				}else {
//					$(this).css("pointer-events", "auto");
//				}
//				
//			}else{
//				$(this).css("opacity", "0");
//				$(this).css("pointer-events", "none");
//			}
//			$("#endofSectionLine" + $(this).data("section")).css("opacity", $(this).css("opacity"));
//		});
		


	},
	//update all offset calculations
	updateOffsets: function(){
		var first = true;
		this.curpage = 1;
		this.readerPanelOffset = this.$el.offset().top;
		this.readerPanelHeight = this.$el.height();

		// update page offsets
		var that = this;
		this.$el.find(".pagebreak .pageNumber").each(function(index,el){
			var $el = $(this);			
			CR.pageOffsets[$el.text().trim()] = that.$el.find($el).offset().top;
			if(first) {
				that.curpage = $el.text().trim();
				first = false;
				$("#gotoPageInput").val(that.curpage);
			}

		});
		// there are 2 different ways page numbers have been formatted. this will get the other way
		this.$el.find(".pagebreak.pageNumber").each(function(index,el){
			var $el = $(this);			
			CR.pageOffsets[$el.text().trim()] = that.$el.find($el).offset().top;
			if(first) {
				that.curpage = $el.text().trim();
				first = false;
				$("#gotoPageInput").val(that.curpage);
			}
		});
		
		// Update section offsets
		for(var i = 0; i < CR.sections.length; i++){
			if($("section[data-number=" + i + "]").size()> 0) 
				CR.sectionOffsets[i] = $("section[data-number=" + i + "]").offset().top - this.readerPanelOffset + $("#readerPanel").scrollTop();
		}
	},
	scrollToSection : function(sectionNumber){
		this.readerPanelHeight = this.$el.height();
		try{
			var thetop = this.$el.scrollTop() + $("section[data-number=" +sectionNumber+"]").offset().top - this.readerPanelHeight / 3;
			this.$el.scrollTop(this.$el.scrollTop() + $("section[data-number=" +sectionNumber+"]").offset().top - this.readerPanelHeight / 3)
		
			// Page calculation. Get value of page textbox, compare to offsets of prev and next	
			this.readerPanelHeight = this.$el.height();
			for(var curpagenum in CR.pageOffsets){
				var curpageoffset = parseInt(CR.pageOffsets[curpagenum]);
				var curpagelocation = (curpageoffset - thetop);			
				if( curpagelocation > (0-this.readerPanelHeight*2) && curpagelocation < (this.readerPanelHeight / 1.5) ){
					this.curpage = curpagenum;			
					$("#gotoPageInput").val(curpagenum);
				}
			}		
		
		}catch(err){}
	},
	//Update the views for the section
	changeTheSection : function(newSection) {
		this.curSection = newSection;
		this.scrollToSection(newSection);
		CR.events.trigger("SectionHasChanged", newSection);
	},
	/**END OF SCROLLING/SECTION FUNCTIONS**/
	
	editHighlight:function(e){
		if (!this.inHighlightMode){
			e.stopPropagation();
			var $highlight = $(e.target);
			var secNum = $highlight.closest("section").data("number");
			// Find the highlight model in the collection
			var model = CR.highlights[secNum].where({id: $highlight.data("highlightgroup")})[0];
			if (model == null){
				model = CR.highlights[secNum].filter( function(highlight){ return highlight.cid == $highlight.data("highlightgroup") } )[0];
			}
			// Trigger the edit popup
			CR.events.trigger("showHighlightPopup", model);
			
			return false;
		}else{
			return true;
		}
	},

	//see if there is a valid highlight selected, if so save and highlight it
	tryHighlight: function(){
		console.log("TryHighlight")
		console.log(this.lastSelectionRange)
		if (typeof event != 'undefined' && CR.isMobile && event.type == "mouseup"){
			return true;
		}
		
//		if (this.updateMobileInterval != null){
//			clearInterval(this.updateMobileInterval);
//			this.updateMobileInterval = null;
//		}
		
		if (this.lastSelectionRange){
			console.log("Native Tryhighlight")
			
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(this.lastSelectionRange);

			// First get the section the highlight is in (based on startContainer)
			var range = CR.highlights[0].getSelectionRange();
			var highlightSection = $(range.startContainer).closest("section").data("number");
			// Now try the highlight
			CR.highlights[highlightSection].tryHighlight(CR.sections.at(CR.curSection));
			
			this.lastSelectionRange = null;
			
			this.hightlightWidget.hide();
			this.inHighlightMode = false;
			CR.events.trigger("toggleHighlightDone");
			this.mobileHLMode = 0;
			
		}else if (!CR.isMobile){
			// First get the section the highlight is in (based on startContainer)
			var range = CR.highlights[0].getSelectionRange();
			var highlightSection = $(range.startContainer).closest("section").data("number");
			// Now try the highlight
			CR.highlights[highlightSection].tryHighlight(CR.sections.at(CR.curSection));
		}
	
	},
	
	tryNativeSelectionHL: function(){
		if (!tts.doPlay){
			console.log("update been called")
			// First get the section the highlight is in (based on startContainer)
			var range = CR.highlights[0].getSelectionRange();
			console.log(range)
			if (range != null){
				// update the selection
				if (range.startContainer != range.endContainer || range.startOffset != range.endOffset){
					if (range != null && this.mobileHLMode == 0){
						this.mobileHLMode = 2;
						this.hightlightWidget.show();
					}
					var highlightSection = $(range.startContainer).closest("section").data("number");
					// Now try the highlight
					this.lastSelectionRange = CR.highlights[highlightSection].getSelectionRange();
				}else{
					if (this.mobileHLMode == 2){
						this.inHighlightMode = false;
						this.mobileHLMode = 0;
						CR.events.trigger("toggleHighlightDone");
						this.hightlightWidget.hide();
					}
				}
				
			// no selection
			}else{					
				if (this.mobileHLMode == 2){
					this.inHighlightMode = false;
					this.mobileHLMode = 0;
					CR.events.trigger("toggleHighlightDone");
					this.hightlightWidget.hide();
				}
			}
		}
	},
	
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
	

	addWidgets: function(){
		$('span[data-sara-original|=' + this.prevHL.get('startContainer') + ']');
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
		if (this.inHighlightMode && this.mobileHLMode != 2){
			this.mobileHLMode = 1;
			console.log(event)
			event.preventDefault();
			event.stopPropagation();
			
			var newHighlighInfo = this.singleClickHL(event);
			
			// create new highlight
			if (this.mobileHLCount == 0){
				this.mobileHLCount++;
				
				var newHighlight =  new Highlight(newHighlighInfo);
				this.prevHL = newHighlight;
				
				this.prevHL.showHighlight("#66CCFF");
				
			// compare the previous highlight to the current one
			}else if (this.mobileHLCount == 1){
				this.mobileHLCount++;
				var prevStartContainer = parseInt(this.prevHL.get('startContainer'));
				var preStartOffset = parseInt(this.prevHL.get('startOffset'));
				
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
					var $startContainer = $('span[data-sara-original|=' + this.prevHL.get('startContainer') + ']');
			        var $startTd = $startContainer.closest('td');
			        var $startTr = $startContainer.closest('tr');
			        var $startTh = $startContainer.closest('th');
			        
//			        var textContents = "";
			        for (var i = parseInt(this.prevHL.get('startContainer')); i <= newHighlighInfo.endContainer; i++){
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
//			                contents = textContents.slice(this.prevHL.get('startOffset'));
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
						sentenceOffset: 	this.prevHL.get('startOffset'),
						startContainer:		this.prevHL.get('startContainer'),
						startOffset:		this.prevHL.get('startOffset'),
						endContainer:		newHighlighInfo.endContainer,
						endOffset: 			newHighlighInfo.endOffset,
						sectionNum: 		$('span[data-sara-original|=' + this.prevHL.get('startContainer') + ']').closest("section").data("number"),
						sectionID: 			CR.sections.at($('span[data-sara-original|=' + this.prevHL.get('startContainer') + ']').closest("section").data("number")).id,
					});

					this.prevHL.removeHighlight();
					this.prevHL = newHighlight;
					
					this.prevHL.showHighlight("#66CCFF");
					
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
					var content = sentences.slice(0, sentences.length - $('span[data-sara-original|=' + this.prevHL.get('endContainer') + ']').text().length + parseInt(this.prevHL.get('endOffset')));
//					console.log("line1712newWord:::" + content+":::")
					content = content.slice(curStartOffset)
					
					// traverses each of the spans within the start and end range
			        // to check whether there are table in between
					var $startContainer = $('span[data-sara-original|=' + newHighlighInfo.startContainer + ']');
			        var $startTd = $startContainer.closest('td');
			        var $startTr = $startContainer.closest('tr');
			        var $startTh = $startContainer.closest('th');
			        
//			        var textContents = "";
			        for (var i = parseInt(newHighlighInfo.startContainer); i <= this.prevHL.get('endContainer'); i++){
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
//			                contents = textContents.slice(this.prevHL.get('startOffset'));
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
						endContainer:		this.prevHL.get('endContainer'),
						endOffset: 			this.prevHL.get('endOffset'),
						sectionNum: 		$('span[data-sara-original|=' + this.prevHL.get('startContainer') + ']').closest("section").data("number"),
						sectionID: 			CR.sections.at($('span[data-sara-original|=' + this.prevHL.get('startContainer') + ']').closest("section").data("number")).id,
					});

					this.prevHL.removeHighlight();
					this.prevHL = newHighlight;
					
					this.prevHL.showHighlight("#66CCFF");
//					console.log('==================END=BEFORE======================')
				
				// case: the starting word of the span
				}else if (curStartOffset == preStartOffset){
//				prevStartContainer=========SAME======================')
//					console.log('==================END=SAME======================')
				}else{
					console.error("MOBILE HIGHLIGHTING ERROR");
				}
			
			// set to the 1st highlight
			}else{
				this.mobileHLCount = 1;
				this.prevHL.removeHighlight();
				
				var newHighlight =  new Highlight(newHighlighInfo);
				this.prevHL = newHighlight;
				
				this.prevHL.showHighlight("#66CCFF");
				
			}
			
			return false;
		}else{
			return true;
		}
	},

//	dragCtr: 0,
//	
//	updateDragHL: function(minObj, dataSaraOrig, parentN){
//		this.dragCtr++
//		if (this.dragCtr%2 != 0){
//			return
//		}
//		// compare the data-sara-original to see whether the new target is before or after
////		console.log("this:::"+this.touchDragStartSpan+":::VS:::"+dataSaraOrig+":::cur")
//		var startSpan = parseInt(this.touchDragStartSpan)
//		var startPos = parseInt(this.touchDragStart)
//		
//		// case: after
//		if ((startSpan < dataSaraOrig) || (startSpan == dataSaraOrig && startPos < minObj.startOS)){
////			console.log('======================AFTER======================')
//			// get the complete sentences
//			var sentences = "";
////			console.log(this.touchedHLObj.get('startContainer')+":::VS:::"+dataSaraOrig)
//			for (var curDSO = startSpan; curDSO <= dataSaraOrig; curDSO++){
////				console.log($('span[data-sara-original|=' + curDSO + ']').text())
//				sentences += $('span[data-sara-original|=' + curDSO + ']').text()
//			}
//			
////			console.log(sentences)
//			
//			// get the new contents
//			var content = sentences.slice(0, sentences.length - $('span[data-sara-original|=' + dataSaraOrig + ']').text().length + minObj.endOS)
////			console.log("line1712newWord:::" + content+":::")
//			content = content.slice(this.touchedHLObj.get('startOffset'))
////			console.log("FINAL:::" + content+":::")
//			
//			var newHighlight =  new Highlight({
//				instructor:			false,
//				contents:			content,
//				completesentences: 	sentences,
//				sentenceOffset: 	this.touchDragStart,
//				startContainer:		this.touchDragStartSpan,
//				startOffset:		this.touchDragStart,
//				endContainer:		dataSaraOrig,
//				endOffset: 			minObj.endOS,
//				sectionNum: 		$(parentN).closest("section").data("number"),
//				sectionID: 			CR.sections.at($(parentN).closest("section").data("number")).id,
//			});
//			
//			this.touchedHLObj.removeHighlight()
//			this.touchedHLObj = newHighlight;
//			this.touchedHLObj.showHighlight("#66CCFF");
////			console.log('==================END=AFTER======================')
//		// case: before
//		}else if ((startSpan > dataSaraOrig) || (startSpan == dataSaraOrig && startPos > minObj.startOS)){
////			console.log('======================BEFORE======================')
//			// get the complete sentences
//			var sentences = "";
//			for (var curDSO = dataSaraOrig; curDSO <= startSpan; curDSO++){
////				console.log($('span[data-sara-original|=' + curDSO + ']').text())
//				sentences += $('span[data-sara-original|=' + curDSO + ']').text()
//			}
//			
////			console.log(sentences)
//			
//			// get the new contents
//			var content = ""
//			if (startSpan == dataSaraOrig){
//				content = sentences.slice(0, startPos)
//			}else{
//				content = sentences.slice(0, sentences.length - $('span[data-sara-original|=' + this.touchedHLObj.get('startContainer') + ']').text().length + startPos)
//			}
////			console.log("line1712newWord:::" + content+":::")
//			content = content.slice(minObj.startOS)
//				
//			var newHighlight =  new Highlight({
//				instructor:			false,
//				contents:			content,
//				completesentences: 	sentences,
//				sentenceOffset: 	minObj.startOS,
//				startContainer:		dataSaraOrig,
//				startOffset:		minObj.startOS,
//				endContainer:		this.touchDragStartSpan,
//				endOffset: 			this.touchDragStart,
//				sectionNum: 		$(parentN).closest("section").data("number"),
//				sectionID: 			CR.sections.at($(parentN).closest("section").data("number")).id,
//			});
//			
//			this.touchedHLObj.removeHighlight()
//			this.touchedHLObj = newHighlight;
//			this.touchedHLObj.showHighlight("#66CCFF");	
////			console.log('==================END=BEFORE======================')
//		
//		// case: the starting word of the span
//		}else if (startPos == minObj.startOS){
////			console.log('======================SAME======================')
//			var newHighlight =  new Highlight({
//				instructor:			false,
//				contents:			minObj.txt,
//				completesentences: 	$(parentN).text(),
//				sentenceOffset: 	minObj.startOS,
//				startContainer:		dataSaraOrig,
//				startOffset:		minObj.startOS,
//				endContainer:		dataSaraOrig,
//				endOffset: 			minObj.endOS,
//				sectionNum: 		$(parentN).closest("section").data("number"),
//				sectionID: 			CR.sections.at($(parentN).closest("section").data("number")).id,
//			});
//			
//			this.touchedHLObj.removeHighlight()
//			this.touchedHLObj = newHighlight;
//			this.touchedHLObj.showHighlight("#66CCFF");		
////			console.log('==================END=SAME======================')
//		}
//		
//	},
//	
//	// record the time of the touch start and add click accordingly
//	touchStart: function(){
//		this.touchEnded = false;
//		this.lastTapTime = (new Date()).valueOf();
//		this.currObj = event.target;
//		
//		console.log(this.lastTapTime);
//		
//		setTimeout(function () {
//			console.log("Checking")
//			console.log(this.mobileHLMode+":::"+this.touchEnded)
//			if (this.mobileHLMode == 0 && this.touchEnded == false){
//				console.log("this.mobileHLMode:::"+this.mobileHLMode)
//					
//					// First get the section the highlight is in (based on startContainer)
//					var range = CR.highlights[0].getSelectionRange();
//					if (range != null){
//						this.mobileHLMode = 2;
//						
//						var highlightSection = $(range.startContainer).closest("section").data("number");
//						// Now try the highlight
//						this.lastSelectionRange = CR.highlights[highlightSection].getSelectionRange();
//						console.log(this.lastSelectionRange);
//						
//						this.hightlightWidget.show();
//						
////						if (this.updateMobileInterval == null){
////							this.updateMobileInterval = setInterval(function() {
////								console.log("update been called")
////								// First get the section the highlight is in (based on startContainer)
////								var range = CR.highlights[0].getSelectionRange();
////								console.log(range)
////								if (range != null){
////									// update the selection
////									if (range.startContainer != range.endContainer || range.startOffset != range.endOffset){
////										var highlightSection = $(range.startContainer).closest("section").data("number");
////										// Now try the highlight
////										this.lastSelectionRange = CR.highlights[highlightSection].getSelectionRange();
////									}else{
////										console.log("aborting")
////										this.lastSelectionRange = null;
////										
////										if (this.updateMobileInterval != null){
////											clearInterval(this.updateMobileInterval);
////											this.updateMobileInterval = null;
////										}
////										
////										this.hightlightWidget.hide();
////										this.inHighlightMode = false;
////										CR.events.trigger("toggleHighlightDone");
////										this.mobileHLMode = 0;
////									}
////									
////								// no selection
////								}else{
////									console.log("aborting")
////									this.lastSelectionRange = null;
////									
////									if (this.updateMobileInterval != null){
////										clearInterval(this.updateMobileInterval);
////										this.updateMobileInterval = null;
////									}
////									
////									this.hightlightWidget.hide();
////									this.inHighlightMode = false;
////									CR.events.trigger("toggleHighlightDone");
////									this.mobileHLMode = 0;
////								}
////							}.bind(this), 700);
////						}
//					}
//				
//			}
//		}.bind(this), 700);
//		
////		// check whether TTS is activated
////		if (tts.toggle){
////			return true;
////		}
////		
////		// check time between taps and the objects tapped
////		this.currentTime = (new Date()).valueOf();
////		if ((this.currentTime - this.lastTapTime) < 300 && this.lastObj == event.target){
////			console.log(this.lastObj)
////			console.log("VS")
////			console.log(event.target)
////			
////			if (this.click >= 2){
////				this.click = 2
////			}else{
////				this.click += 1;
////			}
////			
////		// not same object or time elapsed
////		}else{
////			// reset click
////			this.click = 1;
////		}
////		
////		this.touchedEvent = event;
////			
////		// if clicked on a link
////		if (!(event.target.parentElement.nodeName != 'A' && !$(event.target).hasClass('highlight'))){
////			this.link = true;
////		}else{
////			this.link = false;			
////		}
//	},
//	
//	touchMove: function(){
//		// check whether TTS is activated
//		if (tts.toggle){
//			return true;
//		}
//		
//		// this is a link: do nothing
//		if (this.drag){
//			event.stopPropagation();
//			// find the element at the point
//			var elementAtPoint = document.elementFromPoint(event.pageX, event.pageY);
//			
//			// find the element's parent to determine the data-sara-original
//			var parentN = elementAtPoint
//			
//			// look for data-sara-original span
//			while (parentN != null && $(parentN).attr("data-sara-original") == undefined){
//				parentN = parentN.parentElement;
//			}
//			
//			// not a data-sara-original
//			if (parentN == null){
//				return
//			}
//			
//			var dataSaraOrig = $(parentN).attr("data-sara-original");
//			
//			// the data-sara-original span not in the offset table
//			if (this.wordOffsetTable[dataSaraOrig] == null){
//				var tempTable = new Array();
//				this.updateOffsetTable(parentN, 0, parentN.textContent, tempTable)
//				this.wordOffsetTable[dataSaraOrig] = tempTable
//			}
//			
//			// look up the offset table to find the object with closest distance from x and y
//			var minObj = this.highlightFormTable(event.pageX, event.pageY, this.wordOffsetTable[dataSaraOrig])
//			
//			// see if there is already a highlight object created for touchmove
//			// case: no object; create new object
//			if (this.touchedHLObj == null){
//				var newHighlight =  new Highlight({
//					instructor:			false,
//					contents:			minObj.txt,
//					completesentences: 	$(parentN).text(),
//					sentenceOffset: 	minObj.startOS,
//					startContainer:		dataSaraOrig,
//					startOffset:		minObj.startOS,
//					endContainer:		dataSaraOrig,
//					endOffset: 			minObj.endOS,
//					sectionNum: 		$(parentN).closest("section").data("number"),
//					sectionID: 			CR.sections.at($(parentN).closest("section").data("number")).id,
//				});
//				
//				this.touchDragStartSpan = dataSaraOrig;
//				this.touchDragStart = minObj.startOS;
//				this.touchedHLObj = newHighlight;
//				this.touchedHLObj.showHighlight("#66CCFF");			
//				
//			// case: has object; update offset
//			}else{
//				this.updateDragHL(minObj, dataSaraOrig, parentN)
//			}
//			
//			return false
//			
//		// this touch is highlighting
//		}else if (!this.scroll && Math.abs(this.touchedEvent.pageX - event.pageX) > Math.abs(this.touchedEvent.pageY - event.pageY)){
//			$('#readerPanel').css('overflow-y', 'hidden')
//			$('#readerPanel').css('overflow-x', 'hidden')
//			this.drag = true;
//			this.scroll = false;
//			
//		// this touch is a scroll
//		}else{
//			this.drag = false;
//			this.scroll = true
//		}
//	},
//	
	// based on the number of clicks and determines which kind of highlight to take
	touchEnd: function(){
		this.touchEnded = true;
//		console.log(event)
//		var curTime = new Date().valueOf();
//		console.log(curTime + "\n-=--=-=-=-=-=-=-=-=");
//		
//		if (curTime - this.lastTapTime > 600 && this.currObj == event.target && this.mobileHLMode != 1){
//			this.mobileHLMode = 2;
//			$('#nativeHLBtn').show();
//				// First get the section the highlight is in (based on startContainer)
//				var range = CR.highlights[0].getSelectionRange();
//				if (range != null){
//					var highlightSection = $(range.startContainer).closest("section").data("number");
//					// Now try the highlight
//					this.lastSelectionRange = CR.highlights[highlightSection].getSelectionRange();
//					console.log(this.lastSelectionRange);
//					
//					this.hightlightWidget.show();
//					
//					if (this.updateMobileInterval == null){
//						this.updateMobileInterval = setInterval(function() {
//							console.log("update been called")
//							// First get the section the highlight is in (based on startContainer)
//							var range = CR.highlights[0].getSelectionRange();
//							if (range != null){
//								var highlightSection = $(range.startContainer).closest("section").data("number");
//								// Now try the highlight
//								this.lastSelectionRange = CR.highlights[highlightSection].getSelectionRange();
//							}
//						}.bind(this), 500);
//					}
//				}
//			
//		}
		
//		// check whether TTS is activated
//		if (tts.toggle){
//			return true;
//		}
//		
//		// not highlighting
//		if (this.scroll){
//			this.scroll = false
//			return true;
//		}
//
//		event.stopPropagation();
//		
//		// update time interval between touches
//		this.lastTapTime = (new Date()).valueOf();
//		
//		this.currObj = event.target;
//		
//		this.selected = false;
//		var that = this;
//
//		console.log("this.click: " + that.click)
//		
//		
//		
//		// end with 1 tap
//		if (that.click == 1){			
//			// drag HL
//			if (this.touchedHLObj != null && this.drag){
//				
//				this.touchedHLObj.showHighlight();
//				CR.events.trigger("showHighlightPopup", that.touchedHLObj);
//				
//				// reset variables
//				this.touchedHLObj = null
//				this.drag = false
//				this.wordOffsetTable = new Array()
//				$('#readerPanel').css('overflow-y', 'scroll')
//			
//				return false;
//				
//			// a link or highlight
//			}else if (this.link){
//				this.lastObj = this.currObj;
//				return true;
//				
//			// single tap hightlight
//			}else if (!this.drag){
//				setTimeout(function(){
//					that.singleClickHL(that.touchedEvent)
//				},300);
//			}
//			
//		// end with 2 taps
//		}else if (that.click == 2){
//			if (that.currObj == null){
//				return true;
//			}
//
//			// find the element's parent to determine the data-sara-original
//			var parentN = that.currObj;
//			
//			// look for data-sara-original span
//			while (parentN != null && $(parentN).attr("data-sara-original") == undefined){
//				parentN = parentN.parentElement;
//			}
//			
//			// not a data-sara-original
//			if (parentN == null){
//				return true;
//			}
//
//			that.currObj = null;
//			
//			var newHighlight =  new Highlight({
//							instructor:false,
//							startOffset:0,
//							contents:$(parentN).text(),
//							completesentences: $(parentN).text(),
//							sentenceOffset: 0,
//							startContainer:$(parentN).attr("data-sara-original"),
//							startOffset:0,
//							endContainer:$(parentN).attr("data-sara-original"),
//							endOffset: $(parentN).text().length,
//							sectionNum: $(parentN).closest("section").data("number"),
//							sectionID: CR.sections.at($(parentN).closest("section").data("number")).id,
//						});
//			
//			//highlight in the text
//			newHighlight.showHighlight();
//			
//			// Now we have to popup our highlight window, to see if the user wants to keep the highlight in some manner.
//			CR.events.trigger("showHighlightPopup", newHighlight);
//			
//			return false
//		}
//
//		this.lastObj = this.currObj;
//		return false
	},
	
	toggleMobileHL: function(){
		// in highlighting mode
		if (this.inHighlightMode = !this.inHighlightMode){
//			this.tryHighlight();
		// terminate
		}else{
			console.log("Its OFF");
			CR.events.trigger("showHighlightPopup", this.prevHL);
			this.prevHL = null;
			this.mobileHLCount = 0;
			this.mobileHLMode = 0;
		}
	},
	
	/**END OF HIGHLIGHT FUNCTIONS**/
	//changes the current focus of the content page
	//input is an unparsed string
	changeReaderPage: function(page) {
		page = page.trim();
		//console.log("reader-views - changeReaderPage("+page+")");		
		//console.log(CR.pageOffsets);
		
		var pageOffset = CR.pageOffsets[page];
		// Move to the page
		if(pageOffset == null){
			// No page found
			if(page == 0){
				this.scrollToOffset(0);
			}else {
				this.scrollToOffset($("#readerPanel")[0].scrollHeight);
			}
			alert("That page does not exist. Please enter a valid page number");

		}else{
			$("#readerPanel").scrollTop(pageOffset - this.readerPanelOffset - this.readerPanelHeight / 3 + 1);
		}
	},
	// Scrolls the reader to the given offset
	scrollToOffset: function(n){
		this.$el.scrollTop(0);
	},

	/**Functions for Preprocessing**/
	// In order to save the offsets, some preprocessing is necessary.
	
	// DEPRECATED: This function will place sara-original tags around every node
	preprocessByNodes: function(){

		//clean document by getting rid of unnecessary whitespace
		$("*").each(function (i, e){
			$(this).contents().filter(
					function() { return (this.nodeType == 3 && !/\S/.test(this.nodeValue)); })
					.remove();
		});	

		//Next surround each textnode in a container, which will be used for the offsets.
		var count = 1;
		var root = this.el;
		var textNodes = this.getTextNodesInContainer(root);
		for(var i = 0; i < textNodes.length; ++i){
			$(textNodes[i]).wrap("<span data-sara-original='" + count + "'/>");
			++count;
		}
	},
	
	// This function will place sara-original tags around sentences.
	preprocessBySentences : function() {
		
		/* Algorithm:
		 * 
		 * 1. Start by preprocessing by node, with no data-sara-original tag. Instead, give it a unique class temptag.
		 * 2. Go into each node, and tag by sentence.
		 * 3. Now every sentence is tagged, but with no data-sara-original number. Go back and query every class temptag, give it a number.
		 */
		
		//clean document by getting rid of unnecessary whitespace
		$("*").each(function (i, e){
			$(this).contents().filter(
				function() { return (this.nodeType == 3 && !/\S/.test(this.nodeValue)); }
			).remove();
		});	

		// Next surround each textnode in a span
		var textNodes = this.getTextNodesInContainer(this.el);
		for(var i = 0; i < textNodes.length; i++){

			//Code that will fix inner nodes inside a sentence from being their own sentence.
			if( i>0 && textNodes[i].parentNode.parentNode.parentNode.className != "pagebreak" && (textNodes[i].parentNode.nodeName == "EM" || textNodes[i].parentNode.nodeName == "STRONG") && textNodes[i-1].parentNode.parentNode.nodeName == "P" && textNodes[i].parentNode.parentNode.nodeName == "P" ){
				
				if( !( textNodes[i].nodeValue.indexOf(":") > 0 || (textNodes[i].nodeValue.charAt(0) >= 65 && textNodes[i].nodeValue.charAt(0) <= 90) ) ){
				
					//console.log(textNodes[i].parentNode.parentNode.parentNode.className);
					//console.log( "EM NODE: "+textNodes[i].nodeName+" "+textNodes[i].parentNode.nodeName+" "+textNodes[i].parentNode.parentNode.nodeName+" "+textNodes[i-1].innerHTML);

					$(textNodes[i-1].parentNode).append(textNodes[i].parentNode);

					if( !(textNodes[i].nodeValue.indexOf(".") > 0 || textNodes[i].nodeValue.indexOf("?") > 0 || textNodes[i].nodeValue.indexOf("!") > 0 || textNodes[i].nodeValue.indexOf(":") > 0) ){
						$(textNodes[i-1].parentNode).append(textNodes[i+1]);
						i++;
					}
				}else{
					$(textNodes[i]).wrap("<span class='temptag'/>");
				}
			}else{
				$(textNodes[i]).wrap("<span class='temptag'/>");
			}
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
	/**End of Functions for Preprocessing**/
	render: function(){
		this.$el.prepend(this.template());
		
		// pull in any javascript the text may have associated with it
		$.getScript(this.$el.find("meta[name=javascript]").attr("javascript"));
		
		return this;
	},
	
	/**TODO Figure out what we should do with an instructor highlight click**/
	instructorHighlight:function(e){
//		if(!tts.selectMode){
//			selectedHighlight =  e.target;
//			selectedHighlightId = $(selectedHighlight).data("highlightgroup").toString()
//			
//			tts.speakText(sara.textById(selectedHighlightId));
//			//if we are not in text to speech mode
//			sara.highlightById(selectedHighlightId,"red");
//			setTimeout("turnBack("+selectedHighlightId+",'#DC05F0')","3000");
//		}			
	},
	
})
var StartUpView  = Backbone.View.extend({
	id : "startUpPanel",
	events: {
		"click #startReadingBtn": "startReading",
		"change #readingTimeDropdown": "changeReadingTime",
		//"keydown #pagegoalInput": "checkInt",
	},
	template: _.template('\
		<div id="sessionStartup">\
			<div id="sessionStartupMessage">\
			<br>\
			<h3>Session Startup for: <u id="startupContentTitle"><%=CR.content.title%></u></h3>\
				<br>\
				Your default settings are listed below. You can edit the settings or leave them alone.<br>\
				Click "<i>Start Reading!</i>" when you are ready to start your reading session.\
			</div>\
			<br>\
			<div id="sessionStartupBox">\
				<br>\
				<table id="sessionSettingsTable" class="settingsTable">\
					<tr>\
						<td>Total Time for Reading Session:</td>\
						<td><select id="readingTimeDropdown">\
							<option value="15">15 minutes</option>\
							<option value="30">30 minutes</option>\
							<option value="45">45 minutes</option>\
							<option selected value="60">60 minutes</option>\
							<option value="90">90 minutes</option>\
						</select></td>\
					</tr><tr>\
					        <td>Page Goal:<br>\
								Pages in this reading: <div id="maxPages"></div>\
							</td>\
							<td>\
								<select id="pageGoalDropdown"></select>\
							</td>\
					</tr>\
				</table>\
				<br>\
				<div align="center">\
					<div id="organizeReminders" style="display:none; width:510px; text-align:left;">\
						Organize Your Study Space:\
						<ul id="organizeRemindersList" class="reminderList"></ul>\
					</div>\
					<br>\
					<div id="gatherReminders" style="display:none; width:510px; text-align:left;">\
						Gather Your Materials:\
						<ul id="gatherRemindersList" class="reminderList"></ul>\
					</div>\
					<div id="notefromlastsession" style="display:none; width:510px; text-align:left;">\
						<p>Here\'s a note you left for yourself last reading session:</p>\
						<p id="notefromlastsessiontext"></p>\
					</div>\
				</div>\
				<br>\
				<table id="profileAndStartTable" class="settingsTable">\
					<tr>\
						<td><a href="/basic/options/reminders.html" >\
							<input id="editProfileBtn" type="button" class="btn btn-success btn-large italicized" value="loading..." disabled/>\
						</a></td>\
						<td><input id="startReadingBtn" type="button" class="btn btn-success btn-large italicized" value="loading..." disabled/></td>\
					</tr>\
				</table>\
				<br>\
			</div>\
		</div>'
	),
	//button to start the reading session
	startReading: function(){
		//start reading with set reading options
		CR.pagegoal = $('#pageGoalDropdown').val();
		
		CR.events.trigger("startReading");
		
		$.post("/log", {type: "startreading", strategy: "menus", contentkey: CR.contentID, sectionkey: "", data1: CR.pagegoal, data2: ""});
	},
	
	initPageGoalDropdown: function(maxPages){
		for (var i = 0; i <= maxPages; i++){
			if (i == 0){
				this.$el.find("#pageGoalDropdown").append('<option value="' + i + '">No Page Goal</option>');
			}else{
				this.$el.find("#pageGoalDropdown").append('<option value="' + i + '">' + i + '</option>');
			}
		}
	},
	
	render: function(){
		this.$el.html(this.template());
		
		this.$el.find("#maxPages").html(CR.content.numPages);
		this.initPageGoalDropdown(CR.content.numPages);
		
		// display startsession reminders
			
		// loop through reminders to find the right one
		for(var i = 0; i < CR.reminders.length; i++){

			if(CR.reminders[i].type == "total-time"){
				CR.sessionTime = CR.reminders[i].time;
			}
						
			else if(CR.reminders[i].name == "startup-organize"){
				this.$el.find("#organizeReminders").show();
				this.$el.find("#organizeRemindersList").append("<li>"+CR.reminders[i].message+"</li>"); 
			}
			
			else if(CR.reminders[i].name == "startup-materials"){
				this.$el.find("#gatherReminders").show();
				this.$el.find("#gatherRemindersList").append("<li>"+CR.reminders[i].message+"</li>");
			}
		}
		
		// set the dropdown to the current value
		this.$el.find("#readingTimeDropdown").val(CR.sessionTime);
		
		// check and log check boxex
		var reminderLogs = new Array();
		this.$el.find(".reminderList li").click(function(){
			$(this).css('background-image','url("../../../images/big_check.gif")');
			console.log($(this).text());
			
			// log the reminder
			if (reminderLogs.indexOf($(this).text()) == -1){
				reminderLogs.push($(this).text());
				CR.log("reminder", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, $(this).text(), "");
				CR.sendLogs();
			}
		});		
		
		// display the notes from the previous session
		$.get("/usernote", function(data) {
			//if firefox
			if(navigator.userAgent.toLowerCase().indexOf('firefox') != -1){
				//check if firefox just changed return params of the function because it is null... smh BAD FIREFOX
				if(data.URL != null){
					data = null;
				}
			}
			if (data != null && data != "" && data !="null") {
				this.$el.find("#notefromlastsessiontext").text(data);
				this.$el.find("#notefromlastsession").show();
			}
		});
		
		// Now we can start
		this.$el.find("#editProfileBtn").removeAttr("disabled");
		this.$el.find("#editProfileBtn").val("Edit your Reading Profile");
		this.$el.find("#startReadingBtn").removeAttr("disabled");
		this.$el.find("#startReadingBtn").val("Start Reading!");
		
		$('#spinnerbox').fadeOut("fast");

		$.post("/log", {type: "sessionstartpage", strategy: "menus", contentkey: CR.contentID, sectionkey: "", data1: "", data2: ""});		

		return this;
	},
	
	// change session time for this session
	changeReadingTime: function(event) {
		CR.adjustTimeNotificationDropdowns();
		
		CR.sessionTime = event.target.value;
		
		$.post("/log", {type: "changesessiontime", strategy: "menus", contentkey: CR.contentID, sectionkey: "", data1: CR.sessionTime, data2: ""});
		
	},
	
	// ALTERNATE METHODS OF HIGHLIGHTING

//	// highlight a single word with single click
//	singleClickHL: function(event){
//		// find the element at the point
//		var elementAtPoint = document.elementFromPoint(event.pageX, event.pageY);
//		
//		// find the element's parent to determine the data-sara-original
//		var parentN = elementAtPoint
//		
//		// look for data-sara-original span
//		while (parentN != null && $(parentN).attr("data-sara-original") == undefined){
//			parentN = parentN.parentElement;
//		}
//		
//		// not a data-sara-original
//		if (parentN == null){
////			console.log("not a data-sara-original")
//			return
//		}
//		
////		console.log('a data-sara-original')
//		
//		var dataSaraOrig = $(parentN).attr("data-sara-original");
//		
//		// the data-sara-original span not in the offset table
//		if (this.wordOffsetTable[dataSaraOrig] == null){
//			console.log(dataSaraOrig)
//			var tempTable = new Array();
//			this.updateOffsetTable(parentN, 0, parentN.textContent, tempTable)
//
//			for (var some = 0; some < tempTable.length; some++){
//				console.log(":::"+tempTable[some].txt+":::")
//			}
//		
////			console.log(tempTable)
//			
////			console.log(dataSaraOrig)
//			this.wordOffsetTable[dataSaraOrig] = tempTable
//		}
//		
//		// look up the offset table to find the object with closest distance from x and y
//		var minObj = this.highlightFormTable(event.pageX, event.pageY, this.wordOffsetTable[dataSaraOrig])
//		
//		// create highlight object
//		var newHighlight =  new Highlight({
//			instructor:			false,
//			contents:			minObj.txt,
//			completesentences: 	$(parentN).text(),
//			sentenceOffset: 	minObj.startOS,
//			startContainer:		dataSaraOrig,
//			startOffset:		minObj.startOS,
//			endContainer:		dataSaraOrig,
//			endOffset: 			minObj.endOS,
//			sectionNum: 		$(parentN).closest("section").data("number"),
//			sectionID: 			CR.sections.at($(parentN).closest("section").data("number")).id,
//		});
//		
//		newHighlight.showHighlight();
//		CR.events.trigger("showHighlightPopup", newHighlight);
//	},

//	// Old version memorizing squre coordinates
//	updateOffsetTable: function (parentNode, offset, wholeTxt, table){
//		// traverse all the child nodes
//		for(var nChild = 0; nChild < parentNode.childNodes.length; nChild++){
//			// check whether the child node is a text node
//			if (parentNode.childNodes[nChild].nodeType == 3){
//				var nodeTxt = parentNode.childNodes[nChild].textContent
//				var start = 0;
//				var newWord = false;
//				
//				// traverse all character, create an object when space or break is found
//				for (var charIndex = 0; charIndex < nodeTxt.length; charIndex++){
//					if (!newWord){						
//						if (nodeTxt[charIndex] == ' ' || nodeTxt[charIndex] == '\n' || nodeTxt[charIndex] == '\t'){
//							start++
//						}else{
//							newWord = true;
//							
//							// if has not seen a non-break char and at the last position of the text node, creates new object
//							if (charIndex+1 == nodeTxt.length){
//								// its the last character in node and not a space, includes the last character
//								if (charIndex == nodeTxt.length-1 && !(nodeTxt[charIndex] == ' ' || nodeTxt[charIndex] == '\n' || nodeTxt[charIndex] == '\t')){
//									charIndex++
//								}
//								
//								var range = document.createRange();
//								
//								// set the boundary points
//								range.setStart(parentNode.childNodes[nChild], start)
//								range.setEnd(parentNode.childNodes[nChild], charIndex)
//																
//								table.push({rect: range.getBoundingClientRect(), startOS: offset+start, endOS: offset+charIndex, txt: wholeTxt.slice(0, offset+charIndex).slice(offset+start)})
//							}
//						}
//
//					}else if ((nodeTxt[charIndex] == ' ' || nodeTxt[charIndex] == '\n' || nodeTxt[charIndex] == '\t' || charIndex == nodeTxt.length-1) && newWord){
//						// its the last character in node and not a space, includes the last character
//						if (charIndex == nodeTxt.length-1 && !(nodeTxt[charIndex] == ' ' || nodeTxt[charIndex] == '\n' || nodeTxt[charIndex] == '\t')){
//							charIndex++
//						}
//						
//						var range = document.createRange();
//						
//						// set the boundary points
//						range.setStart(parentNode.childNodes[nChild], start)
//						range.setEnd(parentNode.childNodes[nChild], charIndex)
//												
//						table.push({rect: range.getBoundingClientRect(), startOS: offset+start, endOS: offset+charIndex, txt: wholeTxt.slice(0, offset+charIndex).slice(offset+start)})
//						
//						// reset variables
//						start = charIndex+1
//						newWord = false
//					}
//				}
//				offset += nodeTxt.length
//			// not a text node, find its text node
//			}else{
//				offset = this.updateOffsetTable(parentNode.childNodes[nChild], offset, wholeTxt, table)
//			}
//		}
//		return offset
//	},



});

// Helper Functions
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

