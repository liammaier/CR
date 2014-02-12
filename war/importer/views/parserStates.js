var ParserStates = {}


ParserStates.getParseState = function(type){

		if(type === 'nyt'){
			return ParserStates.nyt;
		}else if (type === 'default'){
			return ParserStates.defaultParser;

		}else if (type === 'nsfDoc' ||type === 'nsf' ){
			return ParserStates.nsf;

		}else if (type === 'nsfSN'){
			return ParserStates.nsfSN;

		}else if (type === 'pdf'){
			return ParserStates.pdf;

		}else if (type === 'cr'){
			return ParserStates.cr;

		}else{
			bootbox.alert("unknown type:" + type);

		}
}
ParserStates.replaceImageDomain = function(src){
	if(src != null && src.indexOf(this.serverName) === -1){
		src = src.replace(/(http(s)*:\/\/[^\/]*)?/,"http://"+this.absoluteServerName );
	}
	return src;
}
ParserStates.replaceRelativeImageDomain = function(src){
	console.log(this.serverName)
	if(src.indexOf(this.serverName) === -1){
		src = src.replace(/(http(s)*:\/\/[^\/]*)?\/importer/,"http://"+this.serverName );
	}
	return src;
}	
ParserStates.nyt = function(curTag,parentModel){
	var $curTag = $(curTag);
	var addTag = null;
	var $parentModel = $(parentModel);

	switch($curTag.prop("tagName")){
		case "IMG":
			var source = $curTag.prop("src");
			var credit = $curTag.siblings('.credit').text();
			var label = $curTag.siblings('.caption').text();
			//if there is a video
			if($curTag.siblings(".playOverlay").length != 0){
				addTag = new ContentTagModel({
					inHTML : true,
					label:label,
					source:source,
					url:this.options.url,
					name:"Video", 
					className:"playOverlay",
					color:"white",
				});
				
			//if there is a media link
			}else if($curTag.siblings(".mediaOverlay").length != 0){
				addTag = new ContentTagModel({
					inHTML : true,
					label:$curTag.parent().siblings().eq(0).html(),
					source:source,
					name:"Image Link",
					href: $($curTag.parent()).attr("href"),
					className:"mediaOverlay",
					color:"white",
				});
			}else if($curTag.parents(".inset, .insetRight").length != 0){
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:source,
					credit:credit,
					name:"Image", 
					className:"articleSpanImage inset insetRight",
					color:"white",
				});
			}else{
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:source,
					credit:credit,
					name:"Image", 
					className:"articleSpanImage",
					color:"white",
				});
				
			}
			addTag.set("original",curTag);
		
			break;
		case "NYT_BYLINE":
			var author = $curTag.text().replace(/by/i,"");
			
			addTag = new AuthorTagModel({
				inHTML : true,
				author:author,
				name:"Author", 
				className:"byline",
			});
			addTag.set("original",curTag);
			break;
		case "P":
			if(!$curTag.hasClass("caption")){

				//add a new section for nyt if we see a strong heading alone inside a paragraph
				if($curTag.children("strong").length != 0 && $curTag.children().length == 1 && $curTag.children().eq(0).text("") === $curTag.text()){
					console.log("adding new section")
					this.curSection = new ContentTagModel({
						inHTML : true,
						name:"Section", 
						heading:$curTag.children("strong").text(),
						elId:"article",
						className:"section",
						color:"lightblue",
	    				offset:this.documentTags.length,
					});
					this.documentTags.add(this.curSection);
				//otherwise it is just a paragraph as usual
				}else{
					var contents = $curTag.html();
					
					addTag = new ContentTagModel({
						inHTML : true,
						name:"Content Unit",
						contentText:contents, 
						color:"#dddddd",
						className:"articleBody",
						tagName:"p",
					});
				}
			}
			break;
		case "H3":
			if($curTag.hasClass("sectionHeader")){
				var heading = $curTag.text();

				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					heading:heading, 
					color:"#dddddd",
					className:"sectionHeader",
					tagName:"h3",
				});
			}
			break;
		case "H6":
			if($curTag.hasClass("sectionHeader")){
				var heading = $curTag.text();

				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					contentText:heading, 
					color:"#dddddd",
					className:"sectionHeader",
					tagName:"h3",
				});
			}else if($curTag.hasClass("dateline")){
				var date = $curTag.text();

				addTag = new ContentTagModel({
					inHTML : true,
					name:"Date Published",
					date:date, 
					color:"orange",
					className:"dateline",
					tagName:"h6",
				});
			}else if($curTag.attr("class") === ""){
				var heading = $curTag.text();
			
				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					contentText:heading, 
					color:"#dddddd",
					className:"",
					tagName:"h6",
				});
			}
			break;
