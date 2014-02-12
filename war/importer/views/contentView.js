

var ContentView = Backbone.View.extend({
    className: "contentSelect well",
    initialize: function(){
    	this.model.on("change",this.render,this);
    },
    events:{
    	"click": "makeCurrent",
    },
    makeCurrent:function(){
    	this.model.makeCurrent();
    },
    render: function(){
    	if(this.model.get("current") == true){
    		this.$el.addClass("btn-info");
    	}else{
    		this.$el.removeClass("btn-info");
    	}
    	this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    template:_.template('\
    	<h3 class = "title" ><%=title%></h3>\
        Description: <span class = "description" ><%=description%></span>\
    	<br>\
    	Type: <span class = "type" ><%=contentType%></span>\
    	<br>\
    '),
});

