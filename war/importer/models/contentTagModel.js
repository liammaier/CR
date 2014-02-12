
var ContentTagModel = Backbone.Model.extend({
    defaults: {
    	elId:"",
    	color:"",
        name:"null",
        number:"",
        author:"",
        className:"",
        contentText:"",
        heading:"",
        saraTag:null,
        inHTML:null,
        label: "",
        credit:"",
        source:"",
        date:"",
        orgURL:"",
        //default to span
        tagName:"span",
        orginal:null,
        width:"auto",
        innerTags:"",
    },
    initialize:function(){
    	this.set("inHTML",false) ;
    	//init from json
    	if(this.get("innerTags") != null && this.get("innerTags").models == null){
    		//if we have inner tags convert them from json
	    	this.set("innerTags" , 
	    		new ContentTagCollection(
//		    		_.map(this.get("innerTags"),function(content){
//			    		var output = $.parseJSON(content);
//						return new ContentTagModel(output);
//		    		})
	    			this.get("innerTags")
	    		)
	    	);
			console.log(this.get("innerTags"));
    	}else{
    		this.set("innerTags", new ContentTagCollection());
    	}

    },
    initFromJSON:function(){
    	
    	
    	return this;
		
    },
    addTag:function(tag){
    	this.get("innerTags").add(tag);
    },
    swapIndex:function(index,collection){

		collection.remove(this);
		
		/** Concept for hooking up backbone collection and JQuery sort was copied from a blog post at http://blog.cymen.org/2012/04/13/an-example-of-using-jquery-ui-sortable-on-a-backbone-js-collection-view-with-item-views/ **/
		//loop through the collection and set the offset of each index
		collection.each(function (model, curIndex) {
            var offset = curIndex;
            //if this index is higher that the one we are swapping to
            if (curIndex >= index)
            	offset += 1;
            model.set('offset', offset);
        }); 
		
		this.set('offset', index);
	    collection.add(this, {at: index});
 
    },
});
var ImageTagModel = ContentTagModel.extend({
	 defaults:_.extend({},ContentTagModel.prototype.defaults,
		{
			name:"Image",
		 	color:"white",
		 	label:"",
		 	source:"",
		 	credit:"",
		}
	 ) 
});
var AuthorTagModel = ContentTagModel.extend({
	 defaults:_.extend({},ContentTagModel.prototype.defaults,
		{
		 	author:"",
		 	color:"yellow"
		}
	 ) 
});

var ContentTagCollection = Backbone.Collection.extend({
    model: ContentTagModel,
    //used to sort the models in the collection
    comparator: function(model) {
    	//TODO add offsets as models are added;
        return model.get('offset');
    },
    //recursive to get all of the models to save in json
    getJSON:function(){
    	var sections = new Array();
    	
    	return this.map(function(model){
    		return model.getJSON();
    	});
    },
    //used to output the section for export
    getSectionsJSON:function(){
    	var sections = new Array();
    	
    	this.each(function(model){
    		var isSubsection = model.get("className") === "subsection";
			sections.push({sectionNumber: model.get("number") , name: model.get("heading") , subsection: isSubsection});
			sections.concat(model.get("innerTags").getSectionsJSON());
    	});
    	
    	return sections;
    },
    //sets the section numbers for when a section is added to the tree
    setSectionNumbers:function(i){
    	if(i == null){
    		i = 0;
    	}
    	var startI = i; 

    	var sections = this.each(function(model){
    		var j = i;
    		i++;
    		var innerSectionsLength = model.get("innerTags").setSectionNumbers(i);
    		i+= innerSectionsLength;
    		model.set("number",j);
    	});
    	return i -startI;
    },
    //simple gets all the pages and returns an array of the models
    getPages:function(){
    	var pages = new Array();
    	this.each(function(model){
    		if(model.get("name") === "Page Break"){
    			pages.push(model);
    		}else if(model.get("name") === "Section"){
    			pages = pages.concat(model.get("innerTags").getPages());
    		
    		}
    	
    	});
    	return pages;
    },
    isSection:function(){
    	this.each(function(tag){
    		if(this.tag.get("name") !== "Section"){
    			return false;
    		}
    	});
    	return true;
    },
    
});