var ReviewMultimediaView = Backbone.View.extend({
		
	model: StratData,
	id: "tocReview",
	events: {
		"click a.title" : "clickMedia",
		"click .icon-trash" : "removeMedia",
		"click .media-note p" : "editNote",
		"click .media-note input" : "saveNote",
	},
	mediaComplete: 0,
	template: _.template('\
		<div id="review-media" >\
			<header>\
				<div class="instructions"> \
					<h2>Review Multimedia </h2>\
				</div>\
			</header>\
			<div id="rs-media">\
				<%for(var i =0; i < strategyData.length;i++ ){ %>\
					<%var media = strategyData[i]%>\
					<div data-num="<%= i %>" class="review-media <%= media.type %>">\
						<div class="media-title <%if (media.completed) { %> compleated <% } %>" >\
							<%if (media.type == "video") { %>\
								<i class="icon-facetime-video"></i>\
							<%} else if (media.type == "link") { %>\
								<i class="icon-link"></i>\
							<% } else { %>\
								<i class="icon-picture"></i>\
							<% } %>\
							<%if (media.type != "image") { %>\
								<a target="_blank" href="<%= media.url %>" class="title"> <%= media.name %> </a>\
							<% } else { %>\
								<%= media.name %>\
							<% } %>\
							<i class="icon-trash"></i>\
						</div>\
						<div class="media-context">\
							<% if (media.type == "link") { %>\
								<p> <%= media.context %></p>\
							<% } else { %>\
								<img src="<%=media.context %>">\
							<% } %>\
						</div>\
						<div class="media-note">\
							<%if (media.note === "" || media.note === null) { %>\
								<p> Add a note</p>\
							<%} else { %>\
								<p> <%= media.note %></p>\
							<% } %>\
						</div>\
					</div>\
				<% } %>\
			</div>\
		</div>\
	'),

	initialize: function(){

		CR.events.bind("strategyChanged", this.displaySavedInReader, this);
		CR.events.bind("readerLoaded", this.updatePercentComplete, this);
		
		// count the number completed
		var strategyData = this.model.get("strategyData")
		for (var i = 0; i< strategyData.length; i++) {
			if (strategyData[i].completed == true)
				this.mediaComplete ++;
		}
		this.updatePercentComplete(this.mediaComplete/strategyData.length * 100);
	},
	
	render: function(){
		try{
			this.$el.html(this.template(this.model.toJSON()));
		}catch(err) { 
			console.log("Error when trying to render the review media strat");
			console.log(err);
		}

		return this;
	},
	
	clickMedia: function(ev) {
		
		// get the stratdata index of the one they clicked
		var num = $(ev.target.parentNode.parentNode).data("num");
		
		// get the data
		var strategyData = this.model.get("strategyData");
		
		// update it
		if (strategyData[num].completed == false) {
			strategyData[num].completed = true;
			mediaComplete ++;
			this.updatePercentComplete(this.mediaComplete/strategyData.length * 100);
		}
		
		//save the data we get from this strategy
		this.model.set("strategyData", strategyData);
		
		this.model.save();
	
		this.render();
	},
	
	removeMedia: function(ev) {
		// get the stratdata index of the one they clicked
		var num = $(ev.target.parentNode.parentNode).data("num");
		
		// get the data
		var strategyData = this.model.get("strategyData");
		
		// remove it
		strategyData.remove(num);
		
		//save the data we get from this strategy
		this.model.set("strategyData", strategyData);
		
		this.model.save();
		
		this.render();
	},
	
	editNote: function(ev) {
		
		var noteText = $(ev.target).text().trim();
		var mediaNoteDiv = $(ev.target.parentNode);
		
		// add the input box
		mediaNoteDiv.html("<textarea>"+ noteText +"</textarea> <input type='button' class='btn' value='Save'> ");
	},
	
	saveNote: function(ev) {
		// get the stratdata index of the one they clicked
		var num = $(ev.target.parentNode.parentNode).data("num");
		
		// get the new text
		var newNoteText = $(ev.target.parentNode.parentNode).find(".media-note textarea").val();

		// get the data
		var strategyData = this.model.get("strategyData");
		
		// change it
		strategyData[num].note = newNoteText;
		
		this.model.save();
		
		this.render();
	},

	// this function is run when the reader loads and it goes through and marks all of the saved 
	// links, videos, and images as saved
	displaySavedInReader: function(strat) {
	
		if (strat === "read") {
			
			// clear out all saved
			$(".saved").removeClass("saved");

			var strategyData = this.model.get("strategyData");

			// mark links that are already saved for review
			$("#readerPanel a").each(function(){
				var url = $(this).attr("href");
				for (var i = 0; i < strategyData.length; i ++) {
					var media = strategyData[i];
					if (media.url === url) {
						$(this).addClass("saved");
						$("#reviewMediaBtn").removeClass("hidden");
						break;
					}
				}
			});
			
			// mark videos that are already saved for review
			$("#readerPanel .playOverlay").each(function(){
				var url = $(this).data("url");
				for (var i = 0; i < strategyData.length; i ++) {
					var media = strategyData[i];
					if (media.url === url) {
						$(this.parentNode).addClass("saved");
						$("#reviewMediaBtn").removeClass("hidden");
						break;
					}
				}
			});
			
			// mark images that are already saved for review
			$("#readerPanel img").each(function(){
				var url = $(this).attr("src");
				for (var i = 0; i < strategyData.length; i ++) {
					var media = strategyData[i];
					if (media.context === url) {
						$(this.parentNode).addClass("saved");
						$("#reviewMediaBtn").removeClass("hidden");
						break;
					}
				}
			});
			
		}
		
	},

	updatePercentComplete: function(newPercent) {
		if (newPercent != null && newPercent != "") {
			this.model.set("percentComplete", newPercent);
		}
		$("#reviewMediaBtn .strat-percent").css("width", this.model.get("percentComplete")+"%");
	},
	
});

