var ResourceView = Backbone.View.extend({

	model: Resource,
	tagName: "div",
	className: "bar inline resource", // either accessible or inaccessible

	events: {
		
	},

	accessTemplate: _.template("<image align='left' class='resourcepic' src='/contents/<%= url %>/<%= url %>.jpg'>" +
				"<div class='resourceTitle'><%= title %></div>" +
				"<div class='desc'><%= description %></div>" +
				"<!--<button class='close removeResourceBtn'>&times;</button>-->" +
				"<div class='dataSection'>" +
				"<div class='last-read-div'>Last time you read this book: <span class='last-read'>N/A</span></div><br>" +
				"<div class='last-chapter-div'>Chapter you last read: <span class='last-chapter'>N/A</span></div>" +
				"</div>" +
				"<div style='text-align: right;'>" +
				"<a href='/resource?r=<%= id %>' data-type='<%= type %>' class='btn-large btn-primary resourceBtn readOldBtn'>Start Reading where I left off</a>" +
				"<a href='/resource?r=<%= id %>' data-type='<%= type %>' class='btn-large btn-primary resourceBtn readNewBtn' style='margin-right:10px;'>Start a New Reading</a>" +
				"<!--a href='/resource?r=<%= id %>' data-type='<%= type %>' id='readNotebookBtn' class='btn-large btn-primary resourceBtn' style='margin-right:10px;'>Review Notebook</a-->" +
				"</div>"),
	
	noaccessTemplate: _.template("<image align='left' class='resourcepic inaccessible' src='" +
			"<% if(type == 'book') { print ('/images/book.png') } %>'/>" +
			"<div class='resourceTitle inaccessible'><%= title %></div>" +
			"<div class='desc inaccessible'><%= description %></div>" + 
			"<button class='close removeResourceBtn'>&times;</button>" +
			"<input data-type='<%= type %>' id='<%= id %>' type='button' class='btn btn-danger getaccessBtn' value='Get Access'/>"),			

	initialize: function(){
		this.model.on("change", this.render, this);
	},

	render: function(){
		if(this.model.get("haveAccess")){
			this.$el.html(this.accessTemplate(this.model.toJSON()));
		}else {
			this.$el.html(this.noaccessTemplate(this.model.toJSON()));
		}
		$("#resTitle").text(this.model.get("title"));
		
		// pull reading info for stats and button
		var that = this;
		$.get("/getuserresourceprogress", {resourceid: this.model.get("id")}, function(data){
			if (data.contentName != "") {
				var date = new Date(data.lastRead + " UTC");
				that.$el.find(".last-read").text(date.toLocaleDateString() + " " + date.toLocaleTimeString());
				that.$el.find(".last-chapter").text(data.contentName);
				
				if (data.strategy === "read" || data.strategy === undefined) {
					that.$el.find(".readOldBtn").attr("href", "/reader?c="+data.lastContentId+"&s="+data.section);
				} else {
					that.$el.find(".readOldBtn").attr("href", "/reader?c="+data.lastContentId+"&st="+data.strategy);
				}
				
			}
		});
		
		// log what htey click
		this.$el.find(".readOldBtn").click(function(){
			$.post("/log", {type: "clickstartwhereleftoff", strategy: "menus", contentkey: "", sectionkey: "", data1: that.model.get("title"), data2: that.model.get("id")});
		});
		
		this.$el.find(".readNewBtn").click(function(){
			$.post("/log", {type: "clicknewreading", strategy: "menus", contentkey: "", sectionkey: "", data1: that.model.get("title"), data2: that.model.get("id")});
		});
		
	},

	remove: function(){
		this.$el.remove();
	},

});

