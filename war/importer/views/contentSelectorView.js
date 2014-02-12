
var ContentView = Backbone.View.extend({
	tagName:"li",
	initialize: function(){
		var that = this;
		this.model.on("change",this.render,this);
        this.model.on("change:current",function(){
        	if(this.model.get("current") == true){
        		this.$el.addClass("current");
        		this.$el.trigger("makeCurrent");
        	}else{
        		this.$el.removeClass("current");
        	}
        },this);
    },
	events:{
    	"click": "swapContent",
    	"click .contentEdit": "edit",
    	"click .contentTrash": "remove",
    },
    swapContent:function(){
    	this.model.makeCurrent();
    	//changes the content to this content
    	CRImport.mainView.contentChange(this.model);
    },
    edit:function(){
    	event.stopPropagation();
    	CRImport.mainView.saveAs(this.model);
    	return false;
    },
    remove:function(){
    	/**disable for now so that we don't have to handle the case where we delete the last content**/
//    	this.model.destroy();
//		this.destroyView();
    },
	render:function(){
    	this.$el.html(this.template(this.model.toJSON()));
    	//for the first render
    	if(this.model.get("current") == true){
    		this.$el.addClass("current");
    	}
    	return this;
	},
	template:_.template('\
		<a style = "clear:none; padding-right:30px;" href="#"><%=title%></a>\
		<i class="contentEdit icon-large icon-edit" data-original-title=""></i>\
    '),
})

var ContentSelectorView = Backbone.View.extend({
	tagName:"ul",
	className:"dropdown-menu",
	collection:ContentCollection,
    id: "contentSelector",
    initialize: function(){
    	this.collection.on("add",this.addOne,this);
    },
    events:{
    	"click .addContent": "addContent",
    },

    hideModal:function(){
    	this.$el.hide().find(".modal").modal("hide");
    },
    //if there is no current it will be set first
    initCurrent:function(){
    	return this.collection.initCurrent();
    },
    getCurrent:function(){
    	return this.collection.getCurrent();
    },
    clearCurrent:function(){
    	this.collection.each(function(content){
    		//if we have a current then use it
    		content.set("current",false);
    	});
    },
    addContent:function(){
    	var contentModel = new ContentModel({bookId:this.collection.book.get("id")});
    	CRImport.mainView.addContent(this.collection,contentModel); 
    },
    addOne:function(content){
    	var view = new ContentView({model:content});
    	this.$el.append(view.render().el);
    },
    render: function(){
    	this.$el.html(this.template());
    	this.collection.each(this.addOne,this);
    	return this;
    },
    template:_.template('\
    	<li class = "addContent"><button class = "btn btn-success" value ="">Add Content  <i class =" icon plusIcon icon-plus"></i>  </button></li>\
        <li class="nav-header"><%=this.options.bookName%>\'s Content</li>\
        <li style="height:2px" class="divider"></li>\
    '),

});