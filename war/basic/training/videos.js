$(document).ready(function(){
	
	
	//$('#spinnerbox').fadeIn("fast");
	//$('#spinnerbox').fadeOut("fast");
	
		
	// Text updates and JavaScript calls
	createUserbar();
	
	// Button click listeners
	$("#backBtn").click(function() {
		window.location.href = "/menu";
	});

		
	// Resize functions
	resizeElements = function(){
		$('.chapDesc').width($(window).width() - 200);
	};
	$(window).resize(function(){
		resizeVideo();
		resizeElements();
	});
	
	
	resizeVideo();

	resizeElements();
	
	$.post("/log", {type: "uservideopage", strategy: "menus", contentkey: "", sectionkey: "", data1: "", data2: ""});
	
});


	var videos = new Array();
	
	videos[0] = "1_CR_overview";
	videos[1] = "2_Reading_profile";
	videos[2] = "3_Getting_started";
	videos[3] = "4_Three_Phases";
	videos[4] = "5_Preview_phase";
	videos[5] = "6_Read_feature_overview";
	videos[6] = "7_Text2Speech_feature";
	videos[7] = "8_create_edit_feature";
	videos[8] = "9_Notebook";
	videos[9] = "10_Review_phase";

	var titles = new Array();
	
	titles[0] = "1. CampusReader Overview";
	titles[1] = "2. The Reading Profile";
	titles[2] = "3. Getting Started";
	titles[3] = "4. The Three Phases";
	titles[4] = "5. The Preview Phase";
	titles[5] = "6. The Reading Phase: Overview";
	titles[6] = "7. The Reading Phase: Text-to-Speech";
	titles[7] = "8. The Reading Phase: Highlighting";
	titles[8] = "9. The Reading Phase: The Notebook";
	titles[9] = "10. The Review Phase";
	

function resizeVideo(){
	
	console.log( "SIZE: "+$(window).width()+" "+$(window).height());
	
	var videoplayers = new Array();
	
	videoplayers[0] = document.getElementById("videoplayer1");
	
	if( $(window).width() >= 1320 && $(window).height() >= 800 ){
		
		for(var i=0; i<videoplayers.length; i++ ){
			videoplayers[i].width = 1280;
			videoplayers[i].height = 800; //720;
		}	
		
	}else if( $(window).width() >= 1172 && $(window).height() >= 730 ){

		for(var i=0; i<videoplayers.length; i++ ){
			videoplayers[i].width = 1152; //1136
			videoplayers[i].height = 720; //640;
		}
		
	}else if( $(window).width() >= 1072 && $(window).height() >= 690 ){

		for(var i=0; i<videoplayers.length; i++ ){
			videoplayers[i].width = 1024;
			videoplayers[i].height = 640 //600;
		}	
		
	}else if( $(window).width() >= 1006 && $(window).height() >= 630 ){

		for(var i=0; i<videoplayers.length; i++ ){
			videoplayers[i].width = 960;
			videoplayers[i].height = 600; //540;
		}			
		
	}else if( $(window).width() >= 904 && $(window).height() >= 570 ){ 

		for(var i=0; i<videoplayers.length; i++ ){
			videoplayers[i].width = 864;
			videoplayers[i].height = 540;
		}
		
	}else if( $(window).width() >= 808 && $(window).height() >= 480 ){ //894 && $(window).height() >= 570 ){

		for(var i=0; i<videoplayers.length; i++ ){
			videoplayers[i].width = 768; //854;
			videoplayers[i].height = 480;
		}
		
	}else{	
		for(var i=0; i<videoplayers.length; i++ ){
			videoplayers[i].width = 640;
			videoplayers[i].height = 400; //360;
		}		
	}
	
}

function switchVideo(index){
	
	var videotitle = document.getElementById("videotitle");
	
	videotitle.innerHTML = titles[index];
	
	var videoplayer = document.getElementById("videoplayer1");

	var sources = videoplayer.getElementsByTagName('source');
	sources[0].src = 'http://www.coglink.com/movies/cr/'+videos[index]+'.mp4';
	sources[1].src = 'http://www.coglink.com/movies/cr/'+videos[index]+'.webm';
	
	videoplayer.load();	
	
}
