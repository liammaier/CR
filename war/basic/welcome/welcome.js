
$(document).ready(function() {
	$('#login').click (function() {
		$('#spinnerbox').fadeIn("fast");
		window.location.replace("/login");
	});
	
	$.post("/log", {type: "welcome", strategy: "menus", contentkey: "", sectionkey: "", data1: "", data2: ""});
	
	// compatibility checks
	var browser = findBrowser()
	var version = browser[1].split(".");
	$("#browser").text(browser[0] + " " + version[0]+"."+version[1]);
	
	if (browser.indexOf("Chrome") !== -1 || browser.indexOf("Safari") !== -1){
		$("#notchrome").hide();
	}
	
	if (Modernizr.audio.mp3) $("#tts").hide();
	
	var cssCount = 0;
	if (Modernizr.borderradius) cssCount ++;
	if (Modernizr.boxshadow) cssCount ++;
	if (Modernizr.opacity) cssCount ++;
	if (Modernizr.textshadow) cssCount ++;
	if (Modernizr.generatedcontent) cssCount ++;
	if (Modernizr.canvas) cssCount ++;
	
	if (cssCount == 6) {
		$("#css").hide();
	}
	
	// test an outside server (google)
	$.Ping("https://www.google.com/").done(function (success, url, time, on) {
		
		// don't show the slow warning message if it's not slow
		if (time < 1000) {
			$("#internet").hide();
		}
	})
	
});



findBrowser = function () {
	var N= navigator.appName, ua= navigator.userAgent, tem;
	var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
	if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
	M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];
	return M;
}

//ping function
$.extend($, {
	Ping: function Ping(url, timeout) {
		timeout = timeout || 1500;
		var timer = null;
 
		return $.Deferred(function deferred(defer) {
 
			var img = new Image();
			img.onload = function () { success("onload"); };
			img.onerror = function () { success("onerror"); };  // onerror is also success, because this means the domain/ip is found, only the image not;
			
			var start = new Date();
			img.src = url += ("?cache=" + +start);
			
			timer = window.setTimeout(function timer() { fail(); }, timeout);
 
			function cleanup() {
				window.clearTimeout(timer);
				timer = img = null;
			}
 
			function success(on) {
				cleanup();
				defer.resolve(true, url, new Date() - start, on);
			}
 
			function fail() {
				cleanup();
				defer.reject(false, url, new Date() - start, "timeout");
			}
 
		}).promise();
	}
});