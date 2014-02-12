var Parser = Backbone.View.extend({
	
	initialize: function(){
		this.type = this.options.type;
		this.contentView = this.options.content;
		this.$el.html(this.options.html);
		this.page = 0;
		this.title = ""
		this.serverName = this.options.url.replace(/http(s)*:\/\//,"").split("/")[0]
		ParserStates.serverName = this.serverName;
		this.hostName = window.location.host;
		ParserStates.hostName = this.hostName;
		this.absoluteServerName = this.options.url.replace(/http(s)*:\/\//,"")
		this.absoluteServerName =  this.absoluteServerName.substring(0,this.absoluteServerName.lastIndexOf("/"));
		
		ParserStates.absoluteServerName = this.absoluteServerName;
	},
	//public function to set the first section and start parsing
	parseContent:function(){

		this.title = this.$el.find('title').text();
		//removes the css
		this.$el.find('link').remove();
		var section = null;
		if(this.type === 'nyt'){
			//css steal from the original site
			var head = this.$el.find("header");
			
			$("header").append(head.html());
			
			section = this.$el.find('#article .columnGroup.first');
			if(this.title == "")this.title = $(section.find("h2")[0]).text() +" "+ $(section.find("h1")[0]).text();
		//default starting element is the entire document
		}else if(this.type === 'default'){
			this.$el.find("script").remove();
			
			/**HAX FOR PARSING CR CONTENT FROM FILESYSTEM (until we add a selector to the file import page, for type)**/
			if(this.$el.find("section.section").length != 0){
				this.type = 'cr'
			}
			section = this.el;
		//try nsf base article layout
		}else if(this.type === 'cr'){
			section = this.el;
			
		}else if(this.type === 'nsf'){
			
			this.$el.find("script").remove();
			
			section = this.$el.find("td.text")[0];
			if(section == null){
				section = this.$el.find("td")[0];
			}
			//there are two types of nsf articles and we decide which type it is by looking for a header.
			if( this.$el.find(".headmark").length !== 0){
				this.title = this.$el.find(".pageheadline").text();
			}else{
				this.title = this.$el.find("h1").eq(0).text();
			}
		}else if(this.type === 'nsfSN'){
			section = this.$el.find("#header")[0];
		}
		
		this.documentTags = this.contentView.model.get("innerTags");
		//set the parsing function once 
		this.parserFunc = ParserStates.getParseState(this.type);
		//done for all article types except cr where we know that we have proper sections
		if(this.type !== 'cr'){
			this.$el.find('title').remove();
			var heading = "Introduction"
			if(this.title != ""){
				heading = this.title;
			}
			var sectionModel = new ContentTagModel({
				inHTML : true,
				name:"Section", 
				heading:heading,
				elId:"article",
				className:"section",
				color:"lightblue",
				tagType:"h3",
				offset:this.documentTags.length,
			});
			this.documentTags.add(sectionModel);
			this.curSection = sectionModel;
			tag = section;
			CRImport.events.trigger("addSection");
			var that = this;
			//look at the children and add them to the editor as we see them
			_.each($(tag).children(':not(meta)'),function(curTag){
				that.parseState(curTag,sectionModel);
			});
		}else{
			this.parseState(section);
		}

		return this.title;

	},
	//helper function used in the recursion
	parse : function(tag, tagModel){
		var that = this;
		//look at the children and add them to the editor as we see them
		_.each($(tag).children(':not(meta)'),function(curTag){
			that.parseState(curTag,tagModel);
		});
	},
	//gets null if the parent is the top section
	parseState:function(curTag,parentModel){
		if(parentModel == null){
			parentModel = this.curSection;
		}

		var addTag = this.parserFunc.call(this,curTag,parentModel);
		
		//if there was a tag to add, add it
		if(addTag != null){
			if(addTag.get("name") == "Image" ||addTag.get("name") == "Content Unit" || addTag.get("name") == "Video" || addTag.get("name") == "Media" || addTag.get("name") == "Image Link" ){
				var index = parentModel.get("innerTags").length;
				addTag.set("offset",index);
				parentModel.get("innerTags").add(addTag,{at:index});
			}else{
				if(this.curSection != null){
					var index = this.curSection.get("innerTags").length
					addTag.set("offset",index);
					this.curSection.get("innerTags").add(addTag,{at:index});
				}else{
					this.documentTags.add(addTag);
					this.curSection = addTag;
					tag = section;
					CRImport.events.trigger("addSection");
				}
			}
		}
	},
	render:function(){
		
	}
});
