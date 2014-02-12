var PopupView = Backbone.View.extend({

	model: Popup,
	tagName: "div",
	className: "popup",

	events: {
		"click .close"       		: "close",
		"click .popup-dismissBtn"   : "close",
		"click .popup-reviewBtn"    : "popNotebookAndClose",
		"click .popup-backLibBtn"   : "backToLibrary",
		"click .popup-endBtn"       : "logout",
	},
	
	template: _.template('<div class="popup-header">' +
						 	 '<button type="button" class="close">x</button>' +
						 	 '<h2><%= title %></h2>' +
						 	 '<div class="popup-subtitle"><%= subtitle %></div>' +
						 '</div>' +
						 '<div class="popup-body"><%= message %><br>' +
						 '</div>' +
						 '<div class="popup-footer"></div>'),
	
	initialize: function() {
		// Render it, hide it, and start the fade-in
		this.render();
			
		// The review popup buttons
		if(this.options.continueReadingBtn){
			this.$el.find(".popup-footer").append('<input type="button" class="btn btn-primary popupbtn popup-dismissBtn" value="Continue Reading"/>');
		}		
		if(this.options.reviewNotebookBtn){
			this.$el.find(".popup-footer").append('<input type="button" class="btn btn-success popupbtn popup-reviewBtn" value="Review Notebook"/>');
		}

		//The end session popup buttons
		if(this.options.backLibraryBtn){
			this.$el.find(".popup-footer").append('<input type="button" class="btn btn-primary popupbtn popup-backLibBtn" value="Back to Library"/>');
		}
		if(this.options.endBtn){
			this.$el.find(".popup-footer").append('<input type="button" class="btn btn-primary popupbtn popup-endBtn" value="Logout"/>');
		}
		
		//The reminder popup button
		if(this.options.closeBtn){
			this.$el.find(".popup-footer").append('<input type="button" class="btn btn-primary popupbtn popup-dismissBtn" value="Close"/>');
		}
		
		$("body").append(this.el);		
		this.$el.hide();
		this.open();
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

    popNotebookAndClose: function() {
		CR.events.trigger("openNotebook");
		this.close();
    },

    backToLibrary: function() {
    	$("#backMenuBtn").trigger("click");
    },
    
    logout: function() {
    	window.location = "/logout";
    },
    
    render: function(){
    	this.$el.html(this.template(this.model.toJSON()));
    	return this;
    },

    clear: function() {
    	this.model.clear();
    },

});

