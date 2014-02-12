
var CRImportView = Backbone.View.extend({
    id: "main",
    working:false,
    type:"default",
    initialize: function(){
    	this.rendered = false;
    	this.newUserFlag = false;
    	this.description = "";
    	this.title = "";
    	this.currentURL = "";
    	this.isDirty = false;
    	this.mode = "Create Content";
        this.navView = new NavView();    	
        this.saveInterval = null;
        this.keysDown = new Array();
        this.fileUpload = false;
        this.htmlChooser = new HTMLChooserView({collection:new HTMLChoiceCollection()});
        this.$iFileDown;
        //models for the tags we show on the side, created on the client for now
        var tagModels =
        	[
				{
					name:"Image",
					saraTag:null,
					tagType:"h1",
					color:"white",
					className:"image",
				},
    		 	{
    		 		name:"Section",
        			saraTag:null,
        			className:"section",
        			tagType:"section",
        			color:"lightblue",

    		 	},
    		 	{
    		 		name:"Aside Left",
    		 		number:null,
        			saraTag:null,
        			tagType:"div",
        			color:"lightgreen",
        			className:"asideLeft articleInline runaroundLeft",

    		 	},
    		 	{
    		 		name:"Aside Right",
    		 		number:null,
        			saraTag:null,
					className:"",
        			tagType:"div",
        			color:"olivedrab",
        			className:"asideRight articleInline runaroundRight",

    		 	},
    		 	{

				 	name:"Content Unit",
					saraTag:null,
					number:null,
					tagType:"p",
        			color:"#dddddd",
        			className:"text",

    		 	},
    		 	{
    		 		name:"Page Break",
    		 		number:null,
        			saraTag:null,
					className:"pagebreak",
        			tagType:"div",
        			color:"lightpink",
            		className:"pageBreak",
    		 	},	
    		 	
    		 	{
    		 		name:"Style",
        			saraTag:null,
        			tagType:"span",
        			color:"lightyellow",
    		 		className:"style",
    		 	},
    		 	
//    		 	{
//    		 		name:"Date Published",
//        			saraTag:null,
//        			tagType:"h6",
//        			color:"orange",
//            		className:"date",
//    		 	},
//    		 	{
//    		 		name:"Author",
//        			saraTag:null,
//        			tagType:"h6",
//        			color:"yellow",
//            		className:"author",
//    		 	},
    		]
        
        this.tagSelectorView = new TagSelectorView({tags:tagModels});
        this.contentView = new DocumentView();

        CRImport.preview = new PreviewView();
        this.bookDrop = new BookSelectorView({collection:CRImport.bookData});
        //find the current book and then it's current content
        if(this.options.newUser){
        	this.newUser()
        }else{
	    	this.currentBook = this.bookDrop.getCurrent();
	    	this.current = this.currentBook.getCurrent();
	    	//init the menu tags with the current book
	        CRImport.menuTags = new TagTypeCollection($.parseJSON(this.currentBook.get("tagTypes")));
	    	//init the first content
	    	this.contentChange(this.current);
        }
    	
        CRImport.events.bind("contentChange",this.contentChange,this);
        CRImport.events.bind("markupDirty",function(dirty){
        	if(dirty){
        		this.isDirty = true;
	        	this.$el.find("#saveLink").removeClass("disabled-link");
        	}else{
	        	this.isDirty = false
	        	this.$el.find("#saveLink").addClass("disabled-link")
        	}
        },this);

        var that = this;

        
        this.undelegateEvents();
        this.delegateEvents();

    },
    events:{
    	"click #importHTML" : "importModal",
    	"click #exportHTML" : "exportModal",
    	"click #createSwitchContent" : "saveContent",
    	"click #exportContent":"exportContent",
    	"click #saveContent": "saveContent",
    	"click #saveBook": "saveBook",
    	"click #newUser" :"newUserInit",
    	"click #rawPop":"rawPop", 
    	"click #importAcceptHTML":"importHTML",  	
        "click #logout": "logout",
        "click #saveAsLink" :"saveAs",
        "click #saveLink" :"save",
        "click #showFileUpload" :"showFileUpload",
        "click #showUrlUpload" :"showUrlUpload",
        "change #contentFiles" :"handleFileSelect",
        "click #htmlTextConfirm" : "importHTMLText",
        "click #saveFileSystemLink" : "saveToFilesystem",
    },
    checkType:function(type){
    	if(type == "New York Times"){
    		type = "nyt";
    	}else if(type == "Default"){
    		type = "default"
    	}else if(type == "National Science Foundation"){
    		type =  "nsf"
    	}else if(type == "National Science Foundation(Document)"){
    		type = "nsfDoc"
    	}else if(type == "National Science Foundation(Science Nation)"){
    		type = "nsfSN"
    	}else if(type == "Converted PDF(HTML)"){
    		type = "pdf"
    	}else if(type == "Campus Reader"){
    		type = "cr"
    	}
    	return type
    },
    saveToFilesystem:function(event){
    	var that = this;
  	  	var id = this.current.id;
  	  	var url = "/getCaretHTML/" +id
    	this.save(event,function(){
    		var pom = document.createElement('a');
    	    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(that.get("contents")));
    	    pom.setAttribute('download', that.get("title"));
    	    pom.click();
//    	    if (that.$iFileDown) {
//    	    	that.$iFileDown.attr('src',url);
//    	    	} else {
//    	    		that.$iFileDown = $('<iframe>', { id:'idown', src:url+".html" }).hide().appendTo('body');
//    	    	}
//    		}
    	});
    },
    importHTMLText:function(){
    	var text = this.$el.find("#htmlText").val();
    	var htmlChoice = new HTMLChoice({
			"name" : "Pasted HTML",
			"contents" : text,
		});
    	
    	if(text != null){
    		this.htmlChooser.add(htmlChoice);
    	}else{
    		bootbox.alert("Please paste text to upload");
    	}
    	this.$el.find("#htmlText").val("");

    },
    handleFileSelect:function (evt) {
        var files = evt.target.files; // FileList object
        this.readFile(files);
    },
    showUrlUpload:function(e){
    	this.fileUpload = false;
    	var $importModal = this.$el.find("#importModal");
    	$importModal.find("#showFileUpload").show();
    	//urlupload button
    	$importModal.find("#showUrlUpload").hide();
    	$importModal.find("#urlUpload").show();
    	$importModal.find("#importHeaderText").text("Import From URL")
    	$importModal.find("#fileUpload").hide();
    	$($importModal.find("#importAcceptHTML")).attr("disabled", false);
    },
    showFileUpload:function(e){
    	this.fileUpload = true;
    	var $importModal = this.$el.find("#importModal");
    	$importModal.find("#showUrlUpload").show();
    	//fileupload button
    	$importModal.find("#showFileUpload").hide();
    	$importModal.find("#urlUpload").hide();
    	$importModal.find("#importHeaderText").text("Import From File")
    	$importModal.find("#fileUpload").show();
    	$($importModal.find("#importAcceptHTML")).attr("disabled", true);
    	this.uploadImages = new Array();
    	this.initFileDrop();
    },
    newUser:function(){
    	console.log("new user logged in")
    	if(this.rendered == true){
    		//pop the forced add content form
    		this.mode = "Create Content";
        	this.newUserModal();
        }else{
    		this.newUserFlag = true;
    	}
    },
    //simple save fore dirty markup
    save:function(event,callback,force){
    	if(this.isDirty || force == true){
            CRImport.events.trigger("markupDirty",false);
	    	var current = false;
	    	if(callback == null){
	    		callback = function(){};
	    		current = true;
	    	}
	    	console.log(this.contentView.model.toJSON());

    		//callback to finish the save unless we are creating new content
	    	this.current.save({contentType:this.contentView.typeName,current:current,contents:this.contentView.getChildHTML(),json:this.contentView.model.toJSON()},{error:function(error){
	    		console.log(error);
	    	},success:callback});

	    	
	    	//once we have saved the content save it's book with the new tagtypes
	    	this.current.collection.book.save({tagTypes:JSON.stringify(CRImport.menuTags.toJSON())})
    	}else{
    		//TODO debug
    		if(callback)callback();
    		if(event)event.preventDefault();
    		return false;
    	}
    },
    saveAs:function(){
    	this.mode = "Save Content";
    	//if we give it something to save save that
    	this.contentModal(this.current);
    },
    newUserInit:function(event){
    	var $newUserModal = $("#newUserModal");
    	$(event.target).attr('disabled','disabled');
    	var contentName = $newUserModal.find("#contentName").val();
    	var bookName = $newUserModal.find("#bookName").val();
    	
    	
		if(contentName != ""){
			if(bookName != ""){
				var bookDescription = $newUserModal.find("#bookDescription").val();
				var contentDescription = $newUserModal.find("#contentDescription").val();
				
				var type = this.contentView.typeName;
		    	
		    	var firstBook = new BookModel({description:bookDescription,title:bookName})	    	
		    	var firstContent = new ContentModel({description:contentDescription,title:contentName,current:true});

		    	var that = this;
		    	firstBook.save(null,{
			    	success: function(model){
			    		firstBook.chapters.add(firstContent);
			    		firstContent.save(null,{
			    			success: function(model){
								that.bookDrop.saveBook(firstBook);
				    			that.current = firstContent;
				    			//hide the modal
				    			$newUserModal.modal("hide");
			    			}
			    		});
		    		}
		    	});

			}else{
				bootbox.alert("Enter a book name.")
			}
		}else{
			bootbox.alert("Enter a content name.")
		}
     },
    //called when we create new content or edit more that just the content html
    saveContent:function(event){
    	var $contentModal = $("#contentModal");
    	if(event){
    		$contentModal = $($(event.target).closest(".modal"));
    	}

    	var name = $contentModal.find("#contentName").val();
		if(name != null && name !== ""){
			var swap = true;
	    	var description = $contentModal.find("#description").val();
	    	var type = this.contentView.typeName;
	    	var that = this;
	    	var current = this.editing;
	    	var contents = ""
	    		//if we are not creating a new content
	    	if(this.mode != "Create Content"){
	    		contents= this.contentView.getChildHTML();
	    	}
	    	current.save({
	    		title:name,
	    		description:description,
	    		contentType:type,
	    		current:false,
	    		contents:contents,
	    	},
	    	{
		    	success: function(model){
		    		//keep state intact
		            CRImport.events.trigger("markupDirty",false);
			    	if(that.contentAddCollection != null){ 
			    		that.contentAddCollection.add(current);
			    	}
		    		//if we are creating content
		    		if(that.mode != "Save Content"){
		    			//then we are going to swap so clear all the other current
		    			current.collection.each(function(content){
		    				content.set("current",false);
		    			});
		    		}
		    		//set this to the current content in the selector view
		    		current.set("current",true);
		    		if(event && $(event.target).has(".createSwitchContent")){
		    			that.contentChange(current)
		    		}
		    		//hide the modal
			    	$contentModal.modal("hide");
			    	
			    	//once we have saved the content save it's book with the new tagtypes
			    	current.collection.book.save({tagTypes:JSON.stringify(CRImport.menuTags.toJSON())});
		    	},
		    	error:function(model,response){
		    		bootbox.alert("Failed to Save Content");
		    	},
	    	});
		}else{
			bootbox.alert("Please enter a name.");
		}
    },
    addContent:function(collection,content){
    	this.mode = "Create Content";
    	if(content == null ){
    		content = new ContentModel();
    	}
    	this.editing = content;
    	this.contentAddCollection = collection;
    	
    	//remove the old modal
    	this.$el.find("#contentModal").remove();
    	
    	this.$el.append(this.contentTemplate(content.toJSON()));
    	var $contentModal = $('#contentModal');
    	$contentModal.modal();
    	
//    	$contentModal.on('hidden.bs.modal', function () {
//    		var form = $contentModal.find("#contentForm")[0]
//    		if(form)form.reset();
//    	});
    },
    addBook:function(){
    	this.$el.find("#bookModal").remove();
    	this.$el.append(this.bookTemplate());
    	var $bookModal = $('#bookModal');
    	$bookModal.modal();
    	$("#saveBook").css("disabled",false)
    	$bookModal.on('hidden.bs.modal', function () {
    		var form = $bookModal.find("#bookForm")[0]
    		if(form)form.reset();
    	});
    },
    saveBook:function(){
    	$("#saveBook").css("disabled",true)
    	var $bookModal = $("#bookModal");
    	if(event){
    		$bookModal = $($(event.target).closest(".modal"));
    	}
    	
    	var name = $bookModal.find("#bookName").val();
		if(name != null && name !== ""){
	    	var description = $bookModal.find("#description").val();
	    	var that = this;
	    		    		
	    	new BookModel().save({
	    		title:name,
	    		description:description,
	    	},
	    	{
		    	success: function(model){
		    		//keep state intact
		            CRImport.events.trigger("markupDirty",false);
					that.bookDrop.saveBook(model);
					$bookModal.modal("hide");
		    	},
		    	error:function(model,response){
		    		bootbox.alert("Failed to Save Book");
		    	},
	    	});
		}else{
			bootbox.alert("Please enter a name.");
		}
    },
    rawPop:function(){
    	var newWindow = window.open();
    	newWindow.document.write('<pre class="prettyprint lang-html" ></pre>');
    	console.log(this.contentView.getChildHTML())
    	$(newWindow.document.body).find(".prettyprint").text(markup_beauty({source:this.contentView.getChildHTML()}))
    },
    contentChange:function(newContent){
    	var that = this
    	//save the old content first
    	this.save(null,function(){
//        	if(that.current) that.current.set("current",false);

    		//NOTE this code will always get executed even if save doesn't happen
    		that.current = newContent;
    		
    		//make sure to clear the old interval or timers will build up
    		clearInterval(this.saveInterval)
    		
    		/**TODO disabled for now so that people don't overwrite their changes if errors happen. Reintroduce when undo is implemented perhaps, and only stable versions are deployed**/
    		//when the content changes, start an interval to save once a minute
//    		that.saveInterval = setInterval(function(){
//    			//simple save if the content isDirty
    		/**TODO also add a check here to make sure that we don't auto-save full removals of the document ect, perhaps save to localstore in these cases**/
//    			that.save();
//    		},30000);
    		
    		
    		
    		//load the json from the model to build the tree 
    		if(that.current.get("json") != null && that.current.get("json") != ""){
    			//load the json from the model to build the tree 
        		that.contentView.changeContent(
        	    	that.current
        	    );
        		
    		}else{
    			that.handleContent(that.current.get("contents"),"cr");
        		that.setTitle(that.current.get("title"));
    		}
    		//set the title to be the content title
        	that.contentView.forceEdit();

            CRImport.events.trigger("markupDirty",false);
            //make sure server knows this is the current book and content
    	});
    },
    exportContent:function(book){
    	$("#saveContent").prop('disabled', true);
    	
    	var that = this;
    	//first save the current content
    	this.save(null,function(){
    		
    		var chapters = book.chapters;
        	var sendBook = book.toJSON();
        	var jsonChapters = new Array();
        	
    		chapters.each(function(chapter){

    			//finish the markup and save it in the model
    	        chapter.finishHTMLMarkup();
    			
    			var jsonChapter = chapter.toJSON();

    			console.log(chapter.get("html"))
    			var $section = $(chapter.get("html"))
    			var sections = $section.find("section");
    			var sections = $("section");
    			var sectionsJSON = new Array();
    			_.each(sections,function(section){
    				var $section = $(section);
    				sectionsJSON.push({sectionNumber:$section.data("number"),name:$section.data("name"),subsection:$section.hasClass("subsection")});
    			})
    			//only send a chapter if it has a section
    			if(sectionsJSON.length != 0){
	    	    	var pages = chapter.get("html").match("<pages");
	    			jsonChapter.numsections = (sections != null ) ? sections.length : 0;
	    			jsonChapter.sections = JSON.stringify(sectionsJSON);
	    	    	jsonChapter.pages = (pages != null ) ? pages.length : 0;
	    	    	jsonChapter.name = jsonChapter.title;    	    	
	    	    	jsonChapter.css = "contents/imported/"+that.type+".css";
	    	    	jsonChapter.type = that.current.get("contentType");
	    	    	jsonChapter.url = that.currentURL;
	    	    	jsonChapters.push(jsonChapter);
    			}
    		});
    		
    		sendBook.chapters = jsonChapters;
    		
    		/**TODO check if article**/
    		sendBook.type = "book";
    		if(sendBook.description == null) sendBook.description = "";

	    	$.post("/importBook",JSON.stringify(sendBook),"json")
	    	.done(function(){
	    		bootbox.alert("Upload Complete!");
	        	$('#exportModal').modal('hide');
		    	$("#saveContent ,#cancelSaveContent").prop('disabled', false);
	    	})

    	})
    },
    
    //used to handle files that are passed to the import form
    readFile : function(entry) {
		var that = this;
		if (entry.isFile || entry.size != null) {
			var handleFile = function(file) {
				
				var reader = new FileReader();
				var fileName = entry.fullPath; 
				if(entry.fullPath == null){
					fileName = file.name;
				}
				// found image
				if (fileName.match(/\.(gif|jpg|jpeg|tiff|png)$/i) || file.type.match(/image/)) {
					reader.onloadend = function(e) {
						that.uploadImages.push({
							"src" : fileName,
							"contents" : this.result,
							"file" : file,
						});
						var numImages = parseInt($("#numImages").text())
						numImages += 1;
						$("#numImages").text(numImages);
					}
					reader.readAsBinaryString(file);	
					console.log("image found in upload");
				// found html
				} else if (fileName.match(/\.(html|jsp|)$/) || file.type == "text/html") {
					// when the html is done reading
					reader.onloadend = function(e) {
						var contents = this.result;
						
						// set to default for now
						that.type = "default";
						
						// update status of html in form to show we have an html file
						$("#htmlPresent").text(file.name).closest(".control-group").removeClass("error").addClass("success");
						
						var htmlChoice = new HTMLChoice({
							"name" : fileName,
							"contents" : contents,
						})
						that.htmlChooser.add(htmlChoice);
						
						// enable the import button
					};
					reader.readAsText(file);
					// don't know what this file is
				} else if (file.type == "text/css") {
				
				//if we have an epub or a zip file, then unzip it and load all the chapters
				}else if(fileName.match(/\.(epub|zip)*$/) || file.type == "text/html"){
					//50 megabytes
					if(file.size < 50000000){
						reader.onloadend = function(e) {
							
							/**https://github.com/augustl/js-unzip**/
							var unzipper = new JSUnzip(this.result);
	
							if(unzipper.isZipFile()){
								unzipper.readEntries();    // Creates "entries" an Array of JSUnzip.ZipEntry objects.
								_.each(unzipper.entries,function(entry){
									//DEFLATED
									console.log(entry.fileName + " " + entry.compressionMethod );
									var uncompressed = null;
									if(entry.compressionMethod == 8){
										/**https://github.com/augustl/js-inflate**/
										uncompressed = JSInflate.inflate(entry.data)
										//image
										if (entry.fileName.match(/\.(gif|jpg|jpeg|tiff|png)$/i)){
											that.uploadImages.push({
												"src" : entry.fileName,
												"contents" : uncompressed,
											});
											var numImages = parseInt($("#numImages").text())
											numImages += 1;
											$("#numImages").text(numImages);
										//html
										}else if(entry.fileName.match(/\.(html|jsp|)$/)){
											var htmlChoice = new HTMLChoice({
												"name" : entry.fileName,
												"contents" : uncompressed,
											})
											that.htmlChooser.add(htmlChoice);
										}
										
									}else if (entry.compressionMethod === 0){
										//Uncompressed
										uncompressed = entry.data;
									}
	
								});
							}
						}
						reader.readAsBinaryString(file);
					}else{
						bootbox.alert("This File is too large, please unzip it and try uploading again.")
					}
				}else{
					// for now just push anything we
					// don't know on the img check list
					reader.onloadend = function(e) {
						that.uploadImages.push({
							"src" : fileName,
							"contents" : this.result,
							"file" : file,
						});
						var numImages = parseInt($("#numImages").text())
						numImages += 1;
						$("#numImages").text(numImages);
					}
					reader.readAsBinaryString(file);
					console.log("image found in upload");
				}
	
			}

			if(entry.fullPath != null){
				console.log(entry)
				entry.file(handleFile, function(e) {
					console.error("error");
				});

			}else{
				handleFile(entry);

			}
		// dropped folder or multiple files
		} else if (entry.isDirectory || entry.length != 0) {
			
			var filePath = entry.fullPath
			if(filePath){
				entry.filesystem.root.getDirectory(filePath, {
					create : false
				}, function(dirEntry) {
					var dirReader = dirEntry.createReader();
					dirReader.readEntries(function(entries) {
						_.each(entries, that.readFile,that);
					}, function() {
						// error
					});
				});
			}else{
				//get all the files
				for(var i=0,file;file=entry[i];i++) {
					//do your thing
					that.readFile(file);
				}
			}
		}
    },
    initFileDrop:function(){
    	//init filedrop
 	    var that = this;
 	    var images = new Array();
 	    
 	    //init html chooser
 	    this.$el.find(".htmlArea").eq(0).html(this.htmlChooser.render().el);
 	    
    	function dragEnter(evt) {
    	    evt.stopPropagation();
    	    evt.preventDefault();
    	    $("#dropzone").addClass('over');
    	}

    	function dragLeave(evt) {
    	    evt.stopPropagation();
    	    evt.preventDefault();
    	    if($("#dropzone") ==$(evt.target))$("#dropzone").removeClass('over');
    	}

		function drop(e) {
			event.stopPropagation();
			event.preventDefault();
			var length = event.dataTransfer.items.length;
			var entries = new Array();
			for ( var i = 0; i < length; i++) {
				var entry = event.dataTransfer.items[i].webkitGetAsEntry();
				entries.push(entry);
				console.log(entry);

			}
			_.each(entries,that.readFile,that);
			$("#dropzone").removeClass('over');
			// recursive function read down directories

		}
    
		var $dropzone = $( "#dropzone" );
		$dropzone.bind("dragenter", dragEnter);
		$dropzone.bind("dragleave", dragLeave);
		$dropzone.bind("drop", drop);
		$(document).bind('dragover', function (e) {
			e.preventDefault();
		});
    },
    //import button
    importHTML:function(){
    	
    	var $importModal = $("#importModal");
    	var type = this.checkType($importModal.find(".cssChooser").val());
    	
		var that = this;
		this.finished = false;

    	if(this.fileUpload === true){
    		//get the current html from the chooser
    		this.currentUploadHTML =   (that.htmlChooser.getCurrent() != null) ?  that.htmlChooser.getCurrent().get("contents"): "";

        	var finishedUploading = function(){
        		if(!that.finished){
        			that.finished = true;
	        		//default for now
	        		that.type = "default";
	    		   	//this.$el.find("#fileType").val();
	    		   	CRImport.importing = true;
	    		   	//always inport with default type
	    		   	that.handleContent(that.currentUploadHTML,"cr");
	    			CRImport.importing = false;
	    			CRImport.events.trigger("markupDirty",true);
	    			//clear out the array
	        		that.uploadImages = new Array();
	        		that.htmlChooser.collection.reset();
			    	return;
        		}

    		}
    		var length = 0;
    		var imageLinksHTML = this.currentUploadHTML.match(/<img[^>]*src\s*=\s*("|')+[^\s]*("|')+/gi);
    		//search through the html for each image and if it is found upload it to the server and replace the url in the image src
    		_.each(imageLinksHTML,function(link){
    			var link = link.replace(/<img[^>]*src\s*=\s*/gi,"").replace(/("|')/gi,"");
    			//first try the array
    			var image = _.find(that.uploadImages,function(image){
    				var dirs = image.src.split("/")
    				var src = dirs[dirs.length -1];
    				var links = link.split("/");
    				var minlink = links[links.length-1];
    				return minlink  == src
    			})
    			
    			//didn't find it in the array so try the web!
    			if(image == null ){
    				if(CRImport.validURL(link)){
    					image = {src:link,contents:null}
    				}
    			}
    			//try to upload
    			if(image != null){
    				length++;
    				var formData = new FormData();
    				formData.append(image.src,image.contents);
    				if(image)
    				  var xhr = new XMLHttpRequest();
					  xhr.open('POST', "/importImage", true);
					  xhr.onload = function(e){
						try{
							var data = JSON.parse(this.response);
							if(data.id == null){
								imageSrc = "imageNotFound.png";
							}else{
							    imageSrc ="/getImage/"+ data.id;
							}
						    that.currentUploadHTML = that.currentUploadHTML.replace(link,imageSrc);
						}catch(e){
						    	
						}
						length--;
					    if(length == 0){
					    	finishedUploading();
					    	return;
					    }
					  },
					  xhr.setRequestHeader("Content-Type", "multipart/form-data");
					  if(image.contents != null){
						  xhr.sendAsBinary(image.contents);  // multipart/form-data
					  }else{
						  length--;
					  }
					if(length == 0){
						finishedUploading();
    				}
    			}else{
    				imageSrc = "imageNotFound.png";
					that.currentUploadHTML = that.currentUploadHTML.replace(link,imageSrc);
					if(length == 0){
						finishedUploading();
    				}
    			}
    		},this);
    		
    		if(length == 0){
				finishedUploading();
			}
    	//url upload
    	}else{
	    	this.description = $importModal.find("#description").val();
	    	this.currentURL = $importModal.find("#importURL").val();
	    	
	    	if(this.type === "nyt"){
	    		if(this.currentURL.indexOf("?") == -1){
	    			this.currentURL = this.currentURL+ "?pagewanted=all";
	    		}
	    	}
	    	bootbox.confirm("Import HTML from \"" + this.currentURL+ "\" (This will clear the contents of the editor)", function(result) {
	    		if(result == true){
		    		$importModal.modal('hide')
					console.log("loading html for URL:" + that.currentURL);
					$("#spinner #label").text("Loading Content...");
					$("#spinner").show();
					$("#importAcceptHTML").attr("disabled", true);
					
					if(that.currentURL[0] === "/"){
						$.get(that.currentURL,function(data){
							CRImport.importing = true;
			    		   	that.handleContent(data,type);
							CRImport.importing = false;
					        CRImport.events.trigger("markupDirty",true);
				    	});
					}else{
				    	$.get("/getHTML",{importURL: that.currentURL},function(data){
				    		CRImport.importing = true;
			    		   	that.handleContent(data,type);
							CRImport.importing = false;
					        CRImport.events.trigger("markupDirty",true);
				    	});
					}
		    	}
	    	});
    	} 	
    },
    //handles the html that user wanted to import
    handleContent:function(html,type){
    	if(html === "request timeout"){
			bootbox.alert("The request to: " +this.currentURL+" timed out.");	    		
		}
		
		//give the content to the parser
		$("#spinner #label").text("Parsing Content...");
		
		//if a type wasnt passed check the contentview
		if(type ==  null )type = this.contentView.type;
			
		this.parser =  new Parser({content:this.contentView,html:html,type:type,url:this.currentURL});
		//parse!
		this.parse(type == "cr");
		//set the content as dirty
        CRImport.events.trigger("markupDirty",true);
    	$(".contentTagContainer").trigger("forceHTML");

		$("#spinner").hide();
		//enable the button  
		$("#importAcceptHTML").attr("disabled", false);
		$("#importModal").modal("hide");
    },
    //given the parser has html set tell it to parse
    parse:function(caret){
		this.contentView.resetNoConfirm(this.current);
		this.parser.parseContent();
		//get the returned title from the parser so we can use it in the export form if not importing caret content
		if(!caret){
			this.setTitle(this.parser.title);
		}
    },
    setTitle:function(title){
    	this.title = title;
    	//set the contentView's title (could be added to contentview as a function);
		this.contentView.setHeading(title);
    },
    //called for new system users, forced create
    newUserModal:function(model){
    	this.$el.find("#newUserModal").remove();
    	
    	this.$el.append(this.newUserTemplate());
    	$('#newUserModal').modal({
    		backdrop: 'static',
    		keyboard : false,
    	});
    },

    //called to create or edit
    contentModal:function(model){
    	this.editing = model;
    	this.$el.find("#contentModal").remove();
    	this.$el.append(this.contentTemplate(this.editing.toJSON()));
    	var $contentModal = $('#contentModal');
    	$contentModal.modal();
    	if(this.mode != "Create Content"){
        	this.$el.find(".cssChooser").val(this.contentView.typeName);
    	}
    	$contentModal.on('hidden.bs.modal', function () {
    		var form = $contentModal.find("#contentForm")[0]
    		if(form)form.reset();
    	});
    },
    //called when the export button is clicked
    exportModal:function(){
    	var that = this;
    	var book = this.bookDrop.getCurrent();
    	bootbox.confirm("Do you want to export the book '"+ book.get("title")+ "' to CampusReader." , function(result){
    		if(result){
    			that.exportContent(book);
    		}
    	})
    },
    importModal:function(){
    	this.$el.find("#importModal").remove();
    	this.$el.append(this.importTemplate());
    	var $importModal = $('#importModal');
    	this.$el.find(".cssChooser").val(this.contentView.typeName);
    	$importModal.modal();
    	$importModal.on('hidden.bs.modal', function () {
    		$importModal.find("#importForm")[0].reset();
    	})
    },
    logout:function(){
    	CRImport.logout();
    },
    render: function(){
    	this.$el.html(this.template());
        this.$el.find(".headerContainer").html(this.navView.render().el)
        this.$el.find("#center").html(this.contentView.render().el);
        this.$el.find("#bookDrop").append(this.bookDrop.render().el);
        this.$el.find("#right").html(this.tagSelectorView.render().el)
        this.$el.find("#left").html(CRImport.preview.render().el);
        this.rendered = true;
        var that = this;
        if(this.newUserFlag == true){
        	setTimeout(function(){that.newUser()},100);
        	this.newUserFlag = false;
        }
        return this;
    },
    importTemplate: _.template('\
		<div id="importModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="importHeader" aria-hidden="true">\
		  <div class="modal-header">\
		    <button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>\
		    <h3 id="importHeader">\
    			<span id ="importHeaderText">Import From URL </span>\
	    		<a id = "showFileUpload" style = "float:right;" class="btn btn-info" href="#">\
	            	<i class="icon-refresh icon"></i>&nbsp; Switch To File Upload\
	            </a>\
	    		<a style = "float:right; display:none;" id = "showUrlUpload" class="btn btn-info" href="#">\
	            	<i class="icon-refresh icon"></i> &nbsp; Switch To URL Upload\
	            </a>\
    		</h3>\
		  </div>\
		  <div style = "max-height:500px;" class="modal-body">\
		    <form id= "importForm" class="form-horizontal">\
			<fieldset>\
    		<div style = "display:none;" id = "fileUpload">\
	    		<div class="control-group">\
				    <label class="control-label" for="dropzone">Drop Files</label>\
				    <div class="controls">\
						<div id="dropzone"><span style = "position:relative; top:25%; font-size:13pt;">Drop Files or Folders Here</span></div>\
					</div>\
    			</div>\
    			<div class="control-group">\
		    		<div class="controls">\
					-- OR --\
					</div>\
				</div>\
		    	<div class="control-group">\
    				<label class="control-label" for="contentFiles">Select Files</label>\
				    <div class="controls">\
				    	<form id = "fileSelect" enctype="multipart/form-data">\
				    	    <input id= "contentFiles" name="file" type="file" />\
				    	</form>\
					</div>\
				</div>\
	    		<div class="control-group">\
		    		<div class="controls">\
					-- OR --\
					</div>\
				</div>\
		    	<div class="control-group">\
					<label class="control-label" for="htmlText">Paste HTML Text</label>\
				    <div class="controls">\
				    	<textarea id= "htmlText" placeholder="Paste Text Here" type="text" ></textarea>\
    					<input id= "htmlTextConfirm" type = "button" class = "btn btn-info" value="Add HTML">\
					</div>\
				</div>\
	    		<div class="control-group error">\
	    		 	<label disabled class="control-label">HTML</label>\
		    		<div style = "height:100%;" class="controls htmlArea">\
	    				<span id = "htmlPresent" class="help-inline">None</span>\
					</div>\
				</div>\
	    		<div class="control-group info">\
				 	<label disabled class="control-label">Images</label>\
		    		<div class="controls">\
						<span id = "numImages" class="help-inline">0</span>\
					</div>\
				</div>\
    		</div>\
    		<div id = "urlUpload">\
	    	  <div class="control-group">\
			    <label class="control-label" for="importURL">Input URL</label>\
			    <div class="controls">\
					<input id ="importURL" type = "text" class = "input-xlarge" placeholder = "Enter URL Here" required></li>\
			    </div>\
			  </div>\
	    	  <div class="control-group">\
	    		  <label class="control-label" for="cssChooser">Content Type</label>\
			    <div class="controls">\
		    		<select class="cssChooser selectpicker">\
						<option>Default</option>\
						<option>National Science Foundation</option>\
						<option>National Science Foundation(Science Nation)</option>\
						<option>National Science Foundation(Document)</option>\
						<option>New York Times</option>\
		    		</select>\
			    </div>\
			  </div>\
    		</div>\
    	    <div class="control-group">\
		      <label class="control-label" for="decription">Description</label>\
		      <div class="controls">\
		        <input type="text" class = "input-xlarge" id="description" placeholder="Enter Description(Optional)"  value = "<%=this.description%>">\
		      </div>\
		    </div>\
			</fieldset>\
		     </form>\
		  </div>\
		  <div class="modal-footer">\
		    <button id = "importAcceptHTML" class="btn btn-primary">Import Content</button>\
		    <button  id = "cancelImportContent" class="btn btn-danger" data-dismiss="modal" aria-hidden="true">Cancel</button>\
		  </div>\
		</div>'),
	contentTemplate: _.template('\
		<div id="contentModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
		  <div class="modal-header">\
		    <button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>\
		    <h3 id="myModalLabel"><%=this.mode%></h3>\
		  </div>\
		  <div class="modal-body">\
		    <form id= "exportForm" class="form-horizontal">\
			<fieldset>\
			  <div class="control-group">\
			    <label class="control-label" for="contentName">Content Name</label>\
			    <div class="controls">\
					<input class = "input-xlarge" type="text" id="contentName" placeholder="Enter Name" value = "<%=title%>" required>\
			    </div>\
			  </div>\
			  <div class="control-group">\
			    <label class="control-label" for="decription">Description</label>\
			    <div class="controls">\
			      <input type="text" class = "input-xlarge" id="description" placeholder="Enter Description"  value = "<%=description%>">\
			    </div>\
			  </div>\
	    	  <div class="control-group">\
	    		  <label class="control-label" for="type">Type</label>\
			    <div class="controls">\
	    		<div id="type" class="btn-group">\
					<select class="cssChooser selectpicker">\
						<option>Default</option>\
						<option>National Science Foundation</option>\
						<option>National Science Foundation(Science Nation)</option>\
						<option>National Science Foundation(Document)</option>\
						<option>New York Times</option>\
					</select>\
		  		</div>\
			    </div>\
			  </div>\
			</fieldset>\
		     </form>\
		  </div>\
		  <div class="modal-footer">\
			<%if (this.mode == "Create Content"){%> <button id = "createSwitchContent" class="btn btn-primary">Create and Edit</button>\<%}%>\
		    <button id = "saveContent" class="btn btn-success"><%=this.mode%></button>\
		    <button  id = "cancelSaveContent" class="btn btn-danger" data-dismiss="modal" aria-hidden="true">Cancel</button>\
		  </div>\
		</div>'),
	bookTemplate: _.template('\
		<div id="bookModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
		  <div class="modal-header">\
		    <button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>\
		    <h3 id="myModalLabel">Add Book</h3>\
		  </div>\
		  <div class="modal-body">\
		    <form id= "exportForm" class="form-horizontal">\
			<fieldset>\
			  <div class="control-group">\
			    <label class="control-label" for="bookName">Book Name</label>\
			    <div class="controls">\
					<input class = "input-xlarge" type="text" id="bookName" placeholder="Enter Name" required>\
			    </div>\
			  </div>\
			  <div class="control-group">\
			    <label class="control-label" for="decription">Description</label>\
			    <div class="controls">\
			      <input type="text" class = "input-xlarge" id="description" placeholder="Enter Description">\
			    </div>\
			  </div>\
			</fieldset>\
		     </form>\
		  </div>\
		  <div class="modal-footer">\
		    <button id = "saveBook" class="btn btn-primary">Create Book</button>\
		    <button  id = "cancelSaveBook" class="btn btn-danger" data-dismiss="modal" aria-hidden="true">Cancel</button>\
		  </div>\
		</div>'),
	newUserTemplate: _.template('\
		<div id="newUserModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
		  <div class="modal-header">\
		    <h3>Welcome To Caret!</h3>\
		  </div>\
		  <div class="modal-body">\
		    <form id= "exportForm" class="form-horizontal">\
		    <label>Enter information for your first book and chapter to start using Caret!</label>\
			<br>\
			<fieldset>\
			  <div class="control-group">\
			    <label class="control-label" for="bookName">Book Name</label>\
			    <div class="controls">\
					<input class = "input-xlarge" type="text" id="bookName" placeholder="Enter A Book Name" value = "" required>\
			    </div>\
			  </div>\
			  <div class="control-group">\
			    <label class="control-label" for="bookDecription">Book Description</label>\
			    <div class="controls">\
			      <input type="text" class = "input-xlarge" id="bookDecription" placeholder="Enter Description"  value = "">\
			    </div>\
			  </div>\
			  <div class="control-group">\
			    <label class="control-label" for="contentName">Content Name</label>\
			    <div class="controls">\
					<input class = "input-xlarge" type="text" id="contentName" placeholder="Enter Name" value = "" required>\
			    </div>\
			  </div>\
			  <div class="control-group">\
			    <label class="control-label" for="contentDecription">Content Description</label>\
			    <div class="controls">\
			      <input type="text" class = "input-xlarge" id="contentDecription" placeholder="Enter Description"  value = "">\
			    </div>\
			  </div>\
	    	  <div class="control-group">\
	    		  <label class="control-label" for="type">Type</label>\
			    <div class="controls">\
	    		<div id="type" class="btn-group">\
					<select class="cssChooser selectpicker">\
						<option>Default</option>\
						<option>National Science Foundation</option>\
						<option>National Science Foundation(Science Nation)</option>\
						<option>National Science Foundation(Document)</option>\
						<option>New York Times</option>\
					</select>\
		  		</div>\
			    </div>\
			  </div>\
			</fieldset>\
		     </form>\
		  </div>\
		  <div class="modal-footer">\
		    <a class="btn btn-success" style = "float:left;"  href = "/">Back to CampusReader</a>\
		    <button id = "newUser" class="btn btn-primary">Start Using Caret</button>\
		  </div>\
		</div>\
	'),
	exportTemplate: _.template('\
		<div id="exportModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
		  <div class="modal-header">\
		    <button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>\
		    <h3>Export Content</h3>\
		  </div>\
		  <div class="modal-body">\
		    <form id= "exportForm" class="form-inline">\
			<fieldset>\
			  <div class="control-group">\
			    <label class="control-label" for="exportContentName">Content Name:</label>\
			    <div class="controls">\
					<input class = "input-xlarge" type="text" id="exportContentName" placeholder="Enter Name" value = "<%=title%>" required>\
			    </div>\
			  </div>\
			  <div class="control-group">\
			    <label class="control-label" for="exportDecription">Description:</label>\
			    <div class="controls">\
			      <input type="text" class = "input-xlarge" id="exportDecription" placeholder="Enter Description"  value = "<%=description%>">\
			    </div>\
			  </div>\
			<div class="control-group">\
	  		  	<label class="control-label" for="cssChooser">Content Type</label>\
			    <div class="controls">\
		    		<select class="selectpicker">\
						<option>Default</option>\
						<option>National Science Foundation</option>\
						<option>National Science Foundation(Science Nation)</option>\
						<option>National Science Foundation(Document)</option>\
						<option>New York Times</option>\
		    		</select>\
			    </div>\
		  </div>\
			</fieldset>\
		     </form>\
		  </div>\
		  <div class="modal-footer">\
		    <button id = "exportContent" class="btn btn-primary">Export Content</button>\
		    <button  id = "cancelSaveContent" class="btn btn-danger" data-dismiss="modal" aria-hidden="true">Cancel</button>\
		  </div>\
		</div>\
	'),
    template : _.template('\
    	<div id ="spinner">\
    		<div id ="spinnerIcon" >\
    			<i class="icon-refresh icon-spin icon-4x"></i>\
    		</div>\
    		<div id = "label">Parsing Content...</div>\
    		<div id ="spinnerContainer"></div>\
    	</div>\
        <div id="header">\
            <div class="navbar">\
                <div id = "navbarContainer"class="headerContainer navbar-inner">\
                </div>\
            </div>\
        </div>\
        <div id="mainContainer">\
            <div id="center" class="column">\
            </div>\
            <div id="right" class="column">\
            </div>\
        </div>\
        <div class = "navbar" id="footer">\
            <div id = "navbarContainer"class="navbar-inner">\
            </div>\
        </div>\
    '),

});