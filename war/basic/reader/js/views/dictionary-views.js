var dictionaryPopupView = Backbone.View.extend({
	id: "dictPopup",
	
	// tarp
	events: {
		"click #dict-close"            : "close",
		"click #dict-cancelBtn"        : "close",
		"click #dict-closeBothBtn"     : "closeBoth",
		"click #dict-singular"         : "lookupSingular"
	},
	
	initialize: function(){
		// Append itself to the body
		$("body").append(this.render().el);
		
		// draggable
		$("#dictPopup").draggable({
			handle: "#dict-header", 
			containment: "body",
			scroll: false,
		});
		
		if (CR.isIOS){
			this.$el.addClass('mobile')
		}
	},
	
	template: _.template('<div id="dict-header">' +
							 '<%= word %>  ' +
						 	 '<i id="dict-close" class="icon-remove"></i>' +
							 //'<button id="dict-close" type="button" class="close">x</button>' +
						 '</div>' +
						 '<div id="dict-body">' +
						 	'<div id="dict-bodyinner">' +
							 	'<h2>Looking up word.</h2>' +
						 	'</div>' +
						 '</div>'+
						 '<div id="dict-footer">' +
						 	'<input id="dict-closeBothBtn" type="button" class="btn btn-primary" data-dismiss="modal" value="Close Highlight and Dictionary"/>' +
						 	'<input id="dict-cancelBtn" type="button" class="btn" data-dismiss="modal" value="Done"/>' +
						 '</div>'
						 ),
		 
	showDict: function(){
		this.$el.show("fast");
	},
	
	closeBoth: function(){
		this.options.parentView.closeAndRemoveHL();
		this.close();
	},
						 
	close: function() {
		// Reset and close
		this.$el.hide("fast");
	},
	
	lookupSingular: function(){
		var dict = new dictionary({word: $('#dict-singular').html()});
		dict.getPage($('#dict-singular').html());
		this.model = dict;
		this.render();
		this.showDict();
	},
						 
	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.hide();
		// Highlight the text in the top bar
		// this.highlightSentences();
		return this;
	},
});
