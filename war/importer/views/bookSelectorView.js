
var BookView = Backbone.View.extend({
	tagName:"li",
	className:"dropdown-submenu",
	events:{
    	"click .addContent": "addContent",
    	"click .accept" : "accept",
    	"click .cancel" : "cancel",
    	"makeCurrent" : "makeCurrent",
    },
	initialize: function(){
    	this.contentDrop = new ContentSelectorView({collection:this.model.chapters, bookName:this.model.get("title")});
    	
    	this.model.on("change:current",function(){
        	if(this.model.get("current") == true){
        		this.$el.addClass("current");
        		
                CRImport.menuTags = new TagTypeCollection($.parseJSON(this.model.get("tagTypes")));

        	}else{
        		this.$el.removeClass("current");
        		this.contentDrop.clearCurrent();
        	}
        },this);

    },
	render:function(){
    	this.$el.html(this.template(this.model.toJSON()));
    	//for the first render
    	if(this.model.get("current") == true){
    		this.$el.addClass("current");
    	}
    	this.$el.append(this.contentDrop.render().el);
    	return this;
	},
	template:_.template('\
    	<a tabindex="-1" href="#"><%=title%></a>\
    '),
})

var BookSelectorView = Backbone.View.extend({
	tagName:"ul",
	className:"dropdown-menu",
	collection:BookCollection,
    id: "bookSelector",
    initialize: function(){
    	this.collection.on("add",this.addOne,this);
    	CRImport.events.bind("saveBook",function(book){
    		this.collection.add(book);
    	},this);
    },
    events:{
    	"click .addBook": "addBook",
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
    addBook:function(){
    	CRImport.mainView.addBook();
    },
    saveBook:function(book){  	
    	book.set("current",false);  	
    	this.collection.add(book);
    },
    addOne:function(book){
    	var view = new BookView({model:book});
    	this.$el.append(view.render().el);
    },
    render: function(){
    	this.$el.html(this.template());
    	this.collection.each(this.addOne,this);
    	return this;
    },
    template:_.template('\
        <li class = "addBook"><button class = "btn btn-success">Add Book  <i class =" icon plusIcon icon-plus"></i>  </button></li>\
        <li class="nav-header">Books</li>\
    	<li style="height:2px" class="divider"></li>\
    '),
});