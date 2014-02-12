
var PreviewView = Backbone.View.extend({
    id: "preview",
    initialize: function(){
    	this.previewElement = new ElementPreviewCollectionView({collection:new ContentTagCollection(),});
    },
    events:{

    },
    addOne:function(tag){
    	this.previewElement.addOne(tag);
    },
    render: function(){
    	this.$el.html(this.previewElement.render().el)
        return this;
    },
    template : _.template('\
    '),
});
var ElementPreviewView = Backbone.View.extend({
	model:ContentTagModel,
    id: "preview",
    initialize: function(){
    	this.model.on("change",this.render,this);
    },
    events:{

    },
    render: function(){
    	this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    template : _.template('\
        <%=name%>\
    	<<%=tagType%>>\
    		<%if(content != null){\
    			console.log(content)%>\
    			<%=contentText%>\
    		<%}%>\
    	</<%=tagType%>>\
    '),

});
var ElementPreviewCollectionView = Backbone.View.extend({
	collection:ContentTagCollection,
    id: "allPreview",
    initialize: function(){
    	
    },
    events:{

    },
    initialize : function() {
        //render these views to the html
        this.render();
    },
    template : _.template('\
    		<%=name%>\
    '),
    addOne:function(tag){
        var tagView = new ElementPreviewView({
            model : tag,
        });
        this.$el.append(tagView.render().el)
    },
    render : function(){
        this.$el.html(this.template());        
        // Render each View and append it to els
        var els = [];
        var that = this;
        this.collection.forEach(this.addOne,this);
        // And all the base views to their element
        return this;
    },

}); 