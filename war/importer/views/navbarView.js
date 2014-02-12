var NavView = Backbone.View.extend({
    id:"navBarContents",
    initialize: function(){

        this.undelegateEvents();
        this.delegateEvents();
        this.type = "default";
        //set both the tabs we want to be selected at init
        this.$currentLeftNavTab = $(this.$el.find(""));
        this.$currentRightNavTab = $(this.$el.find(""));
    },
    events: {
//        "click #rightNav > li":"rightNav",
//        "click #leftNav > li":"leftNav",
    	"click #home": "goHome",
    },
    goHome:function(){
    	window.location = "/";
    },
    //handles clicks on the left side of the navbar, sets the current tab, and calls the function to switch tabs
    leftNav: function(e){
        //if the left tab is not visible open it first(if possible)
        CRImport.view.leftPaneToggle(false);
        
        var $clicked = $($(e.target).parent());

        //if the tab we clicked isn't the current tab
        if($clicked.attr("id") != this.$currentLeftNavTab.attr("id")){

            $clicked.addClass("active");
            this.$currentLeftNavTab.removeClass("active");

            //switch the left panel
            this.switchLeftPanel($clicked);

            //set the new current tab
            this.$currentLeftNavTab = $clicked;
            
        }
    },
    //handles clicks on the right side of the navbar, sets the current tab, and calls the function to switch tabs
    rightNav:function(e){
        CRImport.view.rightPaneToggle(false);
        
        var $clicked = $($(e.target).parent());
        if($clicked.attr("id") != this.$currentRightNavTab.attr("id")){
        	
            $clicked.addClass("active");
            this.$currentRightNavTab.removeClass("active");

             //switch the right panel
            this.switchRightPanel($clicked);

            //set the new current tab
            this.$currentRightNavTab = $clicked;

            if($clicked[0].id =="navsearch"){
                setTimeout(function(){$("#searchText").focus();},100);
            }
        }
    },
    switchLeftPanel: function(newTab){
        //hide the old tab, and show the new tab
        $("#" + this.$currentLeftNavTab.attr("id").replace("nav","")+"Column").hide();
        if(newTab.attr("id").replace("nav","") == "events" ||newTab.attr("id").replace("nav","") == "query"||newTab.attr("id").replace("nav","") == "documents"){
            CRImport.projectDropdown.$el.hide();
        }else{
            CRImport.projectDropdown.$el.show();
        }
        $("#" + newTab.attr("id").replace("nav","")+"Column").show();

    },
    switchRightPanel: function(newTab){
    	var current = this.$currentRightNavTab.attr("id").replace("nav","")
        //hide the old tab, and show the new tab
        $("#" + current +"Column").hide();
        $("#" + newTab.attr("id").replace("nav","")+"Column").show();
    },
    navbar : _.template('<a class="brand" href="#"><img id ="logo" src = "/importer/css/images/caret_logo.png" ></a>\
		<ul id = "leftNav" class="nav">\
            <li class="divider-vertical"></li>\
            <li class="dropdown">\
    			<a href="#" class="dropdown-toggle" data-toggle="dropdown">File <b class="caret"></b></a>\
		    	<ul class="dropdown-menu">\
		    		<li class="nav-header"> Manage Content</li>\
		            <li><a id = "saveLink" class = "disabled-link" href="#">Save </a></li>\
		            <li><a id = "saveAsLink" href="#">Save As</a></li>\
    				<li><a id = "saveFileSystemLink" href="#">Save To Filesystem</a></li>\
			    	<li id = "bookDrop"  class="dropdown-submenu">\
			    	    <a tabindex="-1" href="#">Manage Books</a>\
    				</li>\
    				<li style = "height:2px" class="divider"></li>\
    				<li class="nav-header"> Import/Export</li>\
    				<li><a id ="importHTML" href="#">Import HTML</a></li>\
    				<li><a id ="exportHTML" href="#"> Export HTML</a></li>\
	         	</ul>\
		    </li>\
            <li class="divider-vertical"></li>\
    		<li><a id ="rawPop" href="#"> View Raw HTML</a></li>\
            <li class="divider-vertical"></li>\
        </ul>\
        <ul id = "rightNav" class="nav pull-right">\
            <input id ="home" style = "margin-left:6px;"type = "button" class= "btn btn-success" value = "Campus Reader">\
        </ul>\
    '),
//    <ul id = "leftNav" class="nav">\
//        <li class="divider-vertical"></li>\
//        <li id = "navmessages"class="active"><a href="#">Mesages</a></li>\
//        <li id = "navdocuments"><a href="#">Documents</a></li>\
//        <li id = "navevents"><a href="#">Events</a></li>\
//        <li id = "navquery"><a href="#">Query</a></li>\
//    </ul>\
//    <ul id = "rightNav" class="nav pull-right">\
//        <li id = "navlayers" class="active"><a href="#">Layers</a></li>\
//        <li id = "navsearch"><a href="#">Search</a></li>\
//        <li id = "navmarkup"><a href="#">Markup</a></li>\
//        <input id ="logout" style = "margin-left:6px;"type = "button" class= "btn btn-info" value = "Logout">\
//    </ul>\

    render: function(){
        //for now just add the template into el and add to the html
        this.$el.html(this.navbar());
        return this;     
   },
});