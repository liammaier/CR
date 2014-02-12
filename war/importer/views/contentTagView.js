var ContentTagView = Backbone.View.extend({
	model:ContentTagModel,
    className: "contentTagContainer",
    tagName:"li",
    open:true,
    edit:true,
    forceRender:true,
    acceptClasses:"*",
    initialize: function(){
    	if(this.model.get("innerTags") == null){
    		this.model.set("innerTags", new ContentTagCollection());
    	}
    	this.tagsView = new ContentTagCollectionView({collection:this.model.get("innerTags"),tag:this.model.get("name"),tagClass:this.model.get("className"),view:this});
    	this.undelegateEvents();
        this.delegateEvents();
        this.model.bind("forceHTML",this.forceHTML,this);
        this.model.bind("getHTML",this.getHTML,this);
        this.model.bind("forceEdit",this.forceEdit,this);
    },
    
    events:{
    	"click .toggle" : "toggle",
        "click .toggleHTML" : "toggleHTML",
        "click .trash" : "trash",
        "swapIndex" : "swapIndex",
        "click .erase" : "erase",
        "getModel" : "getModel",
    },
    getModel:function(event, callback){
    	event.stopPropagation();
    	if(callback){
    		callback(this.model);
    	}else{
    		console.err("invalid args to function 'getCollection'");
    	}
    	return false;
    },
    //abstract
    headingSave:function(){
    	
    },
    //abstract
    editHeading:function(){
    	
    },
    getHTML:function(){
    	
    },
    forceEdit:function(){	
		$target = $(this.$el.find(".toggleHTML")[0])
		$target.addClass("icon-code").removeClass("icon-edit");
		$(this.$el.find(".content")[0]).show();
    	$(this.$el.find(".contentHTML")[0]).hide();
    	this.model.set("inHTML",false);
		this.edit = true;
		if(this.editor)this.editorReset();
		this.model.get("innerTags").each(function(tag){
			if(tag.get("name") != "Content Unit"){
				tag.trigger("forceEdit");
			}
		});
    },
    //helper function for switching the models in alignment with the views
    swapIndex:function(event,item,collection){
    	var index = item.index();
    	//if we are in the right collection
    	if(this.model.collection === collection){
    		
    		//make sure we didn't just drop in the same index
    		if(collection.indexOf(this.model) != index){
    			this.model.swapIndex(index,collection);
    			item.remove();
    		}
    	}
    },
    //implemented by children to use their erase functionality
    erase:function(event){
    	
    },
    //destroy the model and all it's children 
    trash:function(event){
    	event.preventDefault();
    	var that = this;
    	bootbox.confirm("Destroy this tag and any tags within it?", function(result) {
    		if(result == true){
    			that.$el.find('.trash').eq(0).tooltip('hide');
    			that.model.destroy();
    			that.destroyView();
        		CRImport.events.trigger("markupDirty",true);
    		}
    	});
    	return false;
    },
//    toggleInnerTags:function(event){
//    	if(event)event.preventDefault();
//    	var $tagArea = this.$el.find(".tagArea").eq(0)
//    	if($tagArea.is(":visible")){
//    		$tagArea.eq(0).hide("slide", { direction: "right" }, 1000);
//    	
//    	}else{
//    		$tagArea.eq(0).show("slide", { direction: "left" }, 1000);
//    	}
//    },
    //forces the children into html
    forceHTML:function(event,view){
    	if(view != this){
	    	//only trigger once (hopefully :P DAT FIREFOX)
	    	if(event)CRImport.events.trigger("markupDirty",true);
	    	this.headingSave();
	    	//tell aside to render
	    	if(this.model.asideLeftTags){
	    		this.model.asideLeftTags.each(function(tag){
	        		tag.trigger("forceHTML");
	        	})
	        	this.model.asideRightTags.each(function(tag){
	        		tag.trigger("forceHTML");
	        	})
	    	}
	    	console.log(this.model.get("innerTags").length)
	    	//tell children to render
	    	this.model.get("innerTags").each(function(tag){
	    		tag.trigger("forceHTML");
	    	})
	    	
			this.swapHTML(true);
	    	$(this.$el.find(".toggleHTML")[0]).addClass("icon-edit").removeClass("icon-code");
	    	this.model.set("inHTML",true);
			this.edit = false;
    	}
    },
    //toggle the editing on or off 
    toggleHTML:function(event){
    	event.preventDefault();
    	var $target = $(event.target);
    	var $content = this.$el.find(".contentTag");
    	//show rendered html
    	if(this.edit){

    		//if we have a section make sure that aside tags have room to render since it is float:left.
    		if(this.model.get("name") == "Section"){
    			var minheight = ($(this.$el.find(".asideLeftContainer")[0]).height() < $(this.$el.find(".asideRightContainer")[0]).height()) ? $(this.$el.find(".asideLeftContainer")[0]).height() : $(this.$el.find(".asideRightContainer")[0]).height();
    			$(this.$el.find(".contentHTML")[0]).css("min-height",$(this.$el.find(".asideLeftContainer")[0]).height());
    		}
    		if(this.forceRender){
    			this.forceHTML();
    		//code for doing checked rendering
    		}else{
	    		var canEdit = this.swapHTML();
	    		if(canEdit){
	    			$target.addClass("icon-edit").removeClass("icon-code");
	            	this.model.set("inHTML",true);
		    		this.edit = false;
	    		}
    		}
        //show edit content
    	}else{
    		this.forceEdit();
//    		$target.addClass("icon-code").removeClass("icon-edit");
//    		$(this.$el.find(".content")[0]).show();
//        	$(this.$el.find(".contentHTML")[0]).hide();
//        	this.model.set("inHTML",false);
//    		this.edit = true;
//    		this.editorReset();
    	}
    	return false;
    },
    //toggle the content div 
    toggle:function(event){
    	event.preventDefault();
    	var $target = $(event.target);
    	var $content = $(this.$el.find(".contentTag")[0]);
    	if(this.open){
    		$target.addClass("icon-chevron-down").removeClass("icon-chevron-up");
    		$content.slideUp("fast");
    		this.open = false;
    	}else{
    		$target.addClass("icon-chevron-up").removeClass("icon-chevron-down");
    		$content.slideDown("fast");    		
    		this.open = true;
    	}
    	return false;
    },
    //get the html of the children without changing states
    getChildHTML:function(){
    	var html = ""
    	var delayedImages = new Array();
    	this.model.get("innerTags").each(function(tag){
        	//need to get the html from the view, so tell all the views to save their html
    		tag.trigger("getHTML",null,tag);
    		
			html += tag.get("contentText");
    	});

    	return html;
    },
    getChildJSON:function(){
    	return this.model.get("innerTags").getJSON();
    },
    //logic for checking the other views to see if they are all in the right state,
	//then hide them and get their html if they are.
    swapHTML:function(force){
    	var rendered = true;
    	var childHTML = "";
    	//do the aside first so that it gets put at the start (for now)
    	if(this.tagsView != null){
	    	this.tagsView.collection.every(function(tag){
	    		//if we are dealing with an aside just use the real aside tag to get the html
	    		if(tag.get("name") === "Aside Placeholder" ){
	    			tag = tag.get("realTag");
	    		}
	    		if(tag.get("inHTML") == false){
	    			if(force === true){
	    				console.error("problem tags");
		    			return true;
	    			}else{
	    				rendered =  false;
		    			return false;
	    			}
	    		}else{
	    			childHTML +=  tag.get("contentText");
	    			return true;
	    		}
	    	});
    	}
    	
    	if(rendered){
    		var success = this.htmlView(childHTML);
    		if(success){
	        	this.model.set("inHTML",true);
	    		return true;
    		}
    	}else{
    		bootbox.alert("not all children are rendered");
    	}
		return false;
    },
    //abstract implemented by children views
    htmlView:function(childHTML){
    	
    },
    render: function(){

    	this.undelegateEvents();
        this.delegateEvents();
//    	this.model.set("inHTML",false);
		this.$el.html(this.header(this.model.toJSON()));
    	this.$el.append(this.template(this.model.toJSON()));
    	if(this.model.get("name") == "Aside Left" ||this.model.get("name") == "Aside Right"||this.model.get("name") == "Section" || this.model.get("name") == "Style"){
    		this.$el.find(".innerTags").html(this.tagsView.render().el);
    	}
    	this.$el.attr("class",this.$el.attr("class") + " " +this.model.get("className")+" ")
    	this.$el.find('.trash').eq(0).tooltip({title:"Delete Tag",delay:200});
    	this.$el.find('.toggle').eq(0).tooltip({title:"Toggle Interior Tags",delay:200});
    	this.$el.find('.toggleHTML').eq(0).tooltip({title:"Toggle Edit",delay:200});
        return this;
    },
    header : _.template('\
    	<div style = "background-color:<%=color%>" class = "tagName">\
    		<div class ="tagHeading"><%=name%></div>\
    		<i class="trash right icon-border icon-trash"></i>\
    		<i class="toggle right icon-border icon-chevron-up"></i>\
    		<i class="toggleHTML right icon-border <%if(inHTML){%>icon-edit<%}else{%>icon-code<%}%>"></i>\
		</div>\
	'),
	template : _.template('\
		<div style = "background-color:<%=color%>" class ="contentTag">\
    		<div class ="contentEditor"></div>\
		</div>\
    '),
    htmlTemplate : _.template('\
    '),

});
//Document View of the HTML
var DocumentView = ContentTagView.extend({
	model : ContentTagModel,
    id : "content",
	type : "default",
	typeName : "Default",
    initialize : function(){
    	
    	this.model = new ContentTagModel({type:"document",name:"Document"}); 
    	this.model.set("innerTags", new ContentTagCollection());
    	this.tagsView = new ContentTagCollectionView({collection:this.model.get("innerTags"),tag:"Document",className:"contentTags docTags"});
    	this.undelegateEvents();
        this.delegateEvents();
        this.model.bind("forceHTML",this.forceHTML,this);
        CRImport.events.bind("addSection",this.addSection,this);
        
    },
    events:function(){
		return _.extend({},ContentTagView.prototype.events,{
			 "click .title": "editHeading",
		     "focusout .headingEdit": "headingSave",
		     "change input" : "markupDirty",
		     "change .cssChooser": "changeCSS",
		     "input .docWidth" : "widthChange",
		});
	},
    changeContent:function(content){
    	//set our model to be json that was save for the content
    	try{
    		this.model = new ContentTagModel({type:"document",name:"Document",innerTags:$.parseJSON(content.get("json"))});
    	}catch(exception){
    		console.log(exception);
    	}
    	this.setHeading(content.get("title"));
    	this.tagsView = new ContentTagCollectionView({collection:this.model.get("innerTags"),tag:"Document",className:"contentTags docTags"});
    	this.render()
    },
	widthChange:function(event){
    	var width = this.$el.find(".docWidth").val();
    	if(width != null && width != ""){
    		this.model.set("maxWidth",width);
    		this.$el.find(".docHTML").css("max-width",width)
    	}
	},
	markupDirty:function(){
		CRImport.events.trigger("markupDirty",true);
	},
    headingSave:function(event){
		if(event)event.preventDefault();
		var editText = this.$el.find(".headingEdit").eq(0).hide().val();
		if(editText == ""){
			editText = "(NONE)";
		}
		//only set to dirty if we changed the heading
		if( editText != null && this.model.get("heading") != editText ){
			CRImport.events.trigger("markupDirty",true);
			this.model.set("heading",editText);
		}
		this.$el.find(".headingEdit").eq(0).hide();
		this.$el.find(".title").eq(0).text(editText).css('display', 'inline');
		return false
	},
	setHeading:function(heading){
    	//set the contentView's title (could be added to contentview as a function);
		this.model.set("heading",heading);
		this.$el.find(".headingEdit").eq(0).val(heading);
		this.$el.find(".headingEdit").eq(0).text(heading);
		this.headingSave();
    },
	editHeading:function(){
		if(event){
			event.preventDefault();
			if(event.target != this.$el.find(".title")[0]){
				return false;
			}
		}
		var head = this.$el.find(".title").eq(0).hide();
		this.$el.find(".headingEdit").eq(0).val(head.text()).css('display', 'inline').focus();
		return false;
	},
	changeCSS:function(event){
    	var type = $(event.target).val();
    	this.changeType(type);
    },
	changeType:function(type){
    	this.typeName = type;
    	prevType = this.type;
    	if(type == "New York Times"){
    		this.type = "nyt";
    	}else if(type == "Default"){
    		this.type = "default"
    	}else if(type == "National Science Foundation"){
    		this.type =  "nsf"
    	}else if(type == "National Science Foundation(Document)"){
    		this.type = "nsfDoc"
    	}else if(type == "National Science Foundation(Science Nation)"){
    		this.type = "nsfSN"
    	}else if(type == "Converted PDF(HTML)"){
    		this.type = "pdf"
    	}else if(type == "Campus Reader"){
    		this.type = "cr"
    	}
    	//change the css file to use for the current content
    	$("link.contentStyle").attr("href",$("link.contentStyle").attr("href").replace(prevType,this.type));
    	
    	this.$el.find(".cssChooser").val(this.typeName);
    },
    addSection:function(){
    	this.model.get("innerTags").setSectionNumbers();
    },
    htmlView:function(childHTML){
		//childHTML = childHTML.replace(/<br>(^(<img))/g, "");
    	this.model.set("contentText",childHTML);
		$(this.$el.find(".content")[0]).hide();
		$(this.$el.find(".contentHTML")[0]).show().html(childHTML);
		return true;
    },
    resetNoConfirm:function(model){
    	this.model.get("innerTags").reset();
		$(this.$el.find(".content")[0]).show();
		$(this.$el.find(".contentTags")[0]).html("");
    	$(this.$el.find(".contentHTML")[0]).hide().html("");
		CRImport.events.trigger("markupDirty",true);
    },
    //destroy the model and all it's children 
    erase:function(event){
    	var that = this;
    	if(event)event.preventDefault();
    	bootbox.confirm("Clear all the tags in the editor?", function(result) {
    		if(result == true){
    			bootbox.confirm("Are you REALLY sure you want to clear all the tags in the editor?", function(result) {
    	    		if(result == true){
    	    			that.model.get("innerTags").reset();
	    	    		$(that.$el.find(".content")[0]).show();
	    	    		$(that.$el.find(".contentTags")[0]).html("");
	    		    	$(that.$el.find(".contentHTML")[0]).hide().html("");
	    				CRImport.events.trigger("markupDirty",true);
    	    		}
            	})
    		}
    	});
    	return false;
    },
    render: function(){
    	this.$el.html(this.template(this.model.toJSON()));
    	$(this.$el.find(".content")[0]).append(this.tagsView.render().el);
    	this.$el.find('.erase').eq(0).tooltip({title:"Delete All Tags",delay:200});
    	this.$el.find('.toggle').eq(0).tooltip({title:"Toggle Interior Tags",delay:200});
    	this.$el.find('.toggleHTML').eq(0).tooltip({title:"Toggle Edit",delay:200});
    	this.$el.find('.title').eq(0).tooltip({title:"Click to Edit",delay:200});
        return this;
    },
    template : _.template('\
    	<div class = "tagName docHeader">\
    		<span class = "cssChooserContainer">\
    			<span style=" position: relative; top: -4px; "> Type: </span>\
	    		<select class="cssChooser selectpicker">\
					<option>Default</option>\
					<option>National Science Foundation</option>\
					<option>National Science Foundation(Science Nation)</option>\
					<option>National Science Foundation(Document)</option>\
					<option>New York Times</option>\
	    		</select>\
    		</span>\
    		<span class = "titleSelectorContainer">\
    			<span class = "titleLabel"> Title : </span>\
	    		<%if(heading !== ""){%>\
					<span class ="title"><%=heading%></span>\
					<input style = "display:none;" type="text" class="input-small headingEdit sectionHeading" placeholder="Title" value ="<%=heading%>">\
				<%}else{%>\
					<div class ="tagHeading secHead" style = "display:none;"><%=heading%></div>\
					<input  type="text" class="input-small headingEdit sectionHeading" placeholder="Section Heading" value ="<%=heading%>">\
				<%}%>\
    		</span>\
    		<span class = "widthSelectorContainer">\
				<span style=" position: relative; top: -4px; "> Width: </span>\
				<input  type="text" class="input-small docWidth" placeholder="Doc Width">\
    		</span>\
    		<i class = "erase right icon-border icon-eraser"></i>\
    		<i class = "toggle right icon-border icon-chevron-up"></i>\
    		<i class = "toggleHTML right icon-border icon-code"></i>\
		</div>\
    	<div class = "contentTag docTag">\
	    	<div class ="contentHTML docHTML container" style = "display:none;"></div>\
    		<div class ="content docContent"></div>\
		</div>\
	'),
//        	<button class="btn btn-large btn-primary edit" type="button">Add Tags</button>\
//        	<textarea id ="contentEditor"></textarea>\
});
var ContentTagCollectionView = Backbone.View.extend({
	collection:ContentTagCollection,
    className: "contentTags",
    tagName:"ul",
    sorting:false,
    initialize: function(){
        this.collection.on("add",this.addOne,this);
        this.collection.on("rerender",this.render,this);
        this.collection.on("removeOption",this.removeOption,this);
        this.collection.on("addOption",this.addOption,this);
    	this.undelegateEvents();
        this.delegateEvents();
    },
    events:{
    	"getCollection":"getCollection",

    },
    //add the (ui) option to drag here
    addOption:function(){
    	this.$el.addClass("highlight");
		this.$el.children(".ui-state-highlight").show();
    },
    //remove the (ui) option to drag here
    removeOption:function(){
    	console.log(this.el)
    	this.$el.removeClass("highlight");
		var highlight = this.$el.children(".ui-state-highlight");
		//HAXORZ TODO dont use hax if possible
		//hides the highlight so that it doesn't show for blacklisted items
		if(highlight != null)highlight.hide();
    },
    getCollection:function(event,callback){
    	event.stopPropagation();
    	if(callback){
    		callback(this.collection);
    	}else{
    		console.err("invalid args to function 'getCollection'");
    	}
    	return false;
    },
    addOne:function(tag){
    	var tagView = null;
    	switch(tag.get("name")){
    		case "Video":
    			tagView = new VideoView({
		            model : tag,
		        });
				break;
    		case "Image Link":
    			tagView = new ImageLinkView({
		            model : tag,
		        });
				break;
			case "Section":
				tagView = new SectionView({
		            model : tag,
		        });
				break;
			case "Content Unit":
				tagView = new TextView({
		            model : tag,
		        });
				break;
			case "Author":
				tagView = new AuthorView({
		            model : tag,
		        });
				break;
			case"Date Published":
				tagView = new DateView({
		            model : tag,
		        });
				break;
			case"Page Break":
				tagView = new PageBreakView({
		            model : tag,
		        });
				break;
			case"Image":
				tagView = new ImageView({
		            model : tag,
		        });
				break;
			case"Style":
				tagView = new StyleView({
		            model : tag,
		        });
				break;
			case"Aside Placeholder":
				tagView = new AsidePlaceholderView({
		            model : tag,
		        });
				break;
			case"Aside Left":
				tagView = new AsideLeftView({
		            model : tag,
		        });
				break;
			case"Aside Right":
				tagView = new AsideRightView({
		            model : tag,
		        });
				break;
			default:
				tagView = new ContentTagView({
		            model : tag,
		        });
				break;
    	}
    	
		if(tag.get("offset") != null){
			var children = this.$el.children();

			if(children.length == 0){
	    		this.$el.append(tagView.render().el)
			}else{
        		var offset = tag.get("offset");
        		//done to fix the difference between a drag and parsing dynamic adds
        		if(offset > children.length -1 )offset -= 1
        		//done to deal with json parsing and offsets being off by one
        		if($(children[offset]).length == 0) offset -= 1
    			$(children[offset]).after(tagView.render().el);
        	}
		}else{
    		this.$el.append(tagView.render().el)
		}
		if(tag.get("name") == "Content Unit"){
    		
			$(".contentTagContainer").trigger("forceHTML",tagView);
			if(tag.get("dropped") && tag.get("inHTML") == false){	    		
				tagView.setUpEditor();
			}else{
				tagView.forceHTML();
			}
		}

    },
    tagSort:function(event,ui){
    	var $item = $(ui.item);

		//if we are dropping a new tag
		var $context = $($item.context);
		if(this.options.tag === "Document" &&  $context.hasClass("section")){
			return {valid:true,tagType:"section"};
		}else if(this.options.tag === "Aside Left" && $context.is(".image,.text,.title,.style")){
			return {valid:true,tagType:"asideLeft"};
		}else if(this.options.tag === "Aside Right" && $context.is(".image,.text,.title,.style")){
			return {valid:true,tagType:"asideRight"};
		}else if(this.options.tag === "Style" && $context.is(".image,.text,.title")){
			return {valid:true,tagType:"style"};
		}else if(this.options.tag === "Section"){
			//adding to subsection
			if(this.options.tagClass.indexOf("subsection") != -1){
				if($context.hasClass("section")|| $context.hasClass("subsection")){
					return {valid:true,tagType:"subsection"};
				}else if($context.hasClass("asideLeft")|| $context.hasClass("asideRight")){
					return {valid:false,tagType:"unknown"};
				}else{
					return {valid:true,tagType:"unknown"};
				}
			//adding to section
			}else{
				if($context.hasClass("section")|| $context.hasClass("subsection")){
					return {valid:true,tagType:"subsection"};
				}else{
					return {valid:true,tagType:"unknown"};

				}
			}
		}
		return {valid:false,tagType:"unknown"};

    },
    modelTagSort:function(dragged,draggedTo){
    	var $context = $("<div class ='"+dragged.get("className")+"'></div>");
    	var name = draggedTo.get("name");
    	if(name === "Document" &&  ($context.hasClass("section")||$context.hasClass("subsection"))){
			return {valid:true,tagType:"section"};
		}else if(name === "Aside Left" && $context.is(".image,.text,.title,.style")){
			return {valid:true,tagType:"asideLeft"};
		}else if(name === "Aside Right" && $context.is(".image,.text,.title,.style")){
			return {valid:true,tagType:"asideRight"};
		}else if(name === "Style" && $context.is(".image,.text,.title")){
			return {valid:true,tagType:"style"};
		}else if(name === "Section"){
			//adding to subsection
			var className = draggedTo.get("className");
			if(className.indexOf("subsection") != -1){
				if($context.hasClass("section")|| $context.hasClass("subsection")){
					return {valid:true,tagType:"subsection"};
				}else if($context.hasClass("asideLeft")|| $context.hasClass("asideRight")){
					return {valid:false,tagType:"unknown"};
				}else{
					return {valid:true,tagType:"unknown"};
				}
			//adding to section
			}else{
				if($context.hasClass("section")|| $context.hasClass("subsection")){
					return {valid:true,tagType:"subsection"};
				}else{
					return {valid:true,tagType:"unknown"};

				}
			}
		}
		return {valid:false,tagType:"unknown"};
    },
    sort:function(){
    	var that = this;
    	this.$el.sortable({
    		handle:".tagName",
//    			function(event,el) {
//    			var $tagName = $(el).find(".tagName")
//    			var name = $tagName.text();
//    			name = (name == "") ? $tagName.html() :name;
//    			var background = $tagName.css("background-color")
//                return $('<div style = "background-color:'+background+';"class = "draggingTag pointer">'+ name +'</div>');
//            },
    	    cursor: 'move',
        	scrollSpeed:50,
        	scrollSensitivity: 80,
        	revert: false,
        	zIndex:10000000,
        	appendTo: ".docTag",
        	helper: "clone",
        	connectWith:".tag,.contentTags",
			placeholder: "ui-state-highlight",
			start:function(event, ui){
				//set the current dragging model
				$(ui.item).trigger("getModel",function(dragged){
					CRImport.dragged = dragged;
				});
			},
			activate:function(event, ui){
				
				that.$el.find(".contentTagContainer").trigger("editorSave");
				that.$el.removeClass("highlight").removeClass("highlighted");
				
				var $context = $(ui.item.context);
				var results = null;
				//if this is an adding tag
	    		if($context.hasClass("tag")){
	    			results = that.tagSort(event,ui);
	    			if(results.valid){
	    				that.$el.addClass("highlight");
						that.$el.children(".ui-state-highlight").show();
					}else{
						that.$el.removeClass("highlight");
						var highlight = that.$el.children(".ui-state-highlight");
						//HAXORZ TODO dont use hax if possible
						//hides the highlight so that it doesn't show for blacklisted items
						if(highlight != null)highlight.hide();
					}
	    		}else{
					//gets the collection of where we dragged to
	    			that.$el.trigger("getModel",function(draggedTo){
		    			if(that.modelTagSort(CRImport.dragged,draggedTo).valid){
		    				draggedTo.get("innerTags").trigger("addOption");
						}else{
							draggedTo.get("innerTags").trigger("removeOption");
						}
		    		});
	    		}
			},
			sort:function(event, ui){
				var $scroll = $(".docTag");
				var $parent = $($(ui.item.context).parent());
				//see if we need to force down the scrollbar to the bottom to allow tag adding at the bottom.
				if($(ui.item).hasClass("tag") && $scroll.eq(0).scrollTop() > 100 && $scroll[0].scrollHeight - $scroll.height() - $scroll.scrollTop() < 80){
					$scroll.scrollTop($scroll[0].scrollHeight);
				}
				
				var $context = $(ui.item.context);
				var results = null;
				//if this is an adding tag
	    		if($context.hasClass("tag")){
	    			if(!that.tagSort(event,ui).valid){
	    				that.$el.removeClass("highlight");
						var highlight = that.$el.children(".ui-state-highlight");
						//HAXORZ TODO dont use hax if possible
						//hides the highlight so that it doesn't show for blacklisted items
						if(highlight != null)highlight.hide();
					}
	    		}else{
					//gets the collection that we dragged to
	    			ui.placeholder.parent("ul.contentTags").trigger("getModel",function(draggedTo){
		    			if(that.modelTagSort(CRImport.dragged,draggedTo).valid){
		    				draggedTo.get("innerTags").trigger("addOption");
						}else{
							draggedTo.get("innerTags").trigger("removeOption");
						}
		    		});
	    		}
			},
			over:function(event, ui){
				
			},
			deactivate:function(event, ui){
				that.$el.removeClass("highlight").removeClass("highlighted");;
			},
//			stop:function(event, ui){
//				that.$el.find(".contentTagContainer").trigger("editorReset");
//				//see if the place that the tag is being dropped
//				if(!that.tagSort(event,ui).valid){
//					ui.item.remove();
//				}
//			},
	    	stop:function(event, ui){
				var $item = $(ui.item);
				//if we are dropping a new tag
				var $context = $($item.context);
				var $target = (event.target);
			
				//if this is an adding tag
	    		if($context.hasClass("tag")){
	    			
		    		var results = that.tagSort(event,ui)
					if(results.valid){
						var name = $context.find(".tagHeading").eq(0).text()
		    			name = (name == "") ? $context.html() :name;
			    		var className = $item.attr("class").replace("contentTagContainer","").replace("pointer","").replace("tag","").replace("ui-draggable", "").trim();
		    			//used for dropping the new tags into the correct index and not adding them with sortable
						//markup is now dirty
						CRImport.events.trigger("markupDirty",true);
						//section or subsection
						if(results.tagType == "section" || results.tagType.indexOf("subsection") != -1){
							var model = new ContentTagModel({
			    				color:$context.css("background-color"),
			    				name:$context.text(),
			    				className:results.tagType,
			    				parentModel:that.model,
			    				tagType:"h3",
			    			})
							//fix model indexing
	    					model.swapIndex($item.index(),that.collection);
			    			CRImport.events.trigger("addSection");
		    			}else if($context.hasClass("asideLeft")){
		    				that.options.view.addAsideLeft(null,$item.index(),that.collection);
		    			}else if($context.hasClass("asideRight")){
		    				that.options.view.addAsideRight(null,$item.index(),that.collection);
		    			}else{
		    				var model = new ContentTagModel({
			    				color:$context.css("background-color"),
			    				name:name,
			    				className:results.tagType,
			    				dropped:true,
			    			})
		  	    			model.swapIndex($item.index(),that.collection);
		    			}
		    		    CRImport.sortDrag = "sortable"
					}
		    		$item.remove();
			    //used for inserting or resorting the collection	
	    		}else{
		    		//swap between collections
		    		if($context.closest(".contentTags")[0] != that.el){
			    		//gets the model with the collection we dragged to
		    			
		    			ui.item.parent("ul.contentTags").trigger("getModel",function(draggedTo){
			    			var results =that.modelTagSort(CRImport.dragged,draggedTo);
			    			if(results.valid){
			    				//if we are changing a section to a subsection
			    				if(results.tagType == "subsection" || results.tagType == "section"){
			    					CRImport.dragged.set("className",CRImport.dragged.get("className").replace(/(sub)*section/gi,"")+" "+results.tagType);
			    					console.log(CRImport.dragged.get("className"))
			    				}
				    			var addCollection = draggedTo.get("innerTags");
				    			var removeCollection = CRImport.dragged.collection;
				    			
								//remove from the old
				    			removeCollection.remove(CRImport.dragged);
				    			
				    			//make sure the offset of the tag model is correct for the new collection
				    			CRImport.dragged.set("offset",$item.index())
				    			//add it into the new collection
				    			addCollection.add(CRImport.dragged,{at:$item.index()});
				    			//remove the placeholder that we dragged
				    			CRImport.dragged = null;
			    			}else{
			    				CRImport.dragged.collection.trigger("rerender");
			    			}			
			    			$item.remove();

			    		});
			    	//swap in the same collection
		    		}else{
		    			$item.trigger("swapIndex",[$item,that.collection]);
		    			$item.trigger("editorReset");
		    			CRImport.dragged = null;
		    		}
		    		
					CRImport.events.trigger("markupDirty",true);
	    		}
			},
        })
    },
    render : function(){
    	this.$el.html("");
        this.collection.forEach(this.addOne,this);
        // And all the base views to their element
    	this.sort();
        return this;
    },
    findIndex:function(){
    	return 0;
    }

}); 