//view for the TOC in the reader
var SectionView = Backbone.View.extend({

	model: Section,
	tagName: "li",
	className: "sidebarTOCelement",
	
	events: {
		"click"    : "changeSection",
	},
	initialize: function(){
		this.model.on("change", this.checkCurrent, this);
	},
	template: _.template("<%= name %>"),
	changeSection: function(e) {
		CR.events.trigger("changeTheSection",this.model.get("number"));
	},
	render: function(){
		if(this.model.get("highlighted")) {
			this.$el.addClass("highlighted");
		}else{
			this.$el.removeClass("highlighted");
		}
		if(this.model.get("subsection")){
			this.$el.addClass("tabbed");
		}else {
			this.$el.removeClass("tabbed");
		}
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	checkCurrent: function(){
		if(this.model.get("highlighted")) {
			this.$el.addClass("highlighted");
		}else{
			this.$el.removeClass("highlighted");
		}		
	},

	remove: function(){
		this.$el.remove();
	},

});
//collection for above view
var SectionCollectionView = Backbone.View.extend({
	id: "tocContainer",
	class: "sidebar-block",
	tagName: "div",
	highlighted: 0,
	collection: SectionCollection,
	template: _.template('\
		<div id="toc-scroll" class="rightScrollbar block-content">\
			<ul id="TOC"></ul>\
		</div>\
		<div id="hider" style="display: none;"></div>\
		<div id="TOC-title" class="sidebar-title"><%= CR.content.title %></div>'),
	initialize: function() {
		this.collection.on("add", this.addOne, this);
		//this.collection.on("change", this.render, this);
		CR.events.bind("SectionHasChanged",this.sectionChanged,this);
	},
	render: function(){
		this.$el.html(this.template())
		var $sectionList = this.$el.find("#TOC");
		this.collection.forEach(function(m){
			var gv = new SectionView({model: m});
			gv.render();
			$sectionList.append(gv.el);
		}, this);
		return this;
	},
	
	sectionChanged:function(sectionNumber){   
		this.collection.at(this.highlighted).set("highlighted", false);
		this.collection.at(sectionNumber).set("highlighted", true);
		this.highlighted = sectionNumber;
		CR.curSection = sectionNumber; 
		CR.log("changesection", "read", CR.contentID, CR.getCurrentSection().id, sectionNumber , "");
		CR.updateUserProgress("section", sectionNumber);
	},
	
});
//view for the TOC in the notebook
var SectionNotebookTOCView = Backbone.View.extend({
	model: Section,
	tagName: "li",
	className: "notebookTOCelement",
	events: {
		"click" : "changeNotebookSection",
	},
	//change here to add checkmarks (look at highlights and sections summaries)
	template: _.template("<%= name %>\
		<% if(summary) { %> <img src='/images/check_icon.png' class='checkIconTOC' id='checkIcon\
		<%= number %>\
 		'> <% } %>\
	"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},
	
	changeNotebookSection: function(e) {
		// log("Click","Change Notebook Section to "+this.model.get("name"));
		CR.curNotebookSection = parseInt(this.model.get("number"));
		CR.events.trigger("changeNotebookSection");
	},

	render: function(){
		var id = this.el.id.replace("sectionNotebook","");
		
		//highlight current section
		if(this.model.get("highlighted")) {
			this.$el.addClass("highlighted");
		}else {
			this.$el.removeClass("highlighted");
		}
		
		//tab subsections
		if(this.model.get("subsection")){
			this.$el.addClass("tabbed");
		}else {
			this.$el.removeClass("tabbed");
		}
		
		// bold it if there is a highlight in it
		if (CR.highlights[this.model.get("number")].length > 0) {
			this.$el.addClass("hasHighlight")
		}

		this.$el.html(this.template(this.model.toJSON()));
		
		return this;
	},

	remove: function(){
		this.$el.remove();
	},

});
//collection for above view
var SectionNotebookTOCCollectionView = Backbone.View.extend({
	el: "#notebookTOC",
	tagName: "div",
	highlighted: 0,
	collection: SectionCollection,
	initialize: function() {
		this.collection.on("add", this.addOne, this);
		// Change to current section when notebook is opened
		CR.events.bind("changeNotebookSection", $.proxy(this.highlightCurrent, this));
	},
	highlight: function(num) {
		this.collection.at(this.highlighted).set("highlighted", false);
		this.collection.at(num).set("highlighted", true);
		this.highlighted = num;
	},
	highlightCurrent: function() {
		this.highlight(CR.curNotebookSection);
	},
	uncheck: function(num){
		this.collection.at(num).set("summary", false);
	},
	check: function(num){
		this.collection.at(num).set("summary", true);
	},
	render: function(){
		this.$el.html("<div id='note-hider' style='display:none'></div><div class='tocNotebookTitle'><b>Table Of Contents</b></div>");
		this.collection.forEach(this.addOne, this);
		return this;
	},
	addOne: function(m){
		var gv = new SectionNotebookTOCView({model: m, id: "sectionNotebook" + m.get("number")});
		gv.render();
		this.$el.append(gv.el);
	},
});

//view for the notebook that shows the user some or all of highlights, notes, and summaries
var SectionNotebookView = Backbone.View.extend({

	model: Section,
	tagName: "div",
	className: "notebookSubsection",
	events: {
		"click .collapseIcon" : "toggleExpand",
	},
	initialize: function(){
		this.model.on("change", this.render, this);
		//add notes if the options says they are enabled
		
		this.noteCollectionView = new NoteCollectionView({collection: CR.notes[this.model.get("number")]});
		this.noteCollectionView.render();
		$(this.$el.find(".subsectionNotes")).html(this.noteCollectionView.render().el);
		
		this.sectionSummaryView = new SectionSummaryView({ model: CR.summaries[this.model.get("number")] });
		this.sectionSummaryView.render();
		$(this.$el.find(".subsectionHighlights")).html(this.sectionSummaryView.render().el);
		
	},
	template: _.template("" +
		"<div class='subsectionBar' id = 'sectionBar" +
			 "<%= number %>" +
			 "'>" +
		 	"<div class='subsectionTitle'>" +						 	
		 	"<%=this.getParentName()%> <%= name %>" +
//						 		"<img src='/images/note_icon.jpeg' class='noteIcon' style='opacity: .2' id='noteIcon'>" +
//						 		"<img src='/images/highlight_icon.jpeg' class='highlightIcon' style='opacity: .2' id='highlightIcon'>" +
//						 		"<img src='/images/summary_icon.gif' class='summaryIcon' style='opacity: .2'>" +					 		
		 		"<img class='collapseIcon' src='/images/circleminus.png'/>" +
		 	"</div>" +
		 "</div>" + 
		 "<div class='subsectionBody'>" + 
		 	"<div class='subsectionLeftColumn'>" +
		 		"<center class='subsection-header'>Highlights</center>" +
		 		"<div class='subsectionHighlights' ></div>" +
		 	"</div>" +
		 	"<div class='subsectionRightColumn'>" +
	 			"<center class='subsection-header'>Notes</center>" +
	 			"<div class='subsectionNotes' ></div>" +
		 	"</div>" +						 	
		 	"<div class='subsectionSummary'><center class='subsection-header'>Summary</center></div>" +
		 	"</div>" +
		 "</div>"),
	getParentName: function(){
		var sectionNum = this.model.get("number")
		var parent = findParentSection(sectionNum);
		if(parent != sectionNum){
			return parentSection =	sectionCollection.at(parent).get("name") +":";
		}else{
			return "";
		}
	},

	toggleExpand: function(e) {
		console.log("expand")
		if(this.$el.find(".subsectionBody").is(":visible")){
			$(e.target).attr("src", "/images/circleplus.png");
		}else {
			$(e.target).attr("src", "/images/circleminus.png");
		}
		this.$el.find(".subsectionBody").slideToggle("fast");
	},
	
	render: function(){
		
		this.$el.html(this.template(this.model.toJSON()));
		
		if(this.model.get("hasCheck")){
			this.$el.addClass("subSectionTabbed");
		}else{
			this.$el.removeClass("subSectionTabbed");
		}
		if(this.model.get("subsection")){
			this.$el.addClass("subSectionTabbed");
		}else{
			this.$el.removeClass("subSectionTabbed");
		}
		return this;
	},

	remove: function(){
		this.$el.remove();
	},

});
//collection for above view
var SectionNotebookCollectionView = Backbone.View.extend({

	tagName: "div",
	highlighted: 0,
	className: "subsections",
	collection: SectionCollection,
	
	initialize: function() {
		this.collection.on("add", this.addOne, this);
		this.collection.on("change", this.render, this);
	},
	
	render: function(){
		this.$el.html("");
		this.collection.forEach(this.addOne, this);
		return this;
	},

	addOne: function(m){
		var gv = new SectionNotebookView({ model: m});
		gv.render();
		this.$el.append(gv.el);
	},


});


// SUPERNOTEBOOK

var SuperNotebookSectionView = Backbone.View.extend({

	model: Section,
	tagName: "div",
	className: "section",

	events: {
		"click input": "clickReview",
	},

	checkedTemplate: _.template("<input type='checkbox' checked>"+
							"<span><%= name %></span>"),
	uncheckedTemplate: _.template("<input type='checkbox'>"+
							"<span><%= name %></span>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},

	render: function(){
		// if it's been clicked already then use clicked template
		if (this.model.get("toReview") === "all") {
			this.$el.html(this.checkedTemplate(this.model.toJSON()));
		} else {
			this.$el.html(this.uncheckedTemplate(this.model.toJSON()));
		}
		
	},
	
	clickReview: function() {
		if (this.model.get("toReview") === "all"){
			this.model.changeReview("none");
		} else {
			this.model.changeReview("all");
		}
	},

	remove: function(){
		this.$el.remove();
	},

});

var SuperNotebookSectionCollectionView = Backbone.View.extend({

	collection: SectionCollection,

	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.collection.forEach(this.addOne, this);
	},

	addOne: function(m){
		var gv = new SuperNotebookSectionView({model: m});
		gv.render();
		this.$el.append(gv.el);
	},
});
