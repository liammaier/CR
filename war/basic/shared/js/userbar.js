var user;

// This function creates a userbar at the top right of the screen, with the given element active
var createUserbar = function(active) {
	$("body").prepend('\
		<script>(function(){var uv=document.createElement("script");uv.type="text/javascript";uv.async=true;uv.src="//widget.uservoice.com/tGwfpyBKnras0RBtVMdG8A.js";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(uv,s)})()</script>\
		<a id="feedbackbtn" class="btn" href="javascript:void(0)" data-uv-lightbox="classic_widget" data-uv-mode="full" data-uv-primary-color="#cc6d00" data-uv-link-color="#007dbf" data-uv-default-mode="support" data-uv-forum-id="223772">Feedback &amp; Support</a>\
		<div id="logoutBtn" class="btn-group">\
			<a class="btn" href="#"><i class="icon-user"></i><div id="username" class="inline">&nbsp;loading...</div></a>\
			<a id="CaretBtn" class="btn dropdown-toggle" data-toggle="dropdown" href="#"><span class="caret"></span></a> \
			<ul id="navbarDropdown" class="dropdown-menu pull-right">\
				<li id="settingsPill"><a href="/basic/options/reminders.html"><i class="icon-cog"></i> Settings</a></li>\
				<li class="divider"></li>\
       			<li id="signOutPill"><a id="signOffAnchor" href="#"><i class="icon-off"></i> Sign out</a></li>\
			</ul>\
    	</div>'
	);
	
	if(active == "Settings"){
		$("#settingsPill").addClass("active");
	}
	
	$.post("/getUser", function(data) {
		$("#signOffAnchor").attr("href", "/logout");
		$("#username").html("&nbsp;" + data.userEmail.email.split("@")[0]);
		user = new User(data);
	});
};
	
	