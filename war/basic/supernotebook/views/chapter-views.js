
var ChapterView = Backbone.View.extend({

	model: Content,
	tagName: "div",
	className: "",
	
	events: {
		"click .btn-open": "chapterSlidedown",
		"click .btn-collapseall": "collapseAll",
		"click .leftoff": "expandAll",
		"click .selecthighlights": "expandHighlights",
		"click .selectlist": "expandList",
		"click .selectconfusing": "expandConfusing",
	},
	
	template: _.template('\
			<div class="chapterbar">\
				<div class="chapterbar-book"><%= resource %></div>\
				<div class="chapterbar-chapter"><%= title %></div>\
				<div class="chapterbar-toolbar">\
					<input type="button" class="btn btn-chapterbar btn-collapseall" value="Collapse All"/>\
					<div class="dropdown">\
						<input type="button" class="btn btn-chapterbar btn-expandall dropdown-toggle" data-toggle="dropdown" value="Expand All"/>\
						<ul class="dropdown-menu pull-right" role="menu" aria-labelledby="dLabel">\
					    	<li><a role="menuitem" class="leftoff" href="#">Where I left off</a></li>\
					    	<li class="divider"></li>\
					    	<li><a role="menuitem" class="selecthighlights" href="#">Highlights</a></li>\
					    	<li><a role="menuitem" class="selectlist" href="#">List</a></li>\
					    	<li><a role="menuitem" class="selectconfusing" href="#">Confusing Concepts</a></li>\
						</ul>\
					</div>\
					<img class="btn-open" src="/images/arrow-dropdown.png">\
				</div>\
			</div>\
			<div class="chapter-slidedown"></div>\
			'),
	
	chapterSlidedown: function() {
		this.$el.find(".btn-open").toggleClass("active");
		this.$el.find(".chapter-slidedown").slideToggle("fast");
	},
	
	// If not currently expanded, expand the chapter
	expandChapter: function(menuitem){
		var $chapslide = this.$el.find(".chapter-slidedown");
		if($chapslide.css('display') == "none"){
			this.$el.find(".btn-open").click();
		}
	},
	
	collapseAll: function(){
		// If not currently collapsed, collapse the chapter
		var $chapslide = this.$el.find(".chapter-slidedown");
		if($chapslide.css('display') != "none"){
			this.$el.find(".btn-open").click();
		}
		
		// Now collapse all the children
		this.$el.find(".chapter-slidedown").children(".section-slidedown").slideUp("fast");
	},
	
	
	// Expand All buttons
	
		expandAll: function(){
			this.expandChapter();
			// Now expand all the children
			this.$el.find(".section-slidedown").slideDown("fast");
		},
		
		expandHighlights: function(){
			var $sections = this.$el.find(".section-slidedown");
			this.expandChapter();
			// Select highlights on all sections
			$sections.find(".highlights-btn").click();
			// Expand all the children
			$sections.slideDown("fast");
		},
		
		expandList: function(){
			var $sections = this.$el.find(".section-slidedown");
			this.expandChapter();
			// Select highlights on all sections
			$sections.find(".list-btn").click();
			// Expand all the children
			$sections.slideDown("fast");
		},
		
		expandConfusing: function(){
			var $sections = this.$el.find(".section-slidedown");
			this.expandChapter();
			// Select highlights on all sections
			$sections.find(".confusing-btn").click();
			// Expand all the children
			$sections.slideDown("fast");
		},
		
	// END buttons
	
	
	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		// Now take care of the sections
		var sectionCollectionView = new SectionCollectionViewSN({collection: this.model.get("sections"), chapter: this });
		this.$el.find(".chapter-slidedown").html(sectionCollectionView.render().el);
		return this;
	},

	remove: function(){
		this.$el.remove();
	},

});

var ChapterNavView = Backbone.View.extend({

	model: Content,
	tagName: "div",
	className: "navchapter tabbed",
	calculated: false,
	
	initialize: function() {
		this.model.on("change", this.render, this);
		this.model.bind("recalc", this.recalc, this);
	},
	
	events: {
		
	},
	
	template: _.template('\
			<div class="navchapter-title"><%= title %></div>\
			<div class="H"><%=highlights %></div><div class="N"><%= notes %></div>\
			<div class="S"><%= summarycompleted %>/<%= summarytotal %></div>\
		'),
	
	recalc: function(){
		this.model.set({
			highlights: this.model.SNgethighlights(),
			notes: this.model.SNgetnotes(),
			summarycompleted: this.model.SNgetsummarycompleted(),
			summarytotal: this.model.SNgetsummarytotal(),
		});
	},
	
	render: function(){
		this.$el.html("");
		if(this.model.get("sections") != "null" && this.calculated == false){
			this.recalc();
			this.calculated = true;
		}
		this.$el.html(this.template(this.model.toJSON()));
		// Now take care of the sections
		return this;
	},

	remove: function(){
		this.$el.remove();
	},

});



// Collection Views

var ChapterCollectionView = Backbone.View.extend({
		
	collection: ContentCollection,
	
	initialize: function() {
		
	},
	
	addOne: function(m){
		var ch = new ChapterView({model: m});
		ch.render();
		this.$el.append(ch.el);
	},
	
	render: function(){
		// Add all the reminders
		this.collection.forEach(this.addOne, this);
		return this;
	},
	
	remove: function(){
		this.$el.remove();
	}
	
});

var ChapterNavCollectionView = Backbone.View.extend({
	
	collection: ContentCollection,
	
	initialize: function() {
		this.collection.on("change", this.render, this);
	},
	
	addOne: function(m){
		var ch = new ChapterNavView({model: m});
		ch.render();
		this.$el.append(ch.el);
	},
	
	render: function(){
		this.$el.html("");
		// Add all the reminders
		this.collection.forEach(this.addOne, this);
		return this;
	},
	
	remove: function(){
		this.$el.remove();
	}
	
});