//			case "A":
//				if($curTag.find("img").length != 0){
//					
//					
//					var contents = $curTag.html();
//					
//					addTag = new ContentTagModel({
//						inHTML : true,
//						name:"Content Unit",
//						contentText:contents, 
//						color:"#dddddd",
//						className:"articleBody",
//						tagName:"p",
//					});
//				}
//				break;
		case "DIV":
			var block = false;
			if($curTag.hasClass("runaroundLeft")){
				//if we need to get the aside for the section
				if(parentModel.get("name") === "Section"){
					var that = this;
					parentModel.trigger("addAsideLeft",function(returnAside){
						//set the current tag to the one that we just created
						that.parse(curTag,returnAside);
					});
				}
			}else if($curTag.hasClass("runaroundRight")){
				parentModel.trigger("addAsideRight",function(returnAside){
					//set the current tag to the one that we just created
					that.parse(curTag,returnAside);
				});
			}else if($curTag.hasClass("image")){
				var image = $curTag.find("img");
				var src = image.prop("src");
				var credit = $curTag.siblings('.credit').text();
				var label = $curTag.siblings('.caption').text();
				
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:src,
					credit:credit,
					name:"Image", 
					className:"articleSpanImage",
					color:"white",
				});
				
				addTag.set("original",curTag);
			
				//remove the image from the html so we don't double add it
				$(image).remove();
				

			//tags to ignore
			}else if($curTag.hasClass("doubleRule") /*|| $curTag.hasClass("articleCorrection")*/){
	
			}else if ($curTag.hasClass("articleSpanVideoModule")){
				//for video overlay div
				console.log("removing script tags from the imported html");			
				var videoInfo = $curTag.find("script").text();
			
				videoInfo =  videoInfo.substring(videoInfo.indexOf("videoId") +1 ,videoInfo.length);

				var videoId =  videoInfo.substring(videoInfo.indexOf("\"")+1,videoInfo.indexOf("\"",videoInfo.indexOf("\"")+1));

				videoInfo = videoInfo.substring(videoInfo.indexOf("stillOverlay") +1 ,videoInfo.length);
				var imageSrc =  videoInfo.substring(videoInfo.indexOf("\"")+1,videoInfo.indexOf("\"",videoInfo.indexOf("\"")+1));

				var label = $curTag.find("#articleSpanVideoCaption").text();
				
				addTag = new ContentTagModel({
					inHTML : true,
					source:imageSrc,
					url:this.options.url,
					videoId:videoId,
					name:"Video",
					label:label,
					className:"playOverlay",
					color:"white",
				});
			}else{
				this.parse(curTag,parentModel);
			}
			break;

		default:
			this.parse(curTag,parentModel);
			break;
	}
	return addTag;
}

