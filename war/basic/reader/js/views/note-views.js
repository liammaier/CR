var NoteView = Backbone.View.extend({

	model: Note,
	tagName: "div",
	className: "noteview",

	events: {
		 "click .notecontent"  	: "edit",
		 "keypress .noteedit"  	: "updateOnEnter",
		 "blur .noteedit"      	: "close",
		 "click .garbageIcon"	: "clear",
		 "addChecks"            : "addCheckBox",
		 "removeChecks"         : "removeCheckBox",
		 "notebookClear"		: "clear",
	},
	
	template: _.template("<% if(reviewed) { %> <img src='/images/check_icon.png' class='checkIcon' id='checkIcon'/> <% } %>"+
						"<div class='note'>" +
							"<div class='noteBullet'></div>" +
							"<img class='garbageIcon' src='/images/garbagecan_icon.png'/>" +
							"<div class='notecontent <% if(instructor){%> instructor <%}%>'>" +
								"<%= contents %> <img class='pencilpic' src='/images/pencil_icon.png'/>" +
							"</div>" +
							"<input class='noteedit' value='<%= contents %>' hidden/>" +
						"</div>"),
						
	initialize: function(){
		this.model.bind("change", this.render, this);
		this.model.bind('destroy', this.remove, this);
	},
	
	edit: function() {
		this.$el.find(".notecontent").hide();
		
		// If there are single quotes in the contents, they need to become \' to render properly
		var fixedcontents = "";
		var contents = this.model.get("contents");
		for(var i = 0; i < contents.length; i++){
			var c = contents.charAt(i);
			if(c == '\''){
				// Append a \' to the string
				fixedcontents = fixedcontents + "\'";
			}else {
				fixedcontents = fixedcontents + c;
			}
		}
		this.$el.find(".noteedit").val(fixedcontents);
		
		this.$el.find(".noteedit").show();
		this.$el.find(".noteedit").focus();
	},
	
	addCheckBox: function(){
		if(!this.model.get("reviewed") && !this.model.get("instructor"))(this.$el).append("<input type='checkbox' class='highlightBox' name='highlight'/>");
	},
	
	removeCheckBox: function(){
		this.model.save({"reviewed":true});
		(this.$el).children(".highlightBox").remove();
		this.render();
	},
	
	close: function() {
        var value = this.$el.find(".noteedit").val();
        if (!value){
        	this.clear();
        }else{
        	this.model.save({"contents": value});
        }
        
        // Switch views
        this.$el.find(".noteedit").hide();
        this.$el.find(".notecontent").show();
    },
	
	updateOnEnter: function(e) {
        if (e.keyCode == 13){
        	this.close();
        }else {
        	if(String.fromCharCode(e.which) == '>' || String.fromCharCode(e.which) == '<'){
        		e.preventDefault();
        	}
        }
    },

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	clear: function() {
		this.model.clear();
	},

});

var ListTitleView = Backbone.View.extend({
	model: Note,
	tagName: "div",
	className: "listtitle",

	events: {
		 "click .listtitle-content" : "edit",
		 "keypress .listtitle-edit" : "updateOnEnter",
		 "blur .listtitle-edit"  	: "close",
	},
	
	template: _.template("<div class='listtitle-content'><%= contents %> <img class='pencilpic' src='/images/pencil_icon.png'/></div>" +
							"<input class='listtitle-edit' placeholder='Enter title of list here' value='<%= contents %>' hidden/>"),
						
	initialize: function(){
		this.model.bind("change", this.render, this);
		this.model.bind('destroy', this.remove, this);
	},
	
	edit: function() {
		this.$el.find(".listtitle-content").hide();
		
		// If there are single quotes in the contents, they need to become \' to render properly
		var fixedcontents = "";
		var contents = this.model.get("contents");
		for(var i = 0; i < contents.length; i++){
			var c = contents.charAt(i);
			if(c == '\''){
				// Append a \' to the string
				fixedcontents = fixedcontents + "\'";
			}else {
				fixedcontents = fixedcontents + c;
			}
		}
		this.$el.find(".listtitle-edit").val(fixedcontents);
		
		this.$el.find(".listtitle-edit").show();
		this.$el.find(".listtitle-edit").focus();
	},
	
	close: function() {
        var value = this.$el.find(".listtitle-edit").val();
        if (!value){
        	
        	this.model.save({"contents": ""});
        }else {
        	// Switch views
        	this.model.save({"contents": value});
        	this.$el.find(".listtitle-edit").hide();
            this.$el.find(".listtitle-content").show();
        }
        
    },
	
	updateOnEnter: function(e) {
		if (e.keyCode == 13){
        	this.close();
        }else {
        	if(String.fromCharCode(e.which) == '>' || String.fromCharCode(e.which) == '<'){
        		e.preventDefault();
        	}
        }
    },

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		if(this.model.get("contents") == ""){
			this.edit();
		}
		return this;
	},

});


