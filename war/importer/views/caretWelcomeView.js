
var CaretWelcomeView = Backbone.View.extend({
    id: "welcome",
    working:false,
    events:{
       "click #start":"start",
    },
    start:function(event){
    	CRImport.startCaret();
    },
    setReady:function(){
    	this.$el.find("#start").attr("disabled", false).val("Start Using Caret");
    },
    findBrowser:function(){
    	var N= navigator.appName, ua= navigator.userAgent, tem;
    	var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    	if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    	M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];
    	return M;
    },

    render:function(){
    	this.$el.html(this.template());
    	this.$el.find("#start").attr("disabled", true);
    	// compatibility checks
    	var browser = this.findBrowser();
    	var version = browser[1].split(".");
    	this.$el.find("#browser").text(browser[0] + " " + version[0]+"."+version[1]);
    	
    	if (browser.indexOf("Chrome") !== -1 || browser.indexOf("Safari") !== -1){
    		this.$el.find("#notchrome").hide();
    	}    	
    	return this;
    },
    template : _.template('\
    	<center>\
    		<img style ="height:160px;" src= "/importer/css/images/caret_logo.png"></img>\
			<br>\
			<br>\
			<div class = "div1">\
				Welcome to Caret. <strong>You will need to be logged-in to your Google account to access the site.</strong>\
			</div>\
			<br>\
			<br>\
			<input type="button" id="start" class="btn-success btn btn-large" value="Loading...">\
			<br>\
			<br>\
			<div class = "div1">Caret is a tool for use with the <a href = "/">CampusReader project</a>. For more information, contact the Project Leader, Stephen Fickas, at fickas@cs.uoregon.edu.</div>\
		    <br>\
		    <br>\
			<div id="browser-info" class= "well well-large" style="width: 500px; margin-bottom: 30px;" >\
				<h2 style="margin-bottom:20px;">Browser Recommendations </h2>\
				<p>Caret works best with Chrome or Safari browsers.<br>\
				Caret will run with Firefox, but some features may be limited.<br>\
				Caret generally does not run well with IE (Internet Explorer).</p>\
				<p>The browser you are using is <strong><span id="browser"></span></strong></p>\
				<div id="notchrome">\
					<p>The following features may not work with this browser:</p>\
					<p id="tts"><strong>Text to speech may not work</strong></p>\
					<p id="css"><strong>Well-rendered content: may not work</strong></p>\
					<br>\
					<p> Download <a href="https://www.google.com/intl/en/chrome/browser/">Google Chrome</a> to get the full functionality </p>\
				</div>\
				<br>\
			</div>\
		    <img src= "/images/NSF.png" onclick = "window.open(\"http://www.nsf.gov/\")" ></img>\
    	</center>\
    '),

}); 