
var TagSelectorView = Backbone.View.extend({
    id: "tagsContainer",
    initialize: function(){    	
    	
    	this.tags = new TagCollection(this.options.tags);
    	this.tagsView = new TagCollectionView({collection:this.tags});
    },
    events:{

    },
    render: function(){
    	this.$el.html(this.tagsView.render().el)
        return this;
    },
    template : _.template('\
    '),

});
var TagView = Backbone.View.extend({
	model:TagModel,
    className: "tag pointer",
    initialize: function(){
    	
    },
    events:{

    },
    render: function(){
    	this.$el.addClass(this.model.get("className"));
        this.$el.css("background-color",this.model.get("color"));
        this.$el.html(this.model.get("name"));
        var that = this;
    	this.$el.draggable({ 
    		connectToSortable: ".contentTags",
    		helper: "clone",
    		revertDuration:100,
    	    cursor: 'move',
    	});
        
        return this;
    },
});
var TagCollectionView = Backbone.View.extend({
	collection:TagCollection,
    id: "tags",
    initialize: function(){
    	
    },
    events:{

    },
    initialize : function() {
        //render these views to the html
        this.render();
    },
    template : _.template('\
    '),
    render : function(){
        this.$el.html(this.template());        
        // Render each View and append it to els
        var els = [];
        var that = this;
        this.collection.forEach(function(tag){
            var tagView = new TagView({
                model : tag,
            });
            that.$el.append(tagView.render().el)
        });
        // And all the base views to their element
        return this;
    },

}); 