var ManageResourceView = Backbone.View.extend({

	model: Resource,
	tagName: "div",
	className: "bar inline resource", // either accessible or inaccessible

	events: {
		"click .removeResourceBtn" : "removeResource",
	},

	accessTemplate: _.template("<image align='left' class='resourcepic' src='/images/book.png'>" +
				"<div class='resourceTitle'><%= title %></div>" +
				"<div class='desc'><%= description %></div>" +
				"<button class='close removeResourceBtn'>&times;</button>" +
				"<div class='dataSection'>" +
				"Last time you read this book: <span class='last-read'>N/A</span><br>" +
				"Chapter you last read: <span class='last-chapter'>N/A</span>" +
				"</div>" +
				"<div style='text-align: right;'>" +
				"<a href='/resource?r=<%= id %>' data-type='<%= type %>' class='btn-large btn-primary resourceBtn readOldBtn'>Start Reading where I left off</a>" +
				"<a href='/resource?r=<%= id %>' data-type='<%= type %>' class='btn-large btn-primary resourceBtn readNewBtn' style='margin-right:10px;'>Start a New Reading</a>" +
				"<!--a href='/resource?r=<%= id %>' data-type='<%= type %>' id='readNotebookBtn' class='btn-large btn-primary resourceBtn' style='margin-right:10px;'>Review Notebook</a-->" +
				"</div>"),
	
	noaccessTemplate: _.template("<image align='left' class='resourcepic inaccessible' src='" +
			"<% if(type == 'book') { print ('/images/book.png') } %>'/>" +
			"<div class='resourceTitle inaccessible'><%= title %></div>" +
			"<div class='desc inaccessible'><%= description %></div>" + 
			"<button class='close removeResourceBtn'>&times;</button>" +
			"<input data-type='<%= type %>' id='<%= id %>' type='button' class='btn btn-danger getaccessBtn' value='Get Access'/>"),			

	initialize: function(){
		this.model.on("change", this.render, this);
	},
	
	removeResource: function() {
		var c = confirm("Are you sure you want to remove this resource from the library? You may always add it again " +
							"at a later time.");
		if(c == false) { return; }
		this.$el.find(".removeResourceBtn").tooltip("hide");
		$.post("/toggleResourceInLibrary", {libID: getURLParameter("lib"), resourceID: this.model.id, type: this.model.get("type"), action: "remove"});
		
		resourceDropdownCollection.add(this.model);
		
		this.remove();
	},

	render: function(){
		if(this.model.get("haveAccess")){
			this.$el.html(this.accessTemplate(this.model.toJSON()));
		}else {
			this.$el.html(this.noaccessTemplate(this.model.toJSON()));
		}
		this.$el.find(".removeResourceBtn").tooltip({ title: "Remove resource" });
		$("#resTitle").text(this.model.get("title"));
		
		// pull reading info for stats and button
		var that = this;
		$.get("/getuserresourceprogress", {resourceid: this.model.get("id")}, function(data){
			if (data.contentName != "") {
				that.$el.find(".last-read").text(data.lastRead);
				that.$el.find(".last-chapter").text(data.contentName);
				
				that.$el.find(".readOldBtn").attr("href", "/reader?c="+data.lastContentId)
			}
		});
		
		// log what htey click
		this.$el.find(".readOldBtn").click(function(){
			$.post("/log", {type: "clickstartwhereleftoff", strategy: "menus", contentkey: "", sectionkey: "", data1: that.model.get("title"), data2: that.model.get("id")});
		});
		
		this.$el.find(".readNewBtn").click(function(){
			$.post("/log", {type: "clicknewreading", strategy: "menus", contentkey: "", sectionkey: "", data1: that.model.get("title"), data2: that.model.get("id")});
		});
		
	},

	remove: function(){
		this.$el.remove();
	},

});

var ResourceDropdownView = Backbone.View.extend({

	model: Resource,
	tagName: "li",
	className: "",

	events: {
		"click a"        : "addResourceToLibrary",
	},

	template: _.template("<a href='#'>" +
						 	 "<div class='dropdown-el'>" +
						 		"<image align='left' class='dropdownresourcepic' src='" +
						 		"<% if(type == 'article') { print ('/images/article.png')" +
						 		"} else if(type == 'book') { print ('/images/book.png') } %>'/>" +
						 		"<h2 class='dropdownTitle'><%= title %></h2>" +
						 		"<div class='descdrop-container'>" +
						 			"<div class='dropdown-desc'><%= description %></div>" +
						 		"</div>" +
							 "</div>" +
						 "</a>"),

	initialize: function(){
		this.model.on("change", this.render, this);
	},
	
	addResourceToLibrary: function() {
		
		/** Change to use url and restful**/
		$.post("/toggleResourceInLibrary", {libID: getURLParameter("lib"), resourceID: this.model.id, type: this.model.get("type"), action: "add"});
		/** Change to use url and restful**/
		
		if(this.model.type != "article"){
			resourceCollection.add(this.model);
			$(".resourceTitle").dotdotdot();
			$(".desc").dotdotdot();
		}
		
		this.remove();
	},

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.find(".descdrop-container").width($(window).width() * 2/3);
	},

	remove: function(){
		this.$el.remove();
	},

});

