<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.Iterator"%>
<%@ page import="java.util.Collection"%>
<%@ page import="edu.uoregon.models.*"%>
<%@ page import="edu.uoregon.models.groups.Group"%>
<%@ page import="edu.uoregon.models.Content"%>
<%@ page import="edu.uoregon.servlets.SaraServlet"%>
<%@ page import ="com.googlecode.objectify.Key"%>

<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>


<html>

	<head>
	
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<!-- to prevent zooming  -->
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

		<!-- Stylesheets -->
		<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css" />
		<link rel="stylesheet" type="text/css" href="/lib/jquery-ui-1.10.0.custom/css/smoothness/jquery-ui-1.10.0.custom.min.css" />
		
		<link rel="stylesheet" type="text/css" href="/basic/shared/css/main.css" />
		<link rel="stylesheet" type="text/css" href="/basic/reader/css/reader.css" />
		<link rel="stylesheet" type="text/css" href="/basic/reader/css/reader-notebook.css" />
		<link rel="stylesheet" type="text/css" href="/lib/font-awesome.css"/>

		<link rel="stylesheet" type="text/css" href="/basic/reader/css/preview-sections.css"/>
		<link rel="stylesheet" type="text/css" href="/basic/reader/css/preview-figures.css"/>
		<link rel="stylesheet" type="text/css" href="/basic/reader/css/review-summaries.css"/>
		<link rel="stylesheet" type="text/css" href="/basic/reader/css/review-media.css"/>
		<link rel="stylesheet" type="text/css" href="/basic/reader/css/heatmap-strat.css"/>
		<!-- Scripts -->
		<script src="/lib/jquery-1.7.2.min.js"></script>
		<script src="/lib/underscore-min.js"></script>
		<script src="/lib/backbone-min.js"></script>
		<script src="/lib/date.js"></script>
		<script src="/lib/jquery.editable-1.3.3.js"></script>
		<script src="/lib/jquery-ui-1.10.0.custom/js/jquery-ui-1.10.0.custom.min.js"></script>
		<script src="/lib/modernizr.js"></script>
		<script src="/lib/priority_queue.js"></script>
		<script src="/lib/jquery.ui.touch-punch.min.js"></script>
		
		<script src="/lib/bootstrap/js/bootstrap-transition.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-dropdown.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-tab.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-tooltip.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-popover.js"></script>
		<script src="/lib/bootstrap/js/bootstrap-modal.js"></script>
		
		<script src="/basic/reader/js/models/stratdata-models.js"></script>
		<script src="/basic/reader/js/views/controller-view.js"></script>
		<script src="/basic/reader/js/views/reader-views.js"></script>
		<script src="/basic/reader/js/views/highlight-widget-view.js"></script>
		<script src="/basic/reader/js/models/note-models.js"></script>
		<script src="/basic/reader/js/views/note-views.js"></script>
		<script src="/basic/shared/js/section-models.js"></script>
		<script src="/basic/shared/js/section-views.js"></script>
		<script src="/basic/reader/js/models/highlight-models.js"></script>
		<script src="/basic/reader/js/views/highlight-views.js"></script>
		<script src="/basic/reader/js/models/dictionary-models.js"></script>
		<script src="/basic/reader/js/views/dictionary-views.js"></script>	
		<script src="/basic/reader/js/views/fontsize-views.js"></script>
		<script src="/basic/reader/js/views/notebook-views.js"></script>
		<script src="/basic/reader/js/models/reminder-models.js"></script>
		<script src="/basic/reader/js/views/reminder-views.js"></script>
		<script src="/basic/reader/js/models/popup-models.js"></script>
		<script src="/basic/reader/js/views/popup-views.js"></script>
		
		<script src="/basic/reader/strategyViews/review-summaries-view.js"></script>
		<script src="/basic/reader/strategyViews/review-multimedia-view.js"></script>
		<script src="/basic/reader/strategyViews/preview-sections-view.js"></script>
		<script src="/basic/reader/strategyViews/preview-figures-view.js"></script>
		<!-- <script src="/basic/reader/js/views/heatmap-popup-view.js"></script> -->
		<script src="/basic/reader/js/models/heatmap-cloud-model.js"></script>
		<script src="/basic/reader/js/views/heatmap-cloud-view.js"></script>
		<script src="/basic/reader/js/views/heatmap-view.js"></script>
		
		<!-- OfflineSpeechStuff -->
		<script src="/basic/reader/js/speakClient.js"></script>
		<script src="/basic/reader/js/speakGenerator.js"></script>
		
		
	    <script src="/basic/reader/js/texttospeech.js"></script>
	    <script src="/basic/reader/js/audio.js"></script>
		<script src="/basic/reader/js/reader.js"></script>
		<script src="/basic/reader/js/reader-popovers.js"></script>
		
		<script src="/basic/shared/js/userbar.js"></script>
		<script src="/basic/shared/js/user-models.js"></script>
		
	</head>
	
	<body>
	
		<div id="tempContainer">
			<h2 style="text-align: center; margin-left: 260px;margin-top: 30px;">Loading Chapter and Strategies...</h2>
		</div>
		<div id="CampusReader">
			<!-- Back button -->
			<input id="backMenuBtn" type="button" class="btn" value="Back to Main Menu">
			<h1 class="title">CampusReader</h1>
			<br>
		</div>
		<!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->
		<!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->
		
		<div id="Tutorial" class="modal fade hide">
			<div class="modal-header">
				<h2>Tutorial</h2>
			</div>
			<div class="modal-body">
				Welcome to CampusReader! It looks like this is your first time here,
				would you like a short tutorial on how to use the application?
			</div>
			<div class="modal-footer">
				<input id="skipTutBtn" type="button" class="btn" data-dismiss="modal" value="No thanks"/>
				<input id="acceptTutorial" type="button" class="btn btn-primary" data-dismiss="modal" value="Sure"/>
			</div>
		</div>

		<div id="spinnerbox">
			<img src="/images/spinner.gif"/>
		</div>
		
		
		<!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->
		<!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->
		
		
	</body>

</html>