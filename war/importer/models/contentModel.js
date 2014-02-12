
var ContentModel = Backbone.Model.extend({
    defaults: {
    	title:"",
    	contents:"",
    	description:"",
    	contentType:"default",
    	current:false,
    	bookId:0,
    	html:"",
    	json:"",
    	timeCreated:new Date().getMilliseconds(),
    },

    urlRoot:"/updateCaretContent",
    //make this content current and all others in its collection not current
    makeCurrent:function(){
    	this.collection.makeCurrent(this);
    },
    //wrap the html that we have generated with required html,body,header tags
    finishHTMLMarkup:function(){
    	var html = this.get("html");
    	var sections = $(html).find("section");
    	for(var i = 0; i < sections.length ; i++ ){
			$(sections[i]).attr("data-number",i);
		}
		this.set("html",html);
		//use the max width the user specified if they gave one.
    	var width = this.get("maxWidth") != null ? "style = 'max-width:" + this.get("maxWidth") + " !important;'" : "";
    	this.set("html", '<!DOCTYPE html>\
    	<html lang="en-US">\
	    	<head>\
	    		<title>' + this.get("title") + '</title>\
	    	</head>\
	    	<body>\
    		<div '+ width +' class="docHTML container">'
    		+ this.get("contents") +
    		'</div>\
    		</body>\
    	</html>')
    		
    	return this.get("html");
    },
});
var ContentCollection = Backbone.Collection.extend({
    model: ContentModel,
    initialize:function(){
    	this.bind("change add",function(content){
    		content.set("bookId",this.book.get("id"));
    	},this)
    },
    //get the current content
    getCurrent:function(){
    	if(this.current == null){
    		this.initCurrent();
    		return this.current;
    	}else{
    		return this.current;
    	}
    },
    //when a book is loaded find what should be the current content if there is a content for this book.
    initCurrent:function(){
    	var that = this;
    	var maxTimeStamp = null;
    	this.each(function(content){
    		//if we have a current then use it
    		if(content.get("current") === true){
    			that.current = content;
    		//otherwise find the most recently changed content and use that
    		}else if(that.current == null && (maxTimeStamp == null || new Date(content.get("timeCreated")) > new Date(maxTimeStamp.get("timeCreated")))){    		
    			maxTimeStamp = content;	    
    		}
    	});
    	if(this.current == null){
    		//if we don't have any content yet return null
    		if(maxTimeStamp == null){
    			return null;
    		}else{	
    			this.current = maxTimeStamp;
    		}
    	}
    	this.current.set("current",true);
    	return this.current;
    },
    //set the given model to be current and all other models to not current
    makeCurrent:function(model){
    	//tell the book this content belongs to to make itself current
    	this.book.makeCurrent();
    	//reset all the other content to be non current
    	this.each(function(curModel){
    		if(model != curModel){
    			curModel.set("current", false);
    		}
    	});
    	model.set("current", true);
    	model.save();
    },
    //clears the current for this collection
    clearCurrent:function(){
    	this.each(function(curModel){
    		curModel.set("current", false);
    	})
    },
});