var MultimediaPopupView = Backbone.View.extend({

	tagName: "div",
	className: "popup",

	events: {
		"click .close" : "close",
		"click #media-review" : "reviewLater",
		"click #media-nothing" : "close",
		"click #media-keep" : "keep",
		"click #media-remove" : "removeMedia",
		"click #media-now" : "viewNow",
	},
	
	template: _.template('<div class="popup-header">' +
						 	 '<button type="button" class="close">x</button>' +
						 	 '<h2>Handle <%=this.options.type %></h2>' +
						 '</div>' +
						 '<div class="popup-body"> '+
						 '<div class="popup-subtitle">How would you like to handle this <%=this.options.type %>?</div>' +
						 '<textarea id="media-note" placeholder="Leave yourself a note"></textarea>' +
						 '</div>' +
						 '<div class="popup-footer"> '+
						 '<input id="media-nothing" type="button" class="btn btn-primary btn-danger popupbtn" value="Nothing"/> ' +
						 '<input id="media-review" type="button" class="btn btn-primary btn-success popupbtn" value="Review Later"/>' +
						 '<% if (this.options.type != "image") { %>' +
						 	'<input id="media-now" type="button" class="btn btn-primary btn-success popupbtn" value="View Now"/>' +
						 '<% } %>' + 
						 '</div>' ),

	savedtemplate: _.template('<div class="popup-header">' +
						 	 '<button type="button" class="close">x</button>' +
						 	 '<h2>Save <%=this.options.type %></h2>' +
						 '</div>' +
						 '<div class="popup-body"> '+
						 '<div class="popup-subtitle">You have already saved this <%=this.options.type %>. Do you want to remove it?</div>' +
						 '<textarea id="media-note" placeholder="Leave yourself a note"><%=this.options.note %></textarea>' +
						 '</div>' +
						 '<div class="popup-footer"> '+
						 '<input id="media-remove" type="button" class="btn btn-primary btn-danger popupbtn" value="Remove"/>' +
						 '<input id="media-keep" type="button" class="btn btn-primary btn-success popupbtn" value="Keep"/> </div>'),						 

	initialize: function() {
		
		// set the note data, if there is any
		if (this.options.saved == true) {
			
			var strategyData = CR.getMultimediaStratDataModel().get("strategyData");
			
			var multimediaUrl = null;
			if (this.options.type === "link") {
				multimediaUrl = $(this.options.target).attr('href');
			} else  if (this.options.type == "video"){
				multimediaUrl = $(this.options.target).find(".playOverlay").data("url");
			} else {
				multimediaUrl = $(this.options.target).find("img").attr("src");
			}
			
			for (var i = 0; i < strategyData.length; i ++) {
				var media = strategyData[i];
				if (media.url === multimediaUrl || media.context === multimediaUrl) {
					this.options.note = media.note;
					break;
				}
			}
		}

		// Render it, hide it, and start the fade-in
		this.render();
		$("body").append(this.el);		
		this.$el.hide();
		this.open();
		
	},
	
	reviewLater: function() {
		
		var target = $(this.options.target);
		
		target.addClass("saved");
		var note = this.$el.find('#media-note').val();

		var stratDataModel = CR.getMultimediaStratDataModel()
		
		if (this.options.type === "link") {
			// find the link within the context
			var context = this.options.target.parentNode.innerText;
			var startLink = context.indexOf(this.options.target.innerText); // for context
			context = context.substring(0, startLink).trim() + " <span class='media-location'> " + target.text().trim() + "</span> " + context.substring(startLink + target.text().length, context.length).trim();
			context = context.replace(/(\r\n|\n|\r)/gm,""); // remove more new lines and stuff
			
			// add new data to the stratdata model
			stratDataModel.addStrategyData('{"type": "link", "name": "' +target.text() + '", "note": "' + note +'", "url":"' + target.attr('href') + '", "context":"' + context + '"}');
			
		} else if (this.options.type === "video") {
			
			var imageUrl = target.parent().find("img").attr("src");
			// add new data to the stratdata model
			stratDataModel.addStrategyData('{"type": "video", "name": "Video", "note": "' + note +'", "url":"' + target.find(".playOverlay").data("url") + '", "context":"' + imageUrl + '"}');
		} else {
			// image
			
			var imageUrl = target.find("img").attr("src");
			// add new data to the stratdata model
			stratDataModel.addStrategyData('{"type": "image", "name": "Image", "note": "' + note +'", "url":"", "context":"' + imageUrl + '"}');
		}
		
		$("#reviewMediaBtn").removeClass("hidden");

		this.close();
	},
	
	viewNow: function() {
		var target = $(this.options.target);
			
		target.addClass("saved");
		var note = this.$el.find('#media-note').val();
		
		var stratDataModel = CR.getMultimediaStratDataModel()
		
		// open the link in a new tab
		var url = null;
		if (this.options.type === "link") {
			url = target.attr('href');
		} else { 
			url = target.find(".playOverlay").data("url");
		} 
		var win = window.open(url, '_blank');
		win.focus();
		
		this.close();
	},


	removeMedia: function() {
	
		$(this.options.target).removeClass("saved");
		
		var multimediaUrl = null;
		if (this.options.type === "link") {
			multimediaUrl = $(this.options.target).attr('href');
		} else  if (this.options.type == "video"){
			multimediaUrl = $(this.options.target).find(".playOverlay").data("url");
		} else {
			multimediaUrl = $(this.options.target).find("img").attr("src");
		}

		// remove media
		CR.getMultimediaStratDataModel().removeMedia(multimediaUrl); 
		
		this.close();
	},



	// Opens the popup
	open: function(){
		// If there's not a backdrop, add one
		if($("#notebookBackdrop").length == 0){
			$("body").append("<div id='notebookBackdrop' class='backdrop modal-backdrop' style='z-index: 111' hidden></div>");
		}
		$("#notebookBackdrop").fadeIn("fast");
    	this.$el.show("fast");
    },
	
    keep: function() {
	    // save new note 

    	var note = this.$el.find('#media-note').val();
    	
		var multimediaUrl = null;
		if (this.options.type === "link") {
			multimediaUrl = $(this.options.target).attr('href');
		} else  if (this.options.type == "video"){
			multimediaUrl = $(this.options.target).find(".playOverlay").data("url");
		} else {
			multimediaUrl = $(this.options.target).find("img").attr("src");
		}
		
		// edit note
		CR.getMultimediaStratDataModel().editMediaNote({url: multimediaUrl, note: note });
    	
    	this.close();
	},


    // Closes the popup
    close: function() {
		// If the notebook is hidden, fade out the backdrop
		if(!$("#Notebook").is(":visible")){
			$("#notebookBackdrop").fadeOut("fast");
		}
		var that = this;
		this.$el.fadeOut("fast", function() {
			that.clear();
		});
		//Re-enable scrolling
		$("#readerPanel").css("overflow-y", "scroll");
		// This reminder is done
		CR.nextReminder();
    },

    
    render: function(){
    	if (this.options.saved == false) {
    		this.$el.html(this.template());
    	} else {
    		this.$el.html(this.savedtemplate());
    	}

    	return this;
    },

    clear: function() {
    	
    },


});




Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

