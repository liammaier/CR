
var EditorView = Backbone.View.extend({
    className: "editor",
    collection:TagTypeCollection,
    initialize: function(){    	
    	this.editorNum = CRImport.numEditors++;
    	this.html = "";
    	this.tags = new SemanticTagCollection();
        this.undelegateEvents();
        this.delegateEvents();
    },
    events:{
    	"deleteEnable" :"deleteEnable",
    },
    render: function(){
    	this.$el.html(this.template());
        return this;
    },
    getHTML:function(){
    	if(this.editor != null){
    		try{
    			this.tags.each(function(tag){
    				tag.removeTag();
    			});
    			
    			this.html = this.editor.getData();
    		}catch(e){
    			
    		}
    	}
    	return this.html;
    },
    //when the html of the editor is set put in the tags
    setHTML:function(text){
    	var that = this;
    	
    	this.editor.setData(text);
    	this.tags.each(function(tag){
    		tag.root = this.editor.document;
			tag.showHighlight();
		});
    },
    disable:function(){
//    	if(this.$el.data("wysihtml5") != null){
//    		this.$el.data("wysihtml5").editor.fire("change_view","textarea");
//    	}
//    	this.destroyView();
//this.el.parentNode.removeChild(this.$el.data("wysihtml5").editor.composer.iframe);
    },
    enable:function(){
    	
    },
    //called when new tag is added
    newTag:function(event){
    	this.addModal.modal("hide");
    	var name = $("#tagName").val();
    	_.each(CKEDITOR.instances,function(editor){
    		this.addTagToMenu(editor,name);
    	},this)
    },
    //new tag modal
    addNewModal:function(editor){
    	if( $("#newTagModal").length == 0 ){
    		$("body").append(this.newTagTemplate());

        	var that = this;
        	$("#newTagModal").find(".addTag").click(function(){
        		that.newTag();
        	});
    	}
    	//clear out the tagName
    	$("#newTagModal #tagName").val("");
    	this.addModal = $("#newTagModal").modal();

    },
    checkDeleteEnabled:function(element, selection){
    	var $startCont = $(selection.getRanges()[0].startContainer);
    	var wrapper = $startCont.parents("[data-wrapper]")
    	var name = $startCont.parents("[data-tagname]")
    	var group = $startCont.parents("[data-taggroup]")
    	if(wrapper.length != 0){
    		this.tags.removeTag(wrapper.data("wrapper"))
    	}else if(name.length != 0){
    		this.tags.removeTag(wrapper.data("tagname"))
    	}else if(group.length != 0){
    		this.tags.removeTag(wrapper.data("taggroup"))
    	}
    },
    deleteEnable:function(tag){
    	var that = this;
    	//always add the command to add new tags
		editor.addCommand("delete", {
			exec : function( editor ) {
				tag.removeTag();
		    }
		});
		editor.contextMenu.addListener( function( element, selection ) {
		   var item = {}
		   item[tagName] = CKEDITOR.TRISTATE_OFF;
		   return item;
		});
		var item = {
	      label : "delete",
	      command : "delete",
	      group : 'image',
	      order : 1
		}
		CRImport.menuTags.add(item);
		editor.addMenuItem(tagName,item);
    },
    clickTag:function(tagName){
		var range = this.editor.getSelection().getRanges()[0];
		//set the root of the highlight as it is in a an iframe
		
		this.tags.addTag(range,this.editor.document.$,tagName);
    },
    //static function
    addTagToMenu:function(editor,tagName){
    	
    	var that = this;
    	//always add the command to add new tags
		editor.addCommand(tagName, {
			exec : function( editor ) {
				that.clickTag(this.name);
		    }
		});
		editor.contextMenu.addListener(function( element, selection ) {
			var item = {}
			item[tagName] = CKEDITOR.TRISTATE_OFF;
			return item;
		});
		var item = {
	      label : tagName,
	      command : tagName,
	      group : 'image',
	      order : 1
		}
		CRImport.menuTags.add(item);
		editor.addMenuItem(tagName,item);
    },
    initTags:function(){
    	//find all of the tags that are in the html
    	
    	//then save them for use in the editor
    	//this.tags.addTag(range,this.editor.document.$,tagName);
    },
    initMenuItems:function(items){
    	var that = this;
    	_.each(items,function(item){
    		var tagName = item.label
    		
        	//always add the command to add new tags
    		that.editor.addCommand(tagName, {
    			exec : function( editor ) {
    				that.clickTag(this.name);
    		    }
    		});
    		that.editor.contextMenu.addListener( function( element, selection ) {
    		   var item = {}
    		   item[tagName] = CKEDITOR.TRISTATE_OFF;
    		   return item;
    		});
    		that.editor.addMenuItem(tagName,item);
    	})
    },
    initEditor:function(text,callback){
    	//hack to fix hashes bug for the editor
    	window.location.replace("#");

    	// slice off the remaining '#' in HTML5:    
    	if (typeof window.history.replaceState == 'function') {
    	  history.replaceState({}, '', window.location.href.slice(0, -1));
    	}
    	
    	this.$el.find("textarea").html(text);
    	
    	var name = "editor" + this.editorNum;
    	
    	var that = this;
    	var init = function(){
      		that.editor = CKEDITOR.replace( name,{
				height: 100,
				toolbar:[
					{ name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
					{ name: 'editing', items : [ 'Find','-','Scayt' ] },
					{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
					{ name: 'colors', items : [ 'TextColor','BGColor' ] },
					{ name: 'styles', items : [ 'Styles',"Font", "FontSize" ] },
					{ name: 'insert', items : [ 'Table','HorizontalRule','SpecialChar', 'Image' ] },
					{ name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote' ] },
					{ name: 'links', items : [ 'Link','Unlink','Anchor' ] },
					{ name: 'tools', items : [ 'Maximize'] }
				]
			});
			
			that.editor.on( 'instanceReady', function(e) { 
    			that.editor.on('change', function(){
        			CRImport.events.trigger("markupDirty",true);
        		});
    			//always add the command to add new tags
        		that.editor.addCommand("newTag", {
    		      exec : function( editor ) {
    		    	  that.addNewModal(editor)
    		      }
        		});
        		that.editor.contextMenu.addListener( function( element, selection ) {
        			that.checkDeleteEnabled(element, selection);
        			
        			return { 
        				myCommand : CKEDITOR.TRISTATE_OFF 
        			};
    			});
        		that.editor.addMenuItems({
     			   myCommand : {
     			      label : "New Tag Type",
     			      command : 'newTag',
     			      group : 'image',
     			      order : 1
     			   }
     			});
        		that.initMenuItems(CRImport.menuTags.getItems());
    		});
    	}
    	
    	try{
    		
    	init()
    	}catch(e){
//	    	var tryEditor = setInterval(function(){
//		    	try{
//		    		init()
//		    		clearInterval(tryEditor);
//		    	}catch(e){
//		    		
//	    		}
//	    	},100)
    	}
    	
    },
    template : _.template('\
    	<textarea name = "editor<%=this.editorNum%>"></textarea>\
    '),
    newTagTemplate: _.template('<!-- Button to trigger modal -->\
		<div id="newTagModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\
    		<div class="modal-header">\
		    	<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>\
		    	<h3 id="myModalLabel">Add New Tag</h3>\
    		</div>\
    		<div class="modal-body">\
	    	  <form id= "exportForm" class="form-horizontal">\
				<fieldset>\
				  <div class="control-group">\
				    <label class="control-label" for="tagName">Tag Name</label>\
				    <div class="controls">\
						<input class = "input-xlarge" type="text" id="tagName" placeholder="Enter Tag Name" required>\
				    </div>\
				  </div>\
	    		</fieldset>\
	    	  </form>\
    		</div>\
		  <div class="modal-footer">\
		    <button class="btn btn-primary addTag">Add</button>\
		    <button class="btn cancelAddTag" data-dismiss="modal" aria-hidden="true">Cancel</button>\
		  </div>\
		</div>\
   ')
});
