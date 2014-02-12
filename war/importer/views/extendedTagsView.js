var PageBreakView = ContentTagView.extend({
	getHTML:function(childHTML,model){
		var page = this.$el.find("#pageNumber").val();
		this.model.set("number",page);
		var html = "\
			<div class = 'pagebreak'>\
				<p></p>\
				<p><span class='pagenumber'>"+page+"</p>\
			</div>";
		this.model.set("contentText",html);
		return html;
	},
	htmlView:function(){
		//var page = parseInt(this.$el.find("#pageNumber").val());
		//if the text has a valid number
		//if(!isNaN(page)){
	    	$(this.$el.find(".content")[0]).hide();
	    	$(this.$el.find(".contentHTML")[0]).show().html(this.getHTML());
	    	return true;
//		}else{
//    		alert("Not a valid page number.");
//			return false;
//		}
		
    },
	template : _.template('\
		<div class = "pageBreakTag contentTag" style =  " padding-top:10px; background-color:<%=color%>" class ="contentTag">\
			<div class ="contentHTML" style = "\
				<%if(!inHTML){%>\
					display:none;\
				<%}%>\
			background-color:<%=color%>;">\
			</div>\
			<div class ="content" style = "\
			<%if(inHTML){%>\
				display:none;\
			<%}%>\
			"><form class="form-horizontal">\
				  <div class="control-group row-fluid">\
				    <label class="control-label" for="pageNumber">Page Number</label>\
				    <div class="controls">\
			 			<div class="span2 row"><input type="text" id="pageNumber" placeholder="Page Number" value = "<%=number%>"></div>\
				    </div>\
				  </div>\
				</form>\
			</div>\
		</div>\
    '),
});
var AsideLeftView = ContentTagView.extend({
	initialize: function(options){
    	//super constructor first
    	this.constructor.__super__.initialize.apply(this, [options]);
    	this.model.bind("destroy",this.removePlace,this);
    	this.$el.addClass("asideLeft");
    	this.model.set("className","asideLeft");
    },
    forceHTML:function(){
    	this.constructor.__super__.forceHTML.apply(this,[]);
    	this.$el.css("float","left");
    	var that = this;
    	this.$el.switchClass("","asideLeftRendered",600,"swing",function(){
    		_.each(that.$el.siblings(":not(.asideLeftRendered,.asideRightRendered)"),function(tag){
        		var $children = $(tag).children()
        		var width = $children.eq(0).css("width");
        		if(!_.every($children,function(headerOrBody){
        			return width == $(headerOrBody).css("width");
        		})){
        		//if the width of a header is not the same as its body
        			$(tag).css("clear","both");
        		}
        		
        	},that);
    	});
    },
    forceEdit:function(){
    	this.constructor.__super__.forceEdit.apply(this, []);
    	this.$el.css("float","none");
    	this.$el.switchClass("asideLeftRendered", "",600,"swing",null);
    },
    getHTML:function(childHTML){
    	if(childHTML == null || childHTML == ""){
    		childHTML = ""
    		this.model.get("innerTags").each(function(model){
    			 childHTML += model.trigger("getHTML").get("contentText");
    		})
    	}
    	var html = "<div class = 'articleInline runaroundLeft'>"+ childHTML + "</div>"
		this.model.set("contentText",html);
    	return html;
    },
	htmlView:function(childHTML){
		//if(childHTML !== ""){
	    	$(this.$el.find(".content")[0]).hide();
	    	$(this.$el.find(".contentHTML")[0]).show().html(this.getHTML(childHTML));
	    	//get rid of empty asides
		//}else{
			//TODO add for only parsing
//			this.model.destroy();
//    		this.destroyView();	
		//}
	return true;

    },
    //destroy the model and all it's children 
    removePlace:function(event){
//    		this.model.get("section").trigger("removeAsideLeftContainer");
//    		//view listens for this event and destroys itself
//        	this.model.get("placeholder").destroy();
    },
	template : _.template('\
		<div style = " background-color:<%=color%>;" class ="contentTag">\
			<div class ="contentHTML" style = "\
			<%if(!inHTML){%>\
				display:none;\
			<%}%>\
			background-color:<%=color%>;">\
			</div>\
			<div class ="content" style = "\
			<%if(inHTML){%>\
				display:none;\
			<%}%>\
	    		">\
				<div class = "innerTags"></div>\
			</div>\
		</div>\
    '),
});
var AsideRightView = ContentTagView.extend({
	initialize: function(options){
    	//super constructor first
    	this.constructor.__super__.initialize.apply(this, [options]);
    	this.model.bind("destroy",this.removePlace,this);
    	this.$el.addClass("asideRight");
    	this.model.set("className","asideRight");

    },
    forceHTML:function(){
    	this.constructor.__super__.forceHTML.apply(this,[]);
    	this.$el.css("float","right");
    	this.$el.switchClass("","asideRightRendered",600,"swing",null);
    	_.each(this.$el.siblings(":not(.asideLeftRendered,.asideRightRendered)"),function(tag){
    		var $children = $(tag).children()
    		var width = $children.eq(0).css("width");
    		if(!_.every($children,function(headerOrBody){
    			return width == $(headerOrBody).css("width");
    		})){
    		//if the width of a header is not the same as its body
    			$(tag).css("clear","both");
    		}
    		
    	},this);
    	
    },
    forceEdit:function(){
    	this.constructor.__super__.forceEdit.apply(this, []);
    	this.$el.css("float","none");
    	this.$el.switchClass("asideRightRendered", "",600,"swing",null);
    	_.each(this.$el.siblings(":not(.asideLeftRendered,.asideRightRendered)"),function(tag){
    		$(tag).css("clear","none")
    	});
    },
    getHTML:function(childHTML){
    	if(childHTML == null || childHTML == ""){
    		childHTML = ""
    		this.model.get("innerTags").each(function(model){
    			 childHTML += model.trigger("getHTML",null,model).get("contentText");
    		})
    	}
    	var html = "<div class = 'articleInline runaroundRight'>"+ childHTML + "</div>"
		this.model.set("contentText",html);
    	return html;
    },
	htmlView:function(childHTML){
		//if(childHTML !== ""){
			
	    	$(this.$el.find(".content")[0]).hide();
	    	$(this.$el.find(".contentHTML")[0]).show().html(this.getHTML(childHTML));
		//}else{
			//TODO add for only parsing
//			this.model.destroy();
//    		this.destroyView();
		//}
    	return true;

    },
    //destroy the model and all it's children 
    removePlace:function(event){
//    		this.model.get("section").trigger("removeAsideRightContainer");
//    		this.model.get("placeholder").destroy();
    },
	template : _.template('\
		<div style = " background-color:<%=color%>;" class ="contentTag">\
			<div class ="contentHTML" style = "\
			<%if(!inHTML){%>\
				display:none;\
			<%}%>\
			background-color:<%=color%>;">\
			</div>\
			<div class ="content" style = "\
			<%if(inHTML){%>\
				display:none;\
			<%}%>\
	    		">\
				<div class = "innerTags"></div>\
			</div>\
		</div>\
    '),
});
var SectionView = ContentTagView.extend({
	asideLeft:0,
	asideRight:0,
	style:0,
	initialize:function(options){
		//call the superclass constructor first
		this.constructor.__super__.initialize.apply(this, [options]);
		this.model.bind("change:heading",this.updateHeading,this);
		this.model.bind("addAsideLeft",this.addAsideLeft,this);
	    this.model.bind("addAsideRight",this.addAsideRight,this);
	    this.model.bind("addStyle",this.addStyle,this);
	    this.model.bind("removeAsideLeftContainer",this.removeAsideLeftContainer,this);
	    this.model.bind("removeAsideRightContainer",this.removeAsideRightContainer,this);
//	    if(this.model.get("className").indexOf("subsection") == -1){
//    		this.model.asideLeftTags = new ContentTagCollection();
//    		this.model.asideRightTags = new ContentTagCollection();
//    		this.asideLeftTagsView = new AsideTagCollectionView({position:"left",collection:this.model.asideLeftTags});
//    		this.asideRightTagsView = new AsideTagCollectionView({position:"right",collection:this.model.asideRightTags});
//
//    		//what to use if we only want one aside
//    		//this.addAside();
//    	}
	},
	events:function(){
		return _.extend({},ContentTagView.prototype.events,{
			 "click .secHead": "editHeading",
		     "focusout .headingEdit": "headingSave",
		     "keypress .headingEdit": "headingSave",
		});
	},
	toggleHTML:function(event){
		//call the superclass constructor first
		this.constructor.__super__.toggleHTML.apply(this, [event]);
		this.headingSave(event);
		return false;
	},
	headingSave:function(event){
		//accept on a enter key press
		
		if(event != null && (event.keyCode == null || event.keyCode === 13)){
			if(event)event.preventDefault();
			var editText = this.$el.find(".headingEdit").eq(0).hide().val();

			if(editText == ""){
				editText = "(NONE)";
			}
			//only set to dirty if we changed the heading
			if(this.model.get("heading") != editText){
				CRImport.events.trigger("markupDirty",true);
				this.model.set("heading",editText);
			}
		}else{
			return true;
		}
		//otherwise continue as normal
		this.$el.find(".secHead").eq(0).text(editText).css('display', 'inline');
		return false
	},
	editHeading:function(event){
		if(event){
			if(event.attributes == null){
				event.preventDefault();
				if(event.target != this.$el.find(".secHead")[0]){
					return false;
				}
			}
		}
		var head = this.model.get("heading");
		this.$el.find(".secHead").eq(0).text(head).hide();
		this.$el.find(".headingEdit").eq(0).val(head).css('display', 'inline').focus();
		return false;
	},
	removeAsideLeftContainer:function(){
		//the destroy has not completed yet so we need to check if the length is == 1 instead of 0
		if(this.model.asideLeftTags.length == 1){
			this.$el.find(".asideLeft").hide();
			if(this.$el.find(".mainContainer").hasClass("span9")){
	    		this.$el.find(".mainContainer").removeClass("span9").addClass("span12");
	    	}else if(this.$el.find(".mainContainer").hasClass("span6")){
	    		this.$el.find(".mainContainer").removeClass("span6").addClass("span9").css("margin-left","0px");
	    	}
		}
	},
	removeAsideRightContainer:function(){
		//the destroy has not completed yet so we need to check if the length is == 1 instead of 0
		if(this.model.asideRightTags.length == 1){
			this.$el.find(".asideRight").hide();
			if(this.$el.find(".mainContainer").hasClass("span9")){
	    		this.$el.find(".mainContainer").removeClass("span9").addClass("span12");
	    	}else if(this.$el.find(".mainContainer").hasClass("span6")){
	    		this.$el.find(".mainContainer").removeClass("span6").addClass("span9");
	    	}
		}
	},
	addAsideLeft:function(callback,index,collection){
		if(this.$el.hasClass("subsection")){
			var parent = this.model.get("parentModel")
			if(parent == null)this.model.get("parent");
			parent.trigger("addAsideLeft",[callback,index,collection]);
			return;
		}

		var asideLeftTag = new ContentTagModel({
			section:this.model,
			color:"lightgreen",
			name:"Aside Left",
			offset:this.model.get("innerTags").length,
		});
		if(collection == null || index == null){
			index = this.model.get("innerTags").length;
			collection = this.model.get("innerTags");
		}
		asideLeftTag.swapIndex(index,collection);
		asideLeftTag.set("number",this.asideLeft++);

		
		this.model.get("innerTags").add(asideLeftTag);
		if(callback != null){
			//send the tag back in the callback if this is invoked by a listener
			try{
				callback(asideLeftTag);
			}catch(e){
				
			}
		}
		return asideLeftTag;
    },
    addAsideRight:function(callback,index,collection){
    	if(this.$el.hasClass("subsection")){
			var parent = this.model.get("parentModel")
			if(parent == null)this.model.get("parent");
			parent.trigger("addAsideRight",[callback,index,collection]);
			return;
		}

		var asideRightTag = new ContentTagModel({
			section:this.model,
			color:"olivedrab",
			name:"Aside Right",
			offset:this.model.get("innerTags").length,
		});


		if(collection == null || index == null){
			index = this.model.get("innerTags").length;
			collection = this.model.get("innerTags");
		}
		asideRightTag.swapIndex(index,collection);
		asideRightTag.set("number",this.asideRight++);
		
		this.model.get("innerTags").add(asideRightTag);
		if(callback != null){
			//send the tag back in the callback if this is invoked by a listener
			try{
				callback(asideRightTag);
			}catch(e){
				
			}
		}
		return asideRightTag;
    },
    addStyle:function(callback,style){
    	var styleTag = new ContentTagModel({
			inHTML : true,
			name:"Style",
			color:"lightyellow",
			className:"style",
			style: style,					
		})

    	styleTag.set("number",this.style++);
		
		this.model.get("innerTags").add(styleTag);
		
		if(callback != null){
			//send the tag back in the callback if this is invoked by a listener
			callback(styleTag);
		}
		return styleTag;
    },
    getHTML:function(childHTML,model){
    	if(childHTML == null || childHTML == ""){
    		childHTML = ""
    		this.model.get("innerTags").each(function(model){
    			 childHTML += model.trigger("getHTML",null,model).get("contentText");
    		})
    	}
    	var html = _.escape(this.$el.find(".secHead").eq(0).text());
    	if (html == "") html = "(None)";
		this.model.set("heading",html);
		html = "<section class = '"+ this.model.get("className")+"'data-number='" +this.model.get("number")+"' data-name='" +html+"' >";
		//get all the children's html
		var content =  html + '<h1 class ="sectionHeading">'+this.model.get('heading') +'</h1>' +childHTML + '</section>';
		this.model.set("contentText",content);
		return html+childHTML + "</section>";
    },
	htmlView:function(childHTML){	
    	$(this.$el.find(".content")[0]).hide();
    	$(this.$el.find(".contentHTML")[0]).show().html(this.getHTML(childHTML));
    	return true;
    },
    render:function(){
    	this.constructor.__super__.render.apply(this, []);
    	this.$el.find('.secHead').eq(0).tooltip({title:"Click to Edit"});
    	
    	return this;
    },
    header : _.template('\
        	<div style = "background-color:<%=color%>" class = "tagName">\
    		<%if(heading !== ""){%>\
    			<span class = "tagHeadingContainer">\
    				<span>Section :</span>\
    				<span class ="secHead"><%=heading%></span>\
    				<input style = "display:none;" type="text" class="input-small headingEdit sectionHeading" placeholder="Section Heading" value ="<%=heading%>">\
    			</span>\
			<%}else{%>\
				<div class ="tagHeading secHead" style = "display:none;"><%=heading%></div>\
				<input  type="text" class="input-small headingEdit sectionHeading" placeholder="Section Heading" value ="<%=heading%>">\
			<%}%>\
        		<i class="trash right icon-border icon-trash"></i>\
        		<i class="toggle right icon-border icon-chevron-up"></i>\
        		<i class="toggleHTML right icon-border icon-code"></i>\
    		</div>\
    	'),
	template : _.template('\
		<div style = " background-color:<%=color%>;" class ="contentTag">\
			<div class ="contentHTML" style = "\
			<%if(!inHTML){%>\
				display:none;\
			<%}%>\
			background-color:<%=color%>;">\
			</div>\
			<div class ="content" style = "\
			<%if(inHTML){%>\
				display:none;\
			<%}%>\
	    		"><div class="container-fluid">\
					  <div class="row-fluid">\
					    <div style = "display:none;" class="asideLeft asideArea span3">\
							<div class = "asideLeftContainer"></div>\
					    </div>\
					    <div style = "margin-left: 0;" class="mainContainer span12">\
		    				<div class = "innerTags"></div>\
					      <!--Body content-->\
					    </div>\
			 			<div style = "display:none;" class="asideRight asideArea span3">\
							<div class = "asideRightContainer"></div>\
						</div>\
					  </div>\
					</div>\
				</div>\
			</div>\
		</div>\
    '),
});
var StyleView = ContentTagView.extend({
	initialize:function(options){
    	this.constructor.__super__.initialize.apply(this, [options]);
    	this.$el.addClass("style");
    	this.model.set("className","style");
	},
	events:function(){
		return _.extend({},ContentTagView.prototype.events,{
		     "keyup .backgroundColor,.styleEditRight": "styleSet",
		     "change .styleCenter": "styleSet",
		});
	},
	styleSet:function(event){
		if (event.target.checked){
			this.center = true;
		}else{
			this.center = false;
		}
		this.background = this.$el.find(".backgroundColor").eq(0).val();
		this.textColor = this.$el.find(".textColor").eq(0).val();
		
		this.model.set("style"," background-color:"+this.background +"; color:"+this.textColor+";" + ((this.center) ? "text-align:center;":""));
		if(this.model.get("inHTML"))this.htmlView();
	},
    getHTML:function(childHTML,model){
    	if(childHTML == null || childHTML == ""){
    		childHTML = ""
    		this.model.get("innerTags").each(function(model){
    			 childHTML += model.trigger("getHTML",null,model).get("contentText");
    		});
    	}
    	
		var html = "<div class =  'style' style='"+this.model.get("style")+"' data-style='" +this.model.get("style")+"' >"+ 
		childHTML +
		"</div>";
		var $html = $(html);
		$html.find("*").css("background",this.background).css("color",this.textColor);
		html = $html[0].outerHTML;
		this.model.set("contentText",html);
		return html;
    },
	htmlView:function(childHTML){	
    	$(this.$el.find(".content")[0]).hide();
    	$(this.$el.find(".contentHTML")[0]).show().html(this.getHTML(childHTML));
    	this.model.set("inHTML",true)
    	return true;
    },
    styleInit:function(style){
    	//background color
    	var backgroundIndex = style.indexOf("background-color:");
    	var background = style.slice(backgroundIndex,style.indexOf(";",backgroundIndex));
    	background = background.replace("background-color:","").replace(";","");
    	this.$el.find(".backgroundColor").eq(0).val(background);
    	
    	//font color
    	var fontIndex = style.indexOf("color:");
    	var font = style.slice(fontIndex,style.indexOf(";",fontIndex));
    	font = font.replace("color:","").replace(";","")
    	this.$el.find(".textColor").eq(0).val(background);
    	
    	//center text
    	if(style.indexOf("text-align:center") != -1){
    		this.$el.find(".styleCenter").attr("checked","checked")
    	}
    },
    render:function(){
    	this.constructor.__super__.render.apply(this, []);
    	var style = this.model.get("style");
    	if(style != null){
    		this.styleInit(style);
    	}
		return this;
	},
    header : _.template('\
    	<div style = "background-color:<%=color%>" class = "tagName">\
    		<span class ="tagHeading styleHead"><%=name%></span>\
    		<i class="trash right icon-border icon-trash"></i>\
    		<i class="toggle right icon-border icon-chevron-up"></i>\
    		<i class="toggleHTML right icon-border icon-code"></i>\
    		<span class ="styleEditLeft">\
				Background Color: \
				<input class = "backgroundColor" style = "width:125px; min-width:50px; margin-bottom:0px;" type = "text" placeholder= "Background Color" />\
    			Center Text: \
    			<input class = "styleCenter" style = "margin:0px;" type = "checkbox"/>\
    		</span>\
    		<span class = "styleEditRight">\
    			Font Color:\
				<input class = "textColor" style = "width:80px; min-width:50px; margin-bottom:0px;" type = "text" placeholder= "Text Color" />\
    		</span>\
		</div>\
	'),
	template : _.template('\
		<div style = " background-color:<%=color%>;" class ="contentTag">\
			<div class ="contentHTML" style = "\
			<%if(!inHTML){%>\
				display:none;\
			<%}%>\
			background-color:<%=color%>;">\
			</div>\
			<div class ="content" style = "\
			<%if(inHTML){%>\
				display:none;\
			<%}%>\
	    		"><div class="container-fluid">\
					  <div class="row-fluid">\
					    <div class="mainContainer">\
		    				<div class = "innerTags"></div>\
					      <!--Body content-->\
					    </div>\
					  </div>\
					</div>\
				</div>\
			</div>\
		</div>\
    '),
});
var AuthorView = ContentTagView.extend({
	getHTML:function(){
		var html = _.escape(this.$el.find("#author").val());
		html = "<h6 class='byline'>By "+ html+"</h6>";
		this.model.set("contentText",html);
		return html;
	},
	htmlView:function(){
		
    	$(this.$el.find(".content")[0]).hide();
    	$(this.$el.find(".contentHTML")[0]).show().html(this.getHTML());
    	return true;
    },
	template : _.template('\
		<div style = " background-color:<%=color%>;" class ="contentTag">\
			<div class ="contentHTML" style = "\
			<%if(!inHTML){%>\
				display:none;\
			<%}%>\
			background-color:<%=color%>;">\
			</div>\
			<div class ="content" style = "\
			<%if(inHTML){%>\
				display:none;\
			<%}%>\
			">	<form class="form-horizontal">\
				  <div class="control-group">\
				    <label class="control-label" for="author">By</label>\
				    <div class="controls">\
				      <input type="text" id="author" placeholder="Author Name" value ="<%=author%>">\
				    </div>\
				  </div>\
				</form>\
			</div>\
		</div>\
    '),
});
var DateView = ContentTagView.extend({
    getHTML:function(){
    	var html = _.escape(this.$el.find("#date").val());
		html = "<h6 class='dateline'>"+ html+"</h6>";
		this.model.set("contentText",html);
		return html;
    },
	htmlView:function(){
		
    	$(this.$el.find(".content")[0]).hide();
    	$(this.$el.find(".contentHTML")[0]).show().html(this.getHTML());
    	return true;
    },
	template : _.template('\
		<div style = " background-color:<%=color%>;" class ="contentTag">\
			<div class ="contentHTML" style = "\
			<%if(!inHTML){%>\
				display:none;\
			<%}%>\
			background-color:<%=color%>;">\
			</div>\
			<div class ="content" style = "\
			<%if(inHTML){%>\
				display:none;\
			<%}%>\
			">	<form class="form-horizontal">\
				  <div class="control-group">\
				    <label class="control-label" for="date">On</label>\
				    <div class="controls">\
				      <input type="text" id="date" placeholder="Date" value ="<%=date%>">\
				    </div>\
				  </div>\
				</form>\
			</div>\
		</div>\
    '),
});
var ImageView = ContentTagView.extend({
	imageTried:false,

	initialize:function(options){
    	ContentTagView.prototype.initialize.apply(this, [options]);
		if(this.model.get("orgURL") == ""){
			this.model.set("orgURL",this.model.get("source"))
		}
    	this.render();
		this.getHTML();
		this.$el.addClass("image");
		this.model.set("className","image");

	},
	events:function(){
		return _.extend({},ContentTagView.prototype.events,{
			'removeImage' : 'removeImage',
		    "change #imageFile" :"imageUpload",
		});
	},

	imageUpload:function(event){
		event.stopPropagation()
		var that = this;
        var files = event.target.files; // FileList object
        var file = files[0];
        if(file.name.match(/\.(gif|jpg|jpeg|tiff|png)$/i) || file.type.match(/image/)) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
				var xhr = new XMLHttpRequest();
				xhr.open('POST', "/importImage", true);
				
				xhr.onload = function(e){
					var data = JSON.parse(this.response);
					console.log(data)
					if(data.id != null){
						imageSrc ="/getImage/" +data.id
						that.model.set("source",imageSrc);
						that.$el.find("#imageSrc").eq(0).val(imageSrc);
					}else{
						bootbox.alert("failed to upload");
					}
				}
				
			    xhr.setRequestHeader("Content-Type", "multipart/form-data");
			    xhr.sendAsBinary(this.result);
			}
			reader.readAsBinaryString(file);	
		}else{
			bootbox.alert("Not a Valid Image")
		}
        return false;
	},
	removeImage:function(event,image){
    	event.preventDefault();
		this.model.set("orgURL",$(image).prop("src"));
		this.model.set("source","imageNotFound.png");
    	this.invalid = true;
    	var html = this.outputTemplate(this.model.toJSON())
    	$(this.$el.find(".contentHTML")[0]).show().html(html);
		//replace the src in the form with the correct value
		this.$el.find("#imageSrc").val(this.model.get("orgURL"));
		this.model.set("contentText",html);    	
    	return false;
    },
    getHTML:function(callback){
    	var imageSrc = this.$el.find("#imageSrc").eq(0).val();
		var imageId = _.escape(this.$el.find("#imageId").eq(0).val());
		var imageCaption = _.escape(this.$el.find("#imageCaption").eq(0).val());
		var videoSite = _.escape(this.$el.find("#videoSite").eq(0).val());
		var that = this;
		var complete = function(src){
			var html = "";
			var orgURL = "";
			//see if we have a invalid image that we want to show the "real" url of
			if(that.model.get("orgURL") != ""){
				orgURL = 'data-orgURL = "'+that.model.get("orgURL")+'"'
			}
			that.model.set({source:src,caption:imageCaption,credit:imageId,url:videoSite})

			if(that.model.get("pureImage")){
				if(imageSrc.indexOf("imageNotFound.png") != -1){
					html = "<div class ='imageCont'><img  width ='"+that.model.get("width")+"' src = '"+src+"' "+orgURL+" alt = 'Image Not Found' onerror='$(this).trigger(\"removeImage\",this);'><span class = 'imageHead'>"+that.model.get("orgURL")+"</span></div>"
				}else{
					html = "<div class ='imageCont'><img  width ='"+that.model.get("width")+"'  src = '"+src+"' "+orgURL+" alt = 'Image Not Found' onerror='$(this).trigger(\"removeImage\",this);'></div>"
				}
			}else{
				if(imageSrc.indexOf("imageNotFound.png") != -1){
					that.invalid = true;
				}else{
					that.invalid = false;
				}
				html = that.outputTemplate(that.model.toJSON());
			}
			
			//replace the src in the form with the correct value
			that.$el.find("#imageSrc").val(that.model.get("orgURL"));
			that.model.set("contentText",html);
			if(callback)callback(html);
			return html;
		}
		
		//make sure the the url isn't empty 
		if(imageSrc != null && imageSrc != ""){
			//if this is the same original image we uplaoded already, then dont reupload
			if(imageSrc == that.model.set("source")){
				complete(imageSrc);
			//make sure the image url is not from this host and that it wasn't already imported
			}else if(imageSrc.indexOf("/getImage") == -1  && imageSrc.indexOf(window.location.hostname) == -1 && imageSrc.indexOf("imageNotFound.png") == -1){
				$.ajax({
					type: "POST",
					url: "/importImage",
					data: {src:imageSrc,credit:imageId,caption:imageCaption},
					success: function(data){
						that.model.set("orgURL",imageSrc)
						imageSrc ="/getImage/"+ data.id;
						complete(imageSrc);
					  },
					error:function(data){
						that.model.set("orgURL",imageSrc);
						imageSrc = "imageNotFound.png";
						complete(imageSrc);
					},
				});
			}else{
				that.model.set("orgURL",imageSrc);
				complete(imageSrc);
			}
		}else{
			that.model.set("orgURL","");
			complete("imageNotFound.png");
		}
    },
	htmlView:function(){
    	$(this.$el.find(".content")[0]).hide();
    	var that = this;
    	this.getHTML(function(html){
    		$(that.$el.find(".contentHTML")[0]).show().html(html);
    	});
    	return true;
    },
    outputTemplate:_.template("\
		<figure>\
			<%if(!this.invalid){%>\
				<div class ='imageCont'>\
					<img width ='<%=width%>' src = '<%=source%>' data-orgURL = '<%=orgURL%>' alt = 'Image Not Found' onerror='$(this).trigger(\"removeImage\",this);' >\
					<span class = 'imageHead'><%=orgURL%></span>\
				</div>\
			<%}else{%>\
				<img src = '<%=source%>' data-orgURL = '<%=orgURL%>' alt = 'Image Not Found' onerror='$(this).trigger(\"removeImage\",this);' >\
			<%}%>\
			</img>\
			<figcaption>\
				<span class='figureId'><%=credit%></span>\
				<p class='caption'><%=caption%></p>\
			</figcaption>\
		</figure>\
    "),
	template : _.template('\
		<div style =" padding-top:10px; background-color:<%=color%>" class ="contentTag">\
			<div class ="contentHTML" style = "\
			<%if(!inHTML){%>\
				display:none;\
			<%}%>\
			background-color:<%=color%>;">\
			</div>\
			<div class ="row-fluid content" style = "\
				<%if(inHTML){%>\
					display:none;\
				<%}%>\
	    	">\
				<form class="form-horizontal">\
					<fieldset>\
					  <div class="control-group">\
					    <label class="control-label" for="imageCaption">Image Label</label>\
					    <div class="controls">\
							<input class = "input-xlarge" type="text" id="imageCaption" placeholder="Image Label"  value = "<%=label%>">\
					    </div>\
					  </div>\
					  <div class="control-group">\
					    <label class="control-label" for="imageId">Image Credit</label>\
					    <div class="controls">\
					      <input type="text" id="imageId" placeholder="Image Credit" value = "<%=credit%>">\
					    </div>\
					  </div>\
					  <div class="control-group">\
					    <label class="control-label" for="imageSrc">Image URL</label>\
					    <div class="controls">\
					      <input type="text" id="imageSrc" placeholder="Image Source" value = "<%=orgURL%>"> \
					    </div>\
					  </div>\
					  <div class="control-group">\
					    <label class="control-label" for="imageFile">Upload Image</label>\
					    <div class="controls">\
					      <input type="file" id="imageFile">\
					    </div>\
					  </div>\
					</fieldset>\
				</form>\
			</div>\
		</div>\
	'),
});
var VideoView = ImageView.extend({
    outputTemplate:_.template("\
		<figure class = 'videoView'>\
			<img  width ='<%=width%>' data-url = '<%=url%>' src = '<%=source%>' alt = 'Image Not Found' onerror='$(this).trigger(\"removeImage\",this);'></img>\
			<span class='pointer playOverlay' data-url='<%=url%>'></span>\
			<figcaption>\
				<p class='caption'><%=caption%></p>\
			</figcaption>\
		</figure>\
    "),
	template : _.template('\
		<div style =" padding-top:10px; background-color:<%=color%>" class ="contentTag">\
			<div class ="contentHTML" style = "\
			<%if(!inHTML){%>\
				display:none;\
			<%}%>\
			background-color:<%=color%>;">\
			</div>\
			<div class ="row-fluid content" style = "\
				<%if(inHTML){%>\
					display:none;\
				<%}%>\
	    	">\
				<form class="form-horizontal">\
					<fieldset>\
					  <div class="control-group">\
					    <label class="control-label" for="imageCaption">Video Label</label>\
					    <div class="controls">\
							<input class = "input-xlarge" type="text" id="imageCaption" placeholder="Video Label"  value = "<%=label%>">\
					    </div>\
					  </div>\
					  <div class="control-group">\
					    <label class="control-label" for="imageSrc">Video Image</label>\
					    <div class="controls">\
					      <input type="text" id="imageSrc" placeholder="Video Source" value = "<%=source%>"> \
					    </div>\
					  </div>\
					  <div class="control-group">\
					    <label class="control-label" for="videoSite">Video URL</label>\
					    <div class="controls">\
					      <input type="text" id="videoSite" placeholder="Video Site" value = "<%=url%>"> \
					    </div>\
					  </div>\
					</fieldset>\
				</form>\
			</div>\
		</div>\
	'),
});
var ImageLinkView = ImageView.extend({
    outputTemplate:_.template("\
		<a class = 'imageLink' href ='<%=this.model.get('href')%>' target = '_blank'>\
			<img width ='<%=width%>' src = '<%=source%>' alt = 'Image Not Found' onerror='$(this).trigger(\"removeImage\",this);'></img>\
			<span class='mediaOverlay interactive'>Interactive Feature</span>\
		</a>\
    	<h6><%=caption%></h6>\
    "),
	template : _.template('\
		<div style =" padding-top:10px; background-color:<%=color%>" class ="contentTag">\
			<div class ="contentHTML" style = "\
			<%if(!inHTML){%>\
				display:none;\
			<%}%>\
			background-color:<%=color%>;">\
			</div>\
			<div class ="row-fluid content" style = "\
				<%if(inHTML){%>\
					display:none;\
				<%}%>\
	    	">\
				<form class="form-horizontal">\
					<fieldset>\
					  <div class="control-group">\
					    <label class="control-label" for="imageCaption">Image Label</label>\
					    <div class="controls">\
							<input class = "input-xlarge" type="text" id="imageCaption" placeholder="Image Label"  value = "<%=label%>">\
					    </div>\
					  </div>\
					  <div class="control-group">\
					    <label class="control-label" for="imageSrc">Image URL</label>\
					    <div class="controls">\
					      <input type="text" id="imageSrc" placeholder="Image Source" value = "<%=source%>"> \
					    </div>\
					  </div>\
					</fieldset>\
				</form>\
			</div>\
		</div>\
	'),
});
var TextView = ContentTagView.extend({
	events:function(){
		return _.extend({},ContentTagView.prototype.events,{
			"editorSave":"editorSave",
		    "editorReset":"editorReset",
		    "forceHTML" :"forceHTML",
		});
	},
	initialize:function(options){
    	this.constructor.__super__.initialize.apply(this, [options]);
    	//default to paragraph
    	this.model.set("tagName","span");
    	this.editorHTML = null;
    	this.$el.addClass("text");
    	this.model.set("className","text");
	},
	forceEdit:function(event){
    	$(".contentTagContainer").trigger("forceHTML",this);
    	this.constructor.__super__.forceEdit.apply(this, [event]);
    	if(this.editor != null){
			this.editor.setHTML(this.editorHTML);
		}else{
			this.setUpEditor();
		}
		$(this.$el.find(".contentTag")[0]).animate({"height":"100%"},"fast");
		this.$el.find(".toggle").eq(0).addClass("icon-chevron-up").removeClass("icon-chevron-down");
		this.open = true;
	},
	//for paragraphs only hide part of the content and disable editting
	toggle:function(event){
    	event.preventDefault();
    	var $target = $(event.target);
    	var $content = $(this.$el.find(".contentTag")[0]);
    	//closing
    	if(this.open){
    		var finish = function(){
    			//fixes empty p tags to be spans instead of p
    			_.each(this.$el.find("p"),function(p){
        			if($(p).text() == ""){
        				$(p).replaceWith($('<span>' + p.innerHTML + '</span>'));
        			}
        		});
        		
        		this.$el.find("p:first-child").css("overflow","hidden").css("white-space","nowrap").css("text-overflow", "ellipsis");
        		
        		if(CRImport.textParagraphs == true){
        			this.$el.find(".editorContent").find("*").hide().filter("p").eq(0).show();
        		}else{
        			//if we use brs instead of paragraphs in text editor
    	    		this.$el.find("br").hide();	
        		}
    		}
    		
    		if(this.edit){
	    		this.htmlView(finish);
    		}else{
    			finish.call(this,[]);
    		}
    		
    		//needs to be done as we force the view into html
    		$(this.$el.find(".toggleHTML")[0]).addClass("icon-edit").removeClass("icon-code");
        	this.model.set("inHTML",true);
    		this.edit = false;
    		this.open = false;

			$target.addClass("icon-chevron-down").removeClass("icon-chevron-up");
    	//opening
    	}else{
    		this.$el.find("p:first-child").css("white-space","normal")

    		if(CRImport.textParagraphs == true){
    			this.$el.find(".editorContent").find("*").show();
    		}else{
    			//if we use brs instead of paragraphs in text editor
	    		this.$el.find("br").show();	
    		}
    		this.open = true;
    		$target.addClass("icon-chevron-up").removeClass("icon-chevron-down");
    		
    		$content.animate({"height":"100%"},"fast");
    	}
    	return false;
    },
    editorSave:function(){
    	if(this.editor != null){
    		this.model.set("contentText",this.editor.getHTML(null,this.model));
    	}
    },
    editorReset:function(){
    	if(this.editor != null){
    		this.setUpEditor();
			if(this.model.get("inHTML") === true){
				this.$el.find(".contentEditor").hide();
			}
    	}
    },
    setUpEditor:function(){
    	this.editor = new EditorView();
		this.$el.find(".contentEditor").show().html(this.editor.render().el);
		if(this.model.get("contentText") != null){
			this.editor.initEditor(this.model.get("contentText"));
		}else{
			this.editor.initEditor();
		}
    },
    getHTML:function(callback,model){
    	var that = this;
		var html = (this.editor) ?  this.editor.getHTML() : parse();
		
		//parse the html
		var that = this;
		function parse(){
			if(that.model.get("contentText") != null){
				var $el = $.parseHTML("<p>"+that.model.get("contentText")+"</p>");
				var text = ""
				_.each($el,function(el){
					if(el.nodeType == 3){
						if(el.nodeValue == ""){
							$(el).remove()
						}else{
							text += el.nodeValue;
						}
						
					}else{
						if($(el).text() == ""){
							$(el).remove();
						}else{
							text += el.outerHTML;
						}
					}
				})
				return text;
			}else{
				return "";
			}
		}
		//if(this.editor)this.editor.disable();
		var classDef = (this.model.get("className") !== "") ? (" class = \"  articleBody "+this.model.get("className")+" editorContent \""): "class = \"editorContent\"";  
		html = "<span "+classDef+" data-editor='span'>"+
			html +
		"</span>";
		var $html = $(html);
		//if we have children make sure they don't contain any text
		if(_.filter($html.children("*"),function(child){return $(child).text() != ""}).length == 0){
			$html.replaceWith("<p>"+html.innerHTML+"</p>")
		}
		//make links show up in new tab/window
		$html.find("a").attr("target","_blank");
		var $imgs = $html.find("img");
		var length = $imgs.length; 
		if(length != 0){
			//loop through all of the images found in the editor html and save them
			_.each($imgs,function(img,i){
				var $img = $(img);
				var imageSrc = $img.prop("src");
				var that = this;
				if(imageSrc != null && imageSrc != ""){
					//make sure the image url is not from this host and that it wasn't already imported
					if(imageSrc.indexOf("getImage/") == -1  && imageSrc.indexOf(window.location.hostname) == -1){
						$.ajax({
						  type: "POST",
						  url: "/importImage",
						  data: {src:imageSrc,credit:"",caption:""},
						  success: function(data){
						    imageSrc ="/getImage/"+ data.id;
						    $img.prop("src",imageSrc);
						    length--;
							console.log(length);
						    if(length == 0){
						    	model.set("contentText",html);
								if(callback)callback($html[0].outerHTML);
						    }
						  },
						  error:function(data){
							  console.log("image from text chunk failed to save: " + imageSrc)
							  //for now do nothing
							  length--;
							  if(length == 0){
								model.set("contentText",html);
								if(callback)callback($html[0].outerHTML);
							  }
						  },
						});
					}else{
						  length--;
					}
				}else{
					  length--;
				}
				if(length == 0){
					that.model.set("contentText",html);
					if(callback)callback($html[0].outerHTML);
				}
			});
		}else{
			//force links to new tab if there are any		
			this.model.set("contentText",html);
			if(callback)callback($html.html());
		}

		this.model.set("contentText",html);

		return $html[0].outerHTML;
    },
	htmlView:function(call){
		var that = this;
		var complete = false;
		var html = this.getHTML(function(html){
			that.$el.find(".contentEditor").hide().html("");
			that.$el.find(".contentHTML").show().html(html);
			try{
				that.editor.setHTML(html);
			}catch(e){
				
			}
	        CRImport.events.trigger("markupDirty",true);
			//this will be set when the editor is added back to the html
			that.editorHTML = html;
			complete = true;
			if(call)call.call(that,[]);
			return true;
		},that.model);
    }, 
    
    //overwrites the header template defined in the extended class
	template : _.template('\
		<div style = "background-color:<%=color%>" class ="contentTag">\
    		<div class ="contentEditor content" style = "\
				<%if(inHTML){%>\
					display:none;\
				<%}%>\
	    	"></div>\
	    	<div class ="contentHTML" style = "\
			<%if(!inHTML){%>\
				display:none;\
			<%}%>\
			"><%=contentText%>\
			</div>\
		</div>\
    '),
});