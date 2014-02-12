
var BookModel = Backbone.Model.extend({
    defaults: {
    	title:"",
    	description:"",
    	contentType:"default",
    	current:false,
    	timeCreated:new Date().getMilliseconds(),
    	chapters:"",
    	tagTypes:"[]",
    },
    initialize:function(){
    	if(this.get("chapters") != ""){
    		this.chapters = new ContentCollection(jQuery.parseJSON(this.get("chapters")));
    	}else{
    		this.chapters = new ContentCollection();
    	}
    	this.chapters.book = this;
    },
    getCurrent:function(){
    	return this.chapters.getCurrent();
    },
    initCurrent:function(){
    	return this.chapters.initCurrent();
    },
    urlRoot:"/updateCaretBook",
    makeCurrent:function(){
    	this.collection.each(function(model){
    		if(model != this){
    			model.set("current", false);
    			model.chapters.clearCurrent();
    		}
    	})
    	this.set("current", true);
    	//this.save();
    },
});
var BookCollection = Backbone.Collection.extend({
    model: BookModel,
    getCurrent:function(){
    	if(this.current == null){
    		this.initCurrent();
    		return this.current;
    	}else{
    		return this.current;
    	}
    },
    initCurrent:function(){
	    var that = this;
		var maxTimeStamp = null;
		this.each(function(book){
			//if we have a current then use it
			if(book.get("current") === true){
				that.current = book;
				//otherwise find the most recently changed book and use that
			}else if(that.current == null && (maxTimeStamp == null || new Date(book.get("timeCreated")) > new Date(maxTimeStamp.get("timeCreated"))) && book.chapters.length > 0){
				maxTimeStamp = book;	    		
			}
		});
		if(this.current == null){
			//if we are still null we dont have any content yet
			if(maxTimeStamp == null){
				return null;
			}else{	
				this.current = maxTimeStamp
			}
		}
		this.current.set("current",true);
		return this.current;
	}
});