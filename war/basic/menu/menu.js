/* JavaScript for the main menu, displaying libraries, a main schedule, and other helpful links */
$(document).ready(function() {
		
	// Text updates and JavaScript calls
	$("#toprightDate").html("<div class='date'>Today's date: " + new Date().toLocaleDateString() + "</div>");
	createUserbar();

	$.post("/log", {type: "mainmenu", strategy: "menus", contentkey: "", sectionkey: "", data1: "", data2: ""});
	

	$("#backBtn").click(function() {
		window.location.href = "/";
	});
});