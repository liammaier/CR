var HighlightWidgetView = Backbone.View.extend({
	tagName: "div",
	id: "highlightWidget",

	events: {
		'touchend #nativeHLBtn' : 'done',
	},
	
	template: _.template("<div id='hlWidget-header'>In Highlighting Mode</div><div id='hlWidget-body'><input type='button' id='nativeHLBtn' value='DONE' class='btn btn-large btn-warning'/></div>"),
	
	initialize: function(){
		$('body').append(this.$el.html(this.template()));
		$("#highlightWidget").draggable({
			handle: "#hlWidget-header", 
			containment: "body",
			scroll: false,
		});
	},
	
	done: function(){
		console.log("In Highlighting Mode")
		console.log("Done button clicked")
		CR.events.trigger("nativeHighlightDone");
		this.$el.hide();
	},
	
	show: function(){
		this.$el.show();
	},
	
	hide: function(){
		this.$el.hide();
	}
});