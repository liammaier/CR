var SectionViewSN = Backbone.View.extend({

	model: Section,
	tagName: "div",
	className: "SNsection",
	
	initialize: function() {
		if(this.model.get("highlights") == "null"){
			this.model.set("highlights", new HighlightCollection());
		}
		if(this.model.get("notes") == "null"){
			this.model.set("notes", new NoteCollection());
		}
		
		this.model.get("highlights").on("change", this.updateChapter, this);
		this.model.get("highlights").on("destroy", this.updateChapter, this);
		this.model.get("notes").on("change", this.updateChapter, this);
	},
	
	events: {
		"click .section-toolbar div": "switchContent",
		"click .dropdown-arrow": "expandContent",
	},
	
	template: _.template('\
				<div class="sectionbar">\
					<div class="sectionbar-section"><%= name %></div>\
					<div class="sectionbar-toolbar">\
						<img class="dropdown-arrow" src="/images/arrow-dropdown.png">\
					</div>\
				</div>\
				<div class="section-slidedown">\
					<div class="section-toolbar">\
						<div class="highlights-btn active">Highlights</div><div class="list-btn">List</div><div class="confusing-btn">Confusing Concepts</div>\
					</div>\
					<div class="highlights-window"></div>\
					<div class="list-window"></div>\
					<div class="confusing-window"></div>\
				</div>\
			'),
	
	
	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		// Fill out the highlights and confusing windows
		var highCollView = new HighlightCollectionView({ collection: this.model.get("highlights"), template: "annotationtemplate"});
		var questionCollView = new HighlightCollectionView({ collection: this.model.get("highlights"), template: "questiontemplate"});
		this.$el.find(".highlights-window").html(highCollView.render().el);
		this.$el.find(".confusing-window").html(questionCollView.render().el);
		
		// Now fill section summary
		var secsumArray = this.model.get("notes").where({ type: "Section Summary" });
		var secsum = new Note({ sectionID: this.model.get("id"), section: this.model.get("id"), type: "Section Summary" });
		if(secsumArray != null && secsumArray.length != 0){
			secsum = secsumArray[0];
			this.model.get("notes").remove(secsumArray[0]);
		}
		this.$el.find(".section-slidedown").append(new SectionSummaryView({ model: secsum }).render().el);
		
		// Now fill out list
		var listCollView = new NoteCollectionView({ collection: this.model.get("notes"), sectionID: this.model.get("id") });
		this.$el.find(".list-window").html(listCollView.render().el);
		
		return this;
		
	},
	
	switchContent: function(e){
		if(!$(e.target).hasClass("active")){
			$(e.target).siblings().removeClass("active");
			$(e.target).addClass("active");
			
			// Swap out the view below the toolbar
			$(e.target).parent().siblings().hide();
			var showclass = "." + $(e.target).attr("class").split("-")[0] + "-window";
			$(e.target).parent().siblings(showclass).show();
		}
		this.$el.find(".secsum").show();
	},
	
	updateChapter: function(){
		this.options.chapter.model.trigger("recalc");
	},
	
	expandContent: function(e){
		$(e.target).toggleClass("active");
		this.$el.find(".section-slidedown").slideToggle("fast");
	},
	
	remove: function(){
		this.$el.remove();
	},

});


var SectionCollectionViewSN = Backbone.View.extend({
	
	collection: SectionCollection,
	
	addOne: function(m){
		var ch = new SectionViewSN({model: m, chapter: this.options.chapter });
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