ParserStates.defaultParser = function(curTag,parentModel){

	
	var $curTag = $(curTag);
	var $parentModel = $(parentModel);

	var addTag = null;
	switch($curTag.prop("tagName")){
		case "IMG":
			var source = $curTag.prop("src");
			var credit = "" //$curTag.siblings('.credit').text();
			var label = ""  //$curTag.siblings('.caption').text();
			var width = $curTag.prop("width");  //$curTag.siblings('.caption').text();
//			if(){
//				source = ParserStates.replaceImageDomain(source);
//			}
			if($curTag.siblings(".playOverlay").length != 0){
				addTag = new ContentTagModel({
					inHTML : true,
					source:source,
					url:this.serverName,
					name:"Video", 
					width:width,
					className:"playOverlay",
					color:"white",
				});
			//if there is a media link
			}else if($curTag.siblings(".mediaOverlay").length != 0){
				addTag = new ContentTagModel({
					inHTML : true,
					label:$curTag.parent().siblings().eq(0).html(),
					source:source,
					name:"Image Link",
					width:width,
					href: $($curTag.parent()).attr("href"),
					className:"mediaOverlay",
					color:"white",
				});
			}else if($curTag.parents(".inset, .insetRight").length != 0){
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:source,
					credit:credit,
					width:width,
					name:"Image", 
					className:"articleSpanImage inset insetRight",
					color:"white",
				});
			}else{
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:source,
					credit:credit,
					pureImage:true,
					width:width,
					name:"Image", 
					className:"articleSpanImage",
					color:"white",
				});
				
			}
			addTag.set("original",curTag);
		
			break;
		case "NYT_BYLINE":
			var author = $curTag.text().replace(/by/i,"");
			
			addTag = new AuthorTagModel({
				inHTML : true,
				author:author,
				name:"Author", 
				className:"byline",
			});
			addTag.set("original",curTag);
			break;
		case "P":
			if(!$curTag.hasClass("caption")){

				//add a new section for nyt if we see a strong heading alone inside a paragraph
				if($curTag.children("strong").length != 0 && $curTag.children().length == 1 && $curTag.children().eq(0).text("") === $curTag.text()){
					console.log("adding new section")
					this.curSection = new ContentTagModel({
						inHTML : true,
						name:"Section", 
						heading:$curTag.children("strong").text(),
						elId:"article",
						className:"section",
						color:"lightblue",
	    				offset:this.documentTags.length,
					});
					this.documentTags.add(this.curSection);
				//otherwise it is just a paragraph as usual
				}else{
					var contents = $curTag.html();
					var $contents = $("<span>"+contents+"</span>");
					//first make sure that the interior images are set to the correct url and that if they fail to load they will remove themselves
					var images = $contents.children("img");
					_.each(images,function(image){
						var src = $(image).attr("src")
						console.log(src);
						src = ParserStates.replaceImageDomain(src);
						console.log(src)
						$(image).attr("src",src);
						$(image).error(function(){$(this).remove();});
					});
					
					addTag = new ContentTagModel({
						inHTML : true,
						name:"Content Unit",
						contentText:$contents.html(), 
						color:"#dddddd",
						className:"articleBody",
						tagName:"p",
					});
				}
			}
			break;
		case "H3":
			if($curTag.hasClass("sectionHeader")){
				var heading = $curTag.text();

				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					heading:heading, 
					color:"#dddddd",
					className:"sectionHeader",
					tagName:"h3",
				});
			}
			break;
		case "H6":
			if($curTag.hasClass("sectionHeader")){
				var heading = $curTag.text();

				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					contentText:heading, 
					color:"#dddddd",
					className:"sectionHeader",
					tagName:"h3",
				});
			}else if($curTag.hasClass("dateline")){
				var date = $curTag.text();

				addTag = new ContentTagModel({
					inHTML : true,
					name:"Date Published",
					date:date, 
					color:"orange",
					className:"dateline",
					tagName:"h6",
				});
			}else if($curTag.attr("class") === ""){
				var heading = $curTag.text();
			
				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					contentText:heading, 
					color:"#dddddd",
					className:"",
					tagName:"h6",
				});
			}
			break;
		case "A":
			var image = $curTag.find("img");

			if(image.length != 0){
				var src = image.prop("src");
				src = ParserStates.replaceImageDomain(src);

				var credit = $curTag.siblings('.credit').text();
				var label = $curTag.siblings('.description').text();
				var width = image.prop("width");

				var contents = $curTag.html();
				
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:src,
					width:width,
					credit:credit,
				});
				//so we don't add it twice;
				//$(image).remove();
			}
			break;
		case "DIV":
			var block = false;
			if($curTag.hasClass("runaroundLeft")){
				//if we need to get the aside for the section
				if(parentModel.get("name") === "Section"){
					var that = this;
					parentModel.trigger("addAsideLeft",function(returnAside){
						//set the current tag to the one that we just created
						that.parse(curTag,returnAside);
					});
				}
			}else if($curTag.hasClass("runaroundRight")){
				parentModel.trigger("addAsideRight",function(returnAside){
					//set the current tag to the one that we just created
					that.parse(curTag,returnAside);
				});
			}else if($curTag.hasClass("image")){
				var image = $curTag.find("img");
				var src = image.prop("src");
				var credit = $curTag.siblings('.credit').text();
				var label = $curTag.siblings('.caption').text();
				src = ParserStates.replaceImageDomain(src);
				var width = $curTag.prop("width");
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:src,
					credit:credit,
					name:"Image", 
					className:"articleSpanImage",
					color:"white",
				});
				
				addTag.set("original",curTag);
			
