
var FontsizeView = Backbone.View.extend({

	tagName: "div",
	textNodeArray: new Array(),
	className: "fontsizeview",
	events: {
		"click #fontMinusBtn"    : "downFontSize",
		"click #fontPlusBtn"     : "upFontSize",
	},

	template: _.template('<div id="fontNavDiv">Font: ' +
		 	'<input id="fontMinusBtn" type="button" class="btn" value="-"/>&nbsp;' +
		 	'<input id="fontPlusBtn" type="button" class="btn" value="+"/></div>'),
	
	initialize: function(){

	},
	
	upFontSize: function() {
		CR.log("fontsize", CR.getCurrentStrategy(), CR.contentID, "null", "bigger", "");
		this.upFont($("#readerPanel"));
		$("#readerCanvas").trigger("reviewResize");
	},
	
	downFontSize: function() {
		CR.log("fontsize", CR.getCurrentStrategy(), CR.contentID, "null", "smaller", "");
		this.downFont($("#readerPanel"));
		$("#readerCanvas").trigger("reviewResize");
	},
	
	upFont: function($obj) {
		var that = this;
		if(this.textNodeArray.length > 0){
			// Already memoized
			for(var i = 0; i < this.textNodeArray.length; i++){
				this.textNodeArray[i].css({
					"font-size": function(index, value) {
						return parseFloat(value) * 1.1;
					},
				});
			}
		}else {
			$obj.find("span:[data-sara-original]").each(function(index){
				$(this).css({
					"font-size": function(index, value) {
						return parseFloat(value) * 1.1;
					},
				});
				that.textNodeArray.push($(this));  //textNodeArray is null for some reason
			});
		}
	},
	
	downFont: function($obj) {
		var that = this;
		if(this.textNodeArray.length > 0){
			// Already memoized
			for(var i = 0; i < this.textNodeArray.length; i++){
				this.textNodeArray[i].css({
					"font-size": function(index, value) {
						return parseFloat(value) / 1.1;
					},
				});
			}
		}else {
			$obj.find("span:[data-sara-original]").each(function(index){
				$(this).css({
					"font-size": function(index, value) {
						return parseFloat(value) / 1.1;
					},
				});
				that.textNodeArray.push($(this));
			});
		}
	},
	
	render: function(){	
		this.$el.html(this.template());
		return this;
	},

	remove: function(){
		this.$el.remove();
	},

});