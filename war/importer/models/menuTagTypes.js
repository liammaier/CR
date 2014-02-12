
var TagTypeModel = Backbone.Model.extend({
    defaults: {
		label : "none",
		command : "null",
		group : 'image',
		order : 1
    },
    initialize:function(){
    	
    },
   
});


var TagTypeCollection = Backbone.Collection.extend({
    model: TagTypeModel,
    getItems:function(){
    	var object = {}
    	this.each(function(tag){
    		object[tag.get("label")] = tag.attributes
    	});
    	return object;
    },
    initialize:function(){
    	//when we add a tag save it to the server
    },
});