var SectionSummaryView = Backbone.View.extend({

	model: Note,
	tagName: "textarea",
	className: "sectionSummaryTextbox",
	caretPosition: 0,

	events: {
		"focus"   	: "focusIn",
		"change" 	: "change",
		"blur"   	: "focusOut",
		"mouseup"	: "setCaret",
		"keyup"		: "setCaret",
	},
	
	template: _.template("<%= contents %>"),

	initialize: function(){
		this.model.bind("change", this.render, this);
	},
	
	setCaret: function() {
		var el = this.el
		
		if (el.selectionStart) {
			caretPosition = el.selectionStart;
			$(this.el).attr('data-caretPos', caretPosition)
			return;
		} else if (document.selection) {
			el.focus();
	
			var r = document.selection.createRange();
			if (r == null) {
				caretPosition = 0;
				$(this.el).attr('data-caretPos', caretPosition)
				return;
			}
	
			var re = el.createTextRange(),
	        	rc = re.duplicate();
			re.moveToBookmark(r.getBookmark());
			rc.setEndPoint('EndToStart', re);
	
			caretPosition = rc.text.length;
			$(this.el).attr('data-caretPos', caretPosition)
			return;
		} 
		caretPosition = 0;
		$(this.el).attr('data-caretPos', caretPosition)
		return;
	},
	
	change: function(){
		var value = this.$el.val();
		//log("Section Summary Changed", value);
	},
	
	focusIn: function() {
//		removeFlashingArrow();
//		$("#secSummary").popover('hide');
	},
	
	//save the value to the server
	focusOut: function() {
        var value = this.$el.val();
        console.log("SAVING:::"+value)
        if (!value){
        	value = "";
        }
        this.model.save({"contents": value});
    },
    
	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

});


var BlankNoteView = Backbone.View.extend({

	model: Note,
	tagName: "div",
	className: "addNoteBar",

	events: {
		 "keypress .noteedit"  : "updateOnEnter",
		 "blur .noteedit"      : "create",
	},
	
	template: _.template("<div class='note'><div class='noteBullet'></div>" +
						 "<input class='noteedit newnote' placeholder='Add a list item'/><%= contents %></div>"),
	
	create: function() {
        var value = this.$el.find(".noteedit").val();
        if (!value){ return; }
        this.$el.find(".noteedit").val("");
        // Save the model
        this.trigger("addNote", value);
    },
	
	updateOnEnter: function(e) {
		if (e.keyCode == 13){
        	this.create();
        }else {
        	if(String.fromCharCode(e.which) == '>' || String.fromCharCode(e.which) == '<'){
        		e.preventDefault();
        	}
        }
    },

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.find('.note').width($("#notesColumn").width() - 8);
		return this;
	},

});


// Collection views
var NoteCollectionView = Backbone.View.extend({
	
	collection: NoteCollection,
	className: "noteCollection sidebar-content",
	
	initialize: function() {
		this.collection.bind("add", this.render, this);
		this.collection.bind("reset", this.reset, this);
		this.collection.bind("remove", this.removed, this);
	},
	
	render: function(){
		//header, if there are any notes
		if(this.collection.length > 0){
			this.$el.html("<div class='noteArea'></div>");
		}
		// Title for the list
		var listTitleView = new ListTitleView({model: CR.listTitles[this.collection.sectionNum]});
		this.$el.prepend(listTitleView.render().el);
		
		//add all the notes
		this.collection.forEach(this.addOne, this);
		
		//footer
		var i = this.collection.length;
		do {
			this.addBlankNote();
			i++;
		} while(i < 3);
		
		$('#ltTabNum' + this.options.section).html(" ("+this.collection.length+")");
		return this;
	},
	
	newNote: function(val) {
		this.collection.create({sectionID: this.collection.sectionID, contents: val, type: this.collection.type });
		this.$el.find(".newnote:first").focus();
	},
	
	addBlankNote: function() {
		var m = new Note({ contents: "" });
		var mview = new BlankNoteView({ model: m });
		mview.bind("addNote", this.newNote, this);
		this.$el.append(mview.render().el);
	},
	
	addCheckBox:function(){
		this.collection.forEach(addCheckBox, this);
	},
	
	reset: function(){
		this.$el.html("");
		this.render();
	},
	
	addOne: function(m){
		if(m.get("contents") != "null" && m.get("contents") != ""){
			var gv = new NoteView({model: m});
			gv.render();
			this.$el.find(".noteArea").append(gv.el);
		}
	},
	
	removed: function() {
		// If we have reduced the number of notes to less than 2, we need to add another blank note view
		if(this.collection.length < 2){		
			this.addBlankNote();	
			if(this.collection.length == 0){
				this.$el.find(".noteArea").remove();
			}
		}
		
		$('#ltTabNum' + this.options.section).html(" ("+this.collection.length+")");
	},
	
	remove: function(){
		this.$el.remove();
	}
	
});
