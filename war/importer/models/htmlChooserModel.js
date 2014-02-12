
var HTMLChoice = Backbone.Model.extend({
    defaults: {
    	"name":"(unknown)",
    	"contents":null,
    },
    initialize:function(){
    	
    },
});

var HTMLChoiceCollection = Backbone.Collection.extend({
    model: HTMLChoice,
    //used to sort the models in the collection
});