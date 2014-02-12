var HTMLChoiceView = Backbone.View.extend({
	model:HTMLChoice,
	tagName: "li",
	className:"btn-info htmlChoice",
    initialize: function(){
    	$("#importAcceptHTML").attr("disabled", false);
    	this.undelegateEvents();
        this.delegateEvents();
    },
    events:{
        "click": "changeCurrent",
        "click .remove": "removeEl",
    },
    removeEl:function(event){
    	event.stopPropagation();
    	if(this.model.collection.length <= 1){
    		$("#importAcceptHTML").attr("disabled", true);
    	}
    	this.model.destroy();
    	this.remove();
    	return false;
    },
    changeCurrent:function(event){
    	event.stopPropagation();
    	
    	this.model.collection.each(function(model){
    		model.set("current",false);
    	});
    	
    	this.model.set("current", true);
    	this.model.collection.trigger("rerender");
    	return false;
    },
    render: function(){
    	this.$el.html(this.template(this.model.toJSON()));
    	if(this.model.get("current")){
    		this.$el.removeClass("btn-info").addClass("btn-success");
    	}else{
    		this.$el.removeClass("btn-success").addClass("btn-info");
    	}
    		
    	return this;
    },
    template:_.template('\
    		<i class="right remove icon-remove"></i><%=name%>\
    '),
});

	
var HTMLChooserView = Backbone.View.extend({
	collection:HTMLChoiceCollection,
	tagName: "ul",
	className:"htmlChooser",
	first:true,
    initialize: function(){
    	this.collection.on("add",this.addOne,this);
    	this.collection.on("rerender",this.render,this);
    	this.collection.on("reset",this.reset,this);
    },
    events:{
    },
    add:function(model){
    	if(this.getCurrent() == null){
    		model.set("current",true);
    	}
    	this.collection.add(model);
    },
    getCurrent:function(){
    	var current = this.collection.find(function(model){
    		return model.get("current") == true;
    	});
    	
    	if(current == null){
			firstModel = this.collection.at(0)
    		if(firstModel != null){
				firstModel.set("current",true);
				return firstModel;
    		}else{
    			return;
    		}
    	}else{
    		return current
    	}
    },
    addOne:function(model){
    	this.$el.find("#none").hide();
    	var view = new HTMLChoiceView({model:model});
    	this.$el.append(view.render().el);
    },
    render: function(){
    	if(this.collection.length){
        	this.$el.html(this.template());

    	}else{
        	this.$el.html("");

    	}
    	this.$el.html(this.template());
    	this.collection.each(this.addOne,this);
    	return this;
    },
    template:_.template('\
    		<h5 id ="none">No HTML Files Found</h5>\
    '),
})