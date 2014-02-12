var TagSelector = Backbone.Model.extend({
    defaults: {
        
    }
});
var TagModel = Backbone.Model.extend({
    defaults: {
        name:"null",
        content:null,
        //default to span
        saraTag:null,
        tagType:"span",
        className:""
    }
});
var TagCollection = Backbone.Collection.extend({
    model: TagModel,
    
});