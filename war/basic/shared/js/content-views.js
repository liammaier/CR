var ContentView = Backbone.View.extend({

	model: Content,
	tagName: "div",
	className: "content",

	events: {
		// Put events here
	},

	template: _.template("<img class='contentpic inline' src='/images/chapter.png'/>" +
			"<div class='rightBtnPanel'>" +
				"<input type='button' data-resource='<%= id %>' class='btn btn-large btn-primary goBtn' value='Read'/>" +
			"</div>" +
			"<div class='chapDesc'><h2><%= title %></h2><div class='contentDesc'><%= description %></div></div>" + 
			"<div class='userStats'>" +
				"<div class='userStats-left'>" +
					"<span class='pages'><span class='pages-read'>0</span>/<%= numPages %> Pages</span><br>" +
					"<span class='sections'><span class='sections-read'>0</span>/<%= numSections %> Sections</span>" +
				"</div>" +	
				"<div class='userStats-right'>" +	
					"<span class='notes'><span class='notes-taken'>0</span> Notes</span><br>" +
					"<span class='highlights'><span class='highlights-made'>0</span> Highlights</span>" +
				"</div>" +	
			"</div>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		if(this.type == "article"){
			this.$el.find(".chapterpic").attr("src", "/images/article.png")
		}
		this.$el.find(".goBtn").click(function(e) {
			window.location.href = "/reader?lib=" + getURLParameter("lib") + "&c=" + $(e.target).data("resource");
		});
		
		// get the stats
		var that = this;
		$.get("/getuserprogress",{contentid: this.model.get("id")}, function(data){
			if (data != null){
				that.$el.find(".pages-read").text(data.pagesRead.length);
				that.$el.find(".sections-read").text(data.sectionsRead.length);
				that.$el.find(".notes-taken").text(data.notesTaken);
				that.$el.find(".highlights-made").text(data.highlightsMade);
			}
		});
		
		// log what htey click
		this.$el.find(".goBtn").click(function(){
			$.post("/log", {type: "readcontent", strategy: "menus", contentkey: that.model.get("id"), sectionkey: "", data1: that.model.get("title"), data2: ""});
		});
		
	},

	remove: function(){
		this.$el.remove();
	},

});


var ContentCollectionView = Backbone.View.extend({

	tagName: "div",
	el: "#chapterContainer",
	
	collection: ContentCollection,

	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.collection.forEach(this.addOne, this);
	},

	addOne: function(m){
		var gv = new ContentView({model: m});
		gv.render();
		this.$el.append(gv.el);
	},
});

// SUPERNOTEBOOK

var SuperNotebookContentView = Backbone.View.extend({

	model: Content,
	tagName: "div",
	className: "content",

	events: {
		"click": "showSections",
		"click input": "clickReview",
	},

	checkedTemplate: _.template("<input type='checkbox' checked>"+
							"<span><%= title %></span>"),
	uncheckedTemplate: _.template("<input type='checkbox'>"+
							"<span><%= title %></span>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},
	
	showSections: function(target){
		var $target = $(target.currentTarget);
		
		// only pop if it's not already selected
		if (!$target.hasClass("selected")) {

			var sectionCollectionView = new SuperNotebookSectionCollectionView({ collection: this.model.get("sections") }),
				$sections = $("#sections");
			sectionCollectionView.render();
			
			// remove the sections if they are visible
			if ($sections.is(":visible")){
				
				$sections.toggle("slide", function(){
					$(".content").removeClass("selected");
					$sections.html(sectionCollectionView.el);
					$sections.toggle("slide");
					$target.addClass("selected");
				});
				
			} else {
				// show chapters
				$sections.html(sectionCollectionView.el);
				$sections.toggle("slide");
				$target.addClass("selected");
			}
			
		}
	},
	
	clickReview: function() {
		if (this.model.get("toReview") === "all"){
			this.model.changeReview("none", true);
		} else {
			// some and none go to all
			this.model.changeReview("all", true);
		}
	},


	render: function(){
		// if it's been clicked already then use clicked template
		if (this.model.get("toReview") === "all") {
			this.$el.html(this.checkedTemplate(this.model.toJSON()));
		} else if (this.model.get("toReview") === "none") {
			this.$el.html(this.uncheckedTemplate(this.model.toJSON()));
		} else {
			this.$el.html(this.uncheckedTemplate(this.model.toJSON()));
			this.$el.find("input").prop("indeterminate", true);
		}
	},

	remove: function(){
		this.$el.remove();
	},

});

var SuperNotebookContentCollectionView = Backbone.View.extend({

	collection: ContentCollection,

	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.collection.forEach(this.addOne, this);
	},

	addOne: function(m){
		var gv = new SuperNotebookContentView({model: m});
		gv.render();
		this.$el.append(gv.el);
	},
});