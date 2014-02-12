
var CRImportView = Backbone.View.extend({
    id: "main",
    working:false,
    initialize: function(){
    	//TODO add these from the server
    	
        this.navView = new NavView();
        var tagModels =
        	[
				{
					name:"Image",
					saraTag:null,
					tagType:"h1",
					color:"white"
				},
    		 	{
    		 		name:"Section",
        			saraTag:null,
        			className:"section",
        			tagType:"section",
        			color:"lightblue"
    		 	},
    		 	{
    		 		name:"Aside",
    		 		number:null,
        			saraTag:null,
					className:"articleInline runaroundLeft",
        			tagType:"div",
        			color:"lightgreen"

    		 	},
    		 	{

				 	name:"Paragraph",
					saraTag:null,
					number:null,
					className:null,
					tagType:"p",
        			color:"lightyellow"

    		 	},
    		 	{
    		 		name:"Page Break",
    		 		number:null,
        			saraTag:null,
					className:"pagebreak",
        			tagType:"div",
        			color:"lightpink"

    		 	},	
    		 	
//    		 	{
//    		 		name:"Heading Large",
//        			saraTag:null,
//        			tagType:"h2",
//        			color:"orange"
//
//    		 	},
//    		 	{
//    		 		name:"Heading Medium",
//        			saraTag:null,
//        			tagType:"h3",
//        			color:"blue"
//
//    		 	},
    		 	
    		 	{
    		 		name:"Date Published",
        			saraTag:null,
        			tagType:"h6",
        			color:"orange"

    		 	},
    		 	{
    		 		name:"Author",
        			saraTag:null,
        			tagType:"h6",
        			color:"yellow"

    		 	},
    		]
        this.tagSelectorView = new TagSelectorView({tags:tagModels});
        this.contentView = new ContentView();
        CRImport.preview = new PreviewView();
        
        CRImport.events.bind("importHTML",this.importHTML,this);
    },
    importHTML:function(url){
    	//jsonp stuff
		var parser =  new Parser();
		console.log("loading html for URL:" + url);
    	parser.parse(url);
    	
    	//pass to the contentView with fully finished collection
    },
    render: function(){
    	this.$el.html(this.template());
        this.$el.find(".headerContainer").html(this.navView.render().el)
        this.$el.find("#right").html(this.tagSelectorView.render().el)
        this.$el.find("#center").html(this.contentView.render().el);
        this.$el.find("#left").html(CRImport.preview.render().el);

        return this;
    },
    template : _.template('\
        <div id="header">\
            <div class="navbar">\
                <div id = "navbarContainer"class="headerContainer navbar-inner">\
                </div>\
            </div>\
        </div>\
        <div id="mainContainer">\
            <div id="center" class="column">\
            </div>\
            <div id="left" class="column">\
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