var SuperNotebookResourceView = Backbone.View.extend({

	model: Resource,
	tagName: "div",
	className: "book", // either accessible or inaccessible

	events: {
		"click": "showChapters",
		"click input": "clickReview",
	},

	checkedTemplate: _.template("<input type='checkbox' checked>"+
							"<span><%= title %></span>"),
	uncheckedTemplate: _.template("<input type='checkbox'>"+
							"<span><%= title %></span>"),
	
				
	initialize: function(){
		this.model.on("change", this.render, this);
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
	
	showChapters: function(target){
		
		var $target = $(target.currentTarget);
		
		// only pop if it's not already selected
		if (!$target.hasClass("selected")) {
			
			var contentCollectionView = new SuperNotebookContentCollectionView({ collection: this.model.get("chapters") }),
				$chapters = $("#chapters");
				
			contentCollectionView.render();
			
			// remove the chapters if they are visible
			if ($chapters.is(":visible")){
				
				// hid sections
				$("#sections").hide();
				$(".chapters").removeClass("selected");
				
				$chapters.toggle("slide", function(){
					$(".book").removeClass("selected");
					$chapters.html(contentCollectionView.el);
					$chapters.toggle("slide");
					$target.addClass("selected");
				});
				
			} else {
				// show chapters
				$chapters.html(contentCollectionView.el);
				$chapters.toggle("slide");
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
	
	remove: function(){
		this.$el.remove();
	},

});


// Collection Views

var UserResourceCollectionView = Backbone.View.extend({

	tagName: "div",
	
	collection: ResourceCollection,
	events: {
		"add" : "render",
	},
	
	
	initialize: function() {
		this.collection.on("add", this.addOne, this);
		
	},
	
	render: function(){
		this.collection.forEach(this.addOne, this);
	},

	addOne: function(m){
		var gv = new ResourceView({model: m});
		gv.render();
		this.$el.append(gv.el);
		btnListeners();
	},
});

var ManageResourceCollectionView = Backbone.View.extend({

	tagName: "tbody",
	
	collection: ResourceCollection,
	events: {
		"add" : "render",
	},
	addResourceTemplate: _.template('<div id="addResourceBtnGroup" class="btn-group">' +
										'<button class="btn btn-large">Add Resource</button>' +
										'<a class="btn btn-large dropdown-toggle" data-toggle="dropdown" href="#">' +
											'<img class="largebtnimage" src="/images/plus.png"/></button>' +
										'</a>' +
										'<ul id="resourceDropdownList" class="dropdown-menu"></ul>' +
									'</div><br><br><br>'),
	
	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},
	
	render: function(){
		this.$el.append(this.addResourceTemplate());
		this.collection.forEach(this.addOne, this);
	},

	addOne: function(m){
		var gv = new ManageResourceView({model: m});
		gv.render();
		this.$el.append(gv.el);
		btnListeners();
	},
});

var ResourceDropdownCollectionView = Backbone.View.extend({

	tagName: "ul",
	el: "#resourceDropdownList",
	events: {
		"add" : "render",
	},

	collection: ResourceCollection,

	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},

	render: function(){
		this.collection.forEach(this.addOne, this);
	},

	addOne: function(m){
		var gv = new ResourceDropdownView({model: m});
		gv.render();
		this.$el.append(gv.el);
		btnListeners();
	},
});

var SuperbookResourceCollectionView = Backbone.View.extend({

	collection: ResourceCollection,
	events: {
		
	},
	
	initialize: function() {
		this.collection.on("add", this.addOne, this);
	},
	
	render: function(){
		$(this.el).attr('id', 'books');
		this.collection.forEach(this.addOne, this);
	},
	
	addOne: function(m){
		var gv = new SuperNotebookResourceView({model: m});
		gv.render();
		this.$el.append(gv.el);
		btnListeners();
},

});