//				//remove the image from the html so we don't double add it
//				$(image).remove();
				

			//tags to ignore
			}else if($curTag.hasClass("doubleRule") /*|| $curTag.hasClass("articleCorrection")*/){
	
			}else if ($curTag.hasClass("articleSpanVideoModule")){
				//for video overlay div
				console.log("removing script tags from the imported html");			
				var videoInfo = $curTag.find("script").text();
			
				videoInfo =  videoInfo.substring(videoInfo.indexOf("videoId") +1 ,videoInfo.length);

				var videoId =  videoInfo.substring(videoInfo.indexOf("\"")+1,videoInfo.indexOf("\"",videoInfo.indexOf("\"")+1));

				videoInfo = videoInfo.substring(videoInfo.indexOf("stillOverlay") +1 ,videoInfo.length);
				var imageSrc =  videoInfo.substring(videoInfo.indexOf("\"")+1,videoInfo.indexOf("\"",videoInfo.indexOf("\"")+1));

				var label = $curTag.find("#articleSpanVideoCaption").text();
				
			}else{
				this.parse(curTag,parentModel);
			}
			break;

		default:
			this.parse(curTag,parentModel);
			break;
	}
	return addTag;
}
ParserStates.nsf = function(curTag,parentModel){
	var $curTag = $(curTag);
	var $parentModel = $(parentModel);

	var addTag = null;

	switch($curTag.prop("tagName")){
		case "IMG":
			var source = $curTag.prop("src");
			var credit = "" //$curTag.siblings('.credit').text();
			var label = ""  //$curTag.siblings('.caption').text();
			//if there is a video
			source = ParserStates.replaceImageDomain(source);
			
			addTag = new ImageTagModel({
				inHTML : true,
				label:label,
				source:source,
				credit:credit,
				name:"Image", 
				className:"articleSpanImage",
				color:"white",
			});
			addTag.set("original",curTag);
		
			break;
		case "P":
			if($curTag.find(".pageheadline").length != 0){
				this.parse(curTag,parentModel);
				break;
			}
			var contents = $curTag.html();
			var $contents = $("<span>"+contents+"</span>");
			//first make sure that the interior images are set to the correct url and that if they fail to load they will remove themselves
			var images = $contents.find("img");
			console.log(images.length);
			_.each(images,function(image){
				var src = $(image).attr("src")
				src = ParserStates.replaceImageDomain(src);
				$(image).attr("src",src);
				$(image).error(function(){$(this).remove();});
			});
			
			addTag = new ContentTagModel({
				inHTML : true,
				name:"Content Unit",
				contentText:$contents.html(), 
				color:"#dddddd",
				className:"articleBody",
				tagName:"p",
			});
			break;
		case "H3":
			console.log("adding new section")
			this.curSection = new ContentTagModel({
				inHTML : true,
				name:"Section", 
				heading:$curTag.text(),
				elId:"",
				className:"section",
				color:"lightblue",
				tagName:"h3",
				offset:this.documentTags.length,
			});
			this.documentTags.add(this.curSection);
			this.curParentSection = this.curSection;

			break;
		case "H4":
			console.log("adding new subsection")
			this.curSection = new ContentTagModel({
				inHTML : true,
				parent:this.curParentSection,
				name:"Section", 
				heading:$curTag.text(),
				elId:"",
				className:"subsection",
				color:"lightblue",
				tagName:"h4",
				offset:this.documentTags.length,
			});
			this.curParentSection.get("innerTags").add(this.curSection);
			
			break;
		case "A":
			var image = $curTag.find("img");

			if(image.length != 0){
				var src = image.prop("src");
				src = ParserStates.replaceImageDomain(src);

				var credit = $curTag.siblings('.credit').text();
				var label = $curTag.siblings('.description').text();
				
				var contents = $curTag.html();
				
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:src,
					credit:credit,
				});
				//so we don't add it twice;
				$(image).remove();
			}
			break;
		case "STRONG":
			var contents = $curTag.html();
			var $contents = $("<span>"+contents+"</span>");
			//first make sure that the interior images are set to the correct url and that if they fail to load they will remove themselves
			var images = $contents.find("img");
			console.log(images.length);
			_.each(images,function(image){
				var src = $(image).attr("src")
				src = ParserStates.replaceImageDomain(src);
				$(image).attr("src",src);
				$(image).error(function(){$(this).remove();});
			});
			
			addTag = new ContentTagModel({
				inHTML : true,
				name:"Content Unit",
				contentText:$contents.html(), 
				color:"#dddddd",
				className:"articleBody",
				tagName:"p",
			});
			break;
		case "LI":
			var contents = "<li>" + $curTag.html() + "</li>";
			addTag = new ContentTagModel({
				inHTML : true,
				name:"Content Unit",
				contentText:contents,
				color:"#dddddd",
				className:"articleBody",
				tagName:"p",
			});
			break;
		case "SPAN":
			if($curTag.hasClass("pageheadline")){
				parentModel.set("heading",$curTag.text());
			}else{
				this.parse(curTag,parentModel);
			}
			break;
		default:
			this.parse(curTag,parentModel);
			break;
	}
	return addTag;
}
ParserStates.nsfSN = function(curTag,parentModel){
	var $curTag = $(curTag);
	var $parentModel = $(parentModel);

	var addTag = null;

	switch($curTag.prop("tagName")){
		case "IMG":
			var source = $curTag.prop("src");
			var credit = "" //$curTag.siblings('.credit').text();
			var label = ""  //$curTag.siblings('.caption').text();
			//if there is a video
			source = ParserStates.replaceImageDomain(source);
			
			addTag = new ImageTagModel({
				inHTML : true,
				label:label,
				source:source,
				credit:credit,
				name:"Image", 
				className:"articleSpanImage",
				color:"white",
			});
			addTag.set("original",curTag);
		
			break;
		case "P":
			var contents = $curTag.html();
			var $contents = $("<span>"+contents+"</span>");
			//first make sure that the interior images are set to the correct url and that if they fail to load they will remove themselves
			var images = $contents.find("img");
			console.log(images.length);
			_.each(images,function(image){
				var src = $(image).attr("src")
				src = ParserStates.replaceImageDomain(src);
				$(image).attr("src",src);
				$(image).error(function(){$(this).remove();});
			});
			
			addTag = new ContentTagModel({
				inHTML : true,
				name:"Content Unit",
				contentText:$contents.html(), 
				color:"#dddddd",
				className:"articleBody",
				tagName:"p",
			});
			break;
		case "H3":
			console.log("adding new section")
			this.curSection = new ContentTagModel({
				inHTML : true,
				name:"Section", 
				heading:$curTag.text(),
				elId:"",
				className:"section",
				color:"lightblue",
				tagName:"h3",
				offset:this.documentTags.length,
			});
			this.documentTags.add(this.curSection);
			this.curParentSection = this.curSection;

			break;
		case "H4":
			console.log("adding new subsection")
			this.curSection = new ContentTagModel({
				inHTML : true,
				parent:this.curParentSection,
				name:"Section", 
				heading:$curTag.text(),
				elId:"",
				className:"subsection",
				color:"lightblue",
				tagName:"h4",
				offset:this.documentTags.length,
			});
			this.curParentSection.get("innerTags").add(this.curSection);
			
			break;
		case "A":
			var image = $curTag.find("img");

			if(image.length != 0){
				var src = image.prop("src");
				src = ParserStates.replaceImageDomain(src);

				var credit = $curTag.siblings('.credit').text();
				var label = $curTag.siblings('.description').text();
				
				var contents = $curTag.html();
				
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:src,
					credit:credit,
				});
				//so we don't add it twice;
				$(image).remove();
			}
			break;
		case "STRONG":
			var contents = $curTag.html();
			var $contents = $("<span>"+contents+"</span>");
			//first make sure that the interior images are set to the correct url and that if they fail to load they will remove themselves
			var images = $contents.find("img");
			console.log(images.length);
			_.each(images,function(image){
				var src = $(image).attr("src")
				src = ParserStates.replaceImageDomain(src);
				$(image).attr("src",src);
				$(image).error(function(){$(this).remove();});
			});
			
			addTag = new ContentTagModel({
				inHTML : true,
				name:"Content Unit",
				contentText:$contents.html(), 
				color:"#dddddd",
				className:"articleBody",
				tagName:"p",
			});
			break;
		case "DIV":
			if($curTag.is("#mmgplayer")){
				//var url = $curTag.find("object").eq(0).data
				addTag = new ContentTagModel({
					inHTML : true,
					source:" http://"+this.hostName+"/importer/css/images/videoNotfound.png",
					url:this.options.url,
					name:"Video",
					className:"playOverlay",
					color:"white",
				});
			}else if($curTag.is("#date")){
				addTag = new ContentTagModel({
					inHTML : true,
					name:"Date Published",
					date:$curTag.text(), 
					color:"orange",
					className:"dateline",
					tagName:"h6",
				});
			}else{
				this.parse(curTag,parentModel);
			}
			break;
		default:
			this.parse(curTag,parentModel);
			break;
	}
	return addTag;
}
ParserStates.cr = function(curTag,parentModel){
	var $curTag = $(curTag);
	var $parentModel = $(parentModel);

	var addTag = null;

	switch($curTag.prop("tagName")){
		case "IMG":
			var source = $curTag.prop("src");
			var credit = "" //$curTag.siblings('.credit').text();
			var label = ""  //$curTag.siblings('.caption').text();
			var orgURL = $curTag.data("orgURL");
			var width = $curTag.prop("width");
			//if there is a video
			source = ParserStates.replaceImageDomain(source);
			
			addTag = new ImageTagModel({
				inHTML : true,
				label:label,
				source:source,
				credit:credit,
				name:"Image",
				pureImage:true,
				className:"",
				width:width,
				orgURL:orgURL,
				color:"white",
			});
			addTag.set("original",curTag);
		
			break;
		case "FIGURE":
			var source = $curTag.children("img").prop("src");
			var credit = $curTag.find(".figureId").text()
			var label = $curTag.find(".caption").text()  
			var orgURL = $curTag.data("orgURL");
			var width = $curTag.prop("width");
			var url = $curTag.children("img").data("url");
//			//if there is a video
			if($curTag.hasClass("videoView")){
				addTag = new ContentTagModel({
					inHTML : true,
					label:label,
					width:width,
					source:source,
					url:url,
					name:"Video", 
					className:"playOverlay",
					orgURL:orgURL,
					color:"white",
				});
			}else if($curTag.parents(".inset, .insetRight").length != 0){
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:source,
					width:width,
					credit:credit,
					name:"Image",
					orgURL:orgURL,
					className:"articleSpanImage inset insetRight",
					color:"white",
				});
			}else{
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:source,
					credit:credit,
					name:"Image",
					width:width,
					orgURL:orgURL,
					className:"articleSpanImage",
					color:"white",
				});
				
			}
			addTag.set("original",curTag);
			break;
		case "P":
		
			var contents = $curTag.html();
			var $contents = $("<span>"+contents+"</span>");
			//first make sure that the interior images are set to the correct url and that if they fail to load they will remove themselves
			var images = $contents.find("img");
			console.log(images.length);
			_.each(images,function(image){
				var src = $(image).attr("src")
				src = ParserStates.replaceImageDomain(src);
				$(image).attr("src",src);
				$(image).error(function(){$(this).remove();});
			});
			
			addTag = new ContentTagModel({
				inHTML : true,
				name:"Content Unit",
				contentText:$contents.html(), 
				color:"#dddddd",
				className:"articleBody",
				tagName:"p",
			});
			break;
		case "H3":
			if($curTag.hasClass("sectionHeader")){
				var heading = $curTag.text();

				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					heading:heading, 
					color:"#dddddd",
					className:"sectionHeader",
					tagName:"h3",
				});
			}
			break;
		case "H6":
			if($curTag.hasClass("byline")){
				var author = $curTag.text().replace(/by\s/gi,"");
				console.log(author)
				addTag = new AuthorTagModel({
					inHTML : true,
					author:author,
					name:"Author", 
					className:"byline",
				});
			}else if($curTag.hasClass("dateline")){
				var date = $curTag.text().replace(/Published:/gi,"");

				addTag = new ContentTagModel({
					inHTML : true,
					name:"Date Published",
					date:date, 
					color:"orange",
					className:"dateline",
					tagName:"h6",
				});				
			}else if($curTag.attr("class") === ""){

				var heading = $curTag.text();
			
				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					heading:heading, 
					color:"#dddddd",
					className:"title",
					tagName:"h6",
				});
			}
			break;
		case "A":
			
			if($curTag.hasClass("imageLink")){
				var image = $curTag.find("img");
				var source = image.prop("src");
				var width = $curTag.prop("width");
				addTag = new ContentTagModel({
					inHTML : true,
					label:$curTag.siblings().eq(0).html(),
					source:source,
					width:width,
					name:"Image Link",
					href: $curTag.attr("href"),
					className:"mediaOverlay",
					color:"white",
				});
			}
			break;
		case "SECTION":
			if($curTag.hasClass("subsection")){
				var offset = 0;
				if( parentModel != null){
					offset = parentModel.get("innerTags").length;
				}
				this.curSection = new ContentTagModel({
					inHTML : true,
					name:"Section", 
					heading:$curTag.data("name"),
					className:$curTag.attr("class"),
					parentModel:parentModel,
					number:$curTag.data("number"),
					color:"lightblue",
					offset:offset,
				});
				if( parentModel != null){
					parentModel.get("innerTags").add(this.curSection);
				}else{
					this.documentTags.add(this.curSection);
				}
				this.parse(curTag,this.curSection);

			}else if($curTag.hasClass("section")){
				this.curSection = new ContentTagModel({
					inHTML : true,
					name:"Section", 
					heading:$curTag.data("name"),
					className:$curTag.attr("class"),
					number:$curTag.data("number"),
					color:"lightblue",
					offset:this.documentTags.length,
				});
				this.documentTags.add(this.curSection);
				this.parse(curTag,this.curSection);
			}else{
				this.parse(curTag,parentModel);
			}
			

			break;
		case "DIV":
			if($curTag.hasClass("table")){
				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					contentText:$curTag.html(),
					color:"#dddddd",
					className:"articleBody",
					tagName:"p",
				});
			}else if($curTag.hasClass("runaroundLeft")){
				//if we need to get the aside for the section
				if(parentModel.get("name") === "Section"){
					var that = this;
					parentModel.trigger("addAsideLeft",function(returnAside){
						//set the current tag to the one that we just created
						that.parse(curTag,returnAside);
					});
				}
			}else if($curTag.hasClass("runaroundRight")){
				var that = this;
				parentModel.trigger("addAsideRight",function(returnAside){
					//set the current tag to the one that we just created
					that.parse(curTag,returnAside);
				});
			}else if ($curTag.hasClass("articleSpanVideoModule")){
				//for video overlay div
				console.log("removing script tags from the imported html");			
				var videoInfo = $curTag.find("script").text();
			
				videoInfo =  videoInfo.substring(videoInfo.indexOf("videoId") +1 ,videoInfo.length);

				var videoId =  videoInfo.substring(videoInfo.indexOf("\"")+1,videoInfo.indexOf("\"",videoInfo.indexOf("\"")+1));

				videoInfo = videoInfo.substring(videoInfo.indexOf("stillOverlay") +1 ,videoInfo.length);
				var imageSrc =  videoInfo.substring(videoInfo.indexOf("\"")+1,videoInfo.indexOf("\"",videoInfo.indexOf("\"")+1));

				var label = $curTag.find("#articleSpanVideoCaption").text();
				var width = $curTag.prop("width");
				addTag = new ContentTagModel({
					inHTML : true,
					width:width,
					source:imageSrc,
					url:this.serverName,
					videoId:videoId,
					name:"Video",
					label:label,
					className:"playOverlay",
					color:"white",
				});
			}else if($curTag.hasClass("style")){
				var that = this;
				console.log($curTag.data("style"));
				parentModel.trigger("addStyle",function(returnAside){
					//set the current tag to the one that we just created
					that.parse(curTag,returnAside);
				},$curTag.data("style"));
			}else if($curTag.hasClass("pagebreak")){
				var pageNumber = "";
				pageNumber = $curTag.find(".pagenumber").text()
				pageNumber = (pageNumber === "") ?  $curTag.text() : pageNumber
				addTag = new ContentTagModel({
					inHTML : true,
					name:"Page Break",
					number:pageNumber,
					className:"pagebreak",
					color:"lightpink",
				});
			}else{
				this.parse(curTag,parentModel);
			}
			break;

		default:
			var editor = $curTag.data("editor");
			if(editor != null){
				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					contentText:$curTag.html(),
					color:"#dddddd",
					className:"",
					type:editor,
					tagName:editor,
				})
			}else if($curTag.hasClass("style")){
				var that =this;
				parentModel.trigger("addStyle",function(returnAside){
					//set the current tag to the one that we just created
					that.parse(curTag,returnAside);
				},$curTag.attr("style"));
			}else{
				this.parse(curTag,parentModel);
			}
			break;
	}
	return addTag;
}
ParserStates.pdf = function(curTag,parentModel){
	var $curTag = $(curTag);
	var $parentModel = $(parentModel);

	var addTag = null;
	
	switch($curTag.prop("tagName")){
		case "IMG":
			var source = $curTag.prop("src");
			var credit = "" //$curTag.siblings('.credit').text();
			var label = ""  //$curTag.siblings('.caption').text();
			//if there is a video
			source = ParserStates.replaceAbsoluteImageDomain(source);
			if($curTag.siblings(".playOverlay").length != 0){
				addTag = new ContentTagModel({
					inHTML : true,
					source:source,
					url:this.serverName,
					name:"Video", 
					className:"playOverlay",
					color:"white",
				});
				
			//if there is a media link
			}else if($curTag.siblings(".mediaOverlay").length != 0){
				addTag = new ContentTagModel({
					inHTML : true,
					label:$curTag.siblings().eq(0).html(),
					source:source,
					name:"Image Link",
					href: $($curTag.parent()).attr("href"),
					className:"mediaOverlay",
					color:"white",
				});
			}else if($curTag.parents(".inset, .insetRight").length != 0){
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:source,
					credit:credit,
					name:"Image", 
					className:"articleSpanImage inset insetRight",
					color:"white",
				});
			}else{
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:source,
					credit:credit,
					name:"Image", 
					className:"articleSpanImage",
					color:"white",
				});
				
			}
			addTag.set("original",curTag);
		
			break;
		case "P":
			if(!$curTag.hasClass("caption")){

				//add a new section for nyt if we see a strong heading alone inside a paragraph
				if($curTag.children("strong").length != 0 && $curTag.children().length == 1){
					console.log("adding new section")
					this.curSection = new ContentTagModel({
						inHTML : true,
						name:"Section", 
						heading:$curTag.children("strong").text(),
						elId:"article",
						className:"section",
						color:"lightblue",
	    				offset:this.documentTags.length,
					});
					this.documentTags.add(this.curSection);
				//otherwise it is just a paragraph as usual
				}else{
					var contents = $curTag.html();
					var $contents = $("<span>"+contents+"</span>");
					//first make sure that the interior images are set to the correct url and that if they fail to load they will remove themselves
					var images = $contents.find("img");
					console.log(images.length);
					_.each(images,function(image){
						var src = $(image).attr("src")
						src = ParserStates.replaceAbsoluteImageDomain(src);
						$(image).attr("src",src);
						$(image).error(function(){$(this).remove();});
					});
					
					addTag = new ContentTagModel({
						inHTML : true,
						name:"Content Unit",
						contentText:$contents.html(), 
						color:"#dddddd",
						className:"articleBody",
						tagName:"p",
					});
				}
			}
			break;
		case "H3":
			if($curTag.hasClass("sectionHeader")){
				var heading = $curTag.text();

				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					heading:heading, 
					color:"#dddddd",
					className:"sectionHeader",
					tagName:"h3",
				});
			}
			break;
		case "H6":
			if($curTag.hasClass("sectionHeader")){
				var heading = $curTag.text();

				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					contentText:heading, 
					color:"#dddddd",
					className:"title",
					tagName:"h3",
				});
			}else if($curTag.hasClass("dateline")){
				var date = $curTag.text();

				addTag = new ContentTagModel({
					inHTML : true,
					name:"Date Published",
					date:date, 
					color:"orange",
					className:"dateline",
					tagName:"h6",
				});
			}else if($curTag.attr("class") === ""){
				var heading = $curTag.text();
			
				addTag = new ContentTagModel({
					inHTML : true,
					name:"Content Unit",
					contentText:heading, 
					color:"#dddddd",
					className:"",
					tagName:"h6",
				});
			}
			break;
		case "A":
			var image = $curTag.find("img");

			if(image.length != 0){
				var src = image.prop("src");
				src = ParserStates.replaceAbsoluteImageDomain(src);

				var credit = $curTag.siblings('.credit').text();
				var label = $curTag.siblings('.description').text();
				
				var contents = $curTag.html();
				
				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:src,
					credit:credit,
				});
				//so we don't add it twice;
				$(image).remove();
			}
			break;
		case "DIV":
			var block = false;
			if($curTag.hasClass("runaroundLeft")){
				//if we need to get the aside for the section
				if(parentModel.get("name") === "Section"){
					var that = this;
					parentModel.trigger("addAsideLeft",function(returnAside){
						//set the current tag to the one that we just created
						that.parse(curTag,returnAside);
					});
				}
			}else if($curTag.hasClass("runaroundRight")){
				parentModel.trigger("addAsideRight",function(returnAside){
					//set the current tag to the one that we just created
					that.parse(curTag,returnAside);
				});
			}else if($curTag.hasClass("image")){
				var image = $curTag.find("img");
				var src = image.prop("src");
				var credit = $curTag.siblings('.credit').text();
				var label = $curTag.siblings('.caption').text();
				src = ParserStates.replaceAbsoluteImageDomain(src);

				addTag = new ImageTagModel({
					inHTML : true,
					label:label,
					source:src,
					credit:credit,
					name:"Image", 
					className:"articleSpanImage",
					color:"white",
				});
				
				addTag.set("original",curTag);
			
				//remove the image from the html so we don't double add it
				$(image).remove();
				

			//tags to ignore
			}else if($curTag.hasClass("doubleRule") /*|| $curTag.hasClass("articleCorrection")*/){
	
			}else{
				this.parse(curTag,parentModel);
			}
			break;

		default:
			this.parse(curTag,parentModel);
			break;
	}
	return addTag;
}