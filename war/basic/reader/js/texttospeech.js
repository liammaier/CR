var tts = tts || {}; // the tts namespace, following this: http://elegantcode.com/2011/01/26/basic-javascript-part-8-namespaces/

/*
 * documentId must be defined and unique for each document, in the document's individual xxxtts.js file 
 * (for instance, war/contents/chapter16/chapter16tts.js). When a new document is loaded into the reader, this var is 
 * overwritten by the new document's documentId.
 */

tts.selectMode = false;		// clicking on sentences is disabled until selectMode is
						// activated by clicking the speaker icon in the controller widget,
						// and disabled again when stop button is pressed.
						
tts.currPlayingClipId;		// the id of the currently playing/paused audio clip
tts.currPlayingRange;		// the Range of the currently playing/paused audio clip
tts.currPlayingClip = new Audio();		// the audio clip that is currently being played or is paused
tts.doPlay;					// set to true so long as player should keep playing
						// in response to user clicking the male/female icon in the widget

tts.textToSpeak = "";		//text that is being spoken.
tts.leftOverToSpeak = "";	//leftover text in a sentence that needs to be spoken.

tts.oncePlayingClip = new Audio();    // the audio clip that is currently being played or is paused
tts.doPlayOnce;

tts.textToSpeakOnce = "";
tts.leftOverToSpeakOnce = "";

tts.disabled = false;
tts.attempts = 0;
tts.paused = false;
tts.muted = false;
tts.stepping = false;
tts.firstStep = true;

tts.checkTimer;

tts.offline = false;    // whether to use offline tts

//tts.url = "TTS?";
//tts.url = "https://www.coglink.com:8080/CR/TTS?";
tts.url = "http://translate.google.com/translate_tts?tl=en&q=";
tts.toggle = false;

/*
 * jquery selector to enable clicking on sentences to start TTS for that sentence.
 * Note that clicking only has an effect if tts.selectMode is enabled, which is only
 * true after the user clicks the speaker icon in the TTS controller widget.
 */


$(document).keyup(function(e){

        //console.log("KEY PRESS "+e.which);
            
        if(e.which == 39){
            
            if( tts.doPlay && (tts.stepping || tts.paused) ){
            
            	tts.stepTTS();
            }
	}
});



/*
 * This code is used by strategies to speak any text.
 */

//Just speaks the given text.
tts.speakText = function(text){
	console.log("speackText:::"+text)
	//pause what we are already playing
	if (tts.currPlayingClip) {
		if( !tts.paused ) tts.pauseTTS();
	}

	if ( tts.oncePlayingClip) {
		tts.oncePlayingClip.pause();
	}
	
		
	//tts.leftOverToSpeak == "";
	//stop the Reader TTS if it is playing	
	//if( tts.selectMode || tts.doPlay ){
	//	tts.toggleTTS();
	//}
	
	
//	tts.oncePlayingClip = new Audio();
	
	tts.textToSpeak = text;
	
	var pieces = tts.textToSpeak.replace("iOS", "i OS").replace("\t", " ").replace("\r", " ").replace("\n", " ").replace("\0", " ").replace("&", "and").replace("e.g.", "For example").trim().split(" ");
	tts.textToSpeakOnce = pieces[0];
	for(var i=1; i<pieces.length; i++)
		tts.textToSpeakOnce += "+"+pieces[i].trim().replace("&gt;", "").replace("&lt;", "");
	
	
	if( tts.textToSpeakOnce.length > 100 ){
		var indexToSplit = 0;
		for(var i=0; i<100; i++){
			if( tts.textToSpeakOnce.indexOf(",+", i) < 90 && tts.textToSpeakOnce.indexOf(",+", i) > -1 )
				indexToSplit = i;
		}
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeakOnce.indexOf(",+", i) < 100 && tts.textToSpeakOnce.indexOf(",+", i) > -1 )
					indexToSplit = i;
			}
		}		
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeakOnce.indexOf(";+", i) < 100 && tts.textToSpeakOnce.indexOf(";+", i) > -1 )
					indexToSplit = i;
			}
		}		
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeakOnce.indexOf(")+", i) < 100 && tts.textToSpeakOnce.indexOf(")+", i) > -1 )
					indexToSplit = i;
			}
		}
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeakOnce.indexOf(":+", i) < 100 && tts.textToSpeakOnce.indexOf(":+", i) > -1 )
					indexToSplit = i;
			}
		}		
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeakOnce.indexOf("+", i) < 100 && tts.textToSpeakOnce.indexOf("+", i) > -1 )
					indexToSplit = i;
			}
		}		
		tts.leftOverToSpeakOnce = tts.textToSpeakOnce.substring(indexToSplit);
		tts.textToSpeakOnce = tts.textToSpeakOnce.substring(0,indexToSplit);
		
	}else{
		tts.leftOverToSpeakOnce = "";
	}
	//currentClip.src = "https://www.coglink.com:8080/CR/TTS?"+tts.textToSpeakOnce;
	//currentClip.src = "http://translate.google.com/translate_tts?tl=en&q="+tts.textToSpeakOnce;
	
	if(!tts.offline){
		tts.oncePlayingClip.src = tts.url+tts.textToSpeakOnce;
		console.log("FirstTime:::"+tts.oncePlayingClip.src)
	}else if (!CR.isIOS){
		console.log("THE TEXT TO SPEAK"+tts.textToSpeak);
		tts.leftOverToSpeakOnce = "";
		var src = doPlay(text.replace(/[+]/g," "))
		tts.oncePlayingClip.src = src
	}
	
	//currentClip.crossOrigin = "annonymous";
	
//	currentClip.addEventListener("loadeddata", function() {	
//
//		//audio.stopPlaying();	// stops any playing audio notes
//		currentClip.play();
//		tts.doPlayOnce = true;
//		tts.oncePlayingClip = currentClip;
//	}, false);

	tts.oncePlayingClip.load();
	
//	tts.oncePlayingClip = currentClip;
	// The ended event is not being called, so we loop to check fields.
//	currentClip.addEventListener("playing", function() {
//		
//		setTimeout("tts.checkAudioForSingle()", 1000);
//		
//	}, false);
	
//	currentClip.addEventListener("error", function(e) {	
//		console.log("****************TTS-SPEAKTXT-ERROR****************")
//		console.log(tts.attempts+1)
//		console.log(e)
//		console.log('-=-=-=-=-=')
//		tts.attempts++;
//		
//		if( tts.attempts < 2){
//			tts.url = "https://www.coglink.com:8080/CR/TTS?";
//			currentClip.src = tts.url+tts.textToSpeak;
//			setTimeout("currentClip.load();", 500);
//		}else if( tts.attempts== 3){		
//			tts.url = "TTS?";
//			currentClip.src = tts.url+tts.textToSpeak;
//			setTimeout("currentClip.load();", 500);
//		}else if (tts.attempts == 4){
////			tts.toggleTTS()
////			tts.disabled = true;
//			tts.offline = true;
//			tts.speakText(text)
//		}	
//	}, false);
}

tts.oncePlayingClip.addEventListener("error", function(e) {	
	console.log("****************TTS-SPEAKTXT-ERROR****************")
	console.log(tts.attempts+1)
	console.log(e)
	console.log(tts.url)
	tts.attempts++;
	
	if( tts.attempts == 1){
		setTimeout("tts.oncePlayingClip.load();", 1000);
	}else if( tts.attempts == 2){
		tts.url = "https://www.coglink.com:8080/CR/TTS?";
		tts.oncePlayingClip.src = tts.url+tts.textToSpeakOnce;
		setTimeout("tts.oncePlayingClip.load();", 1000);
	}else if( tts.attempts== 3){		
		tts.url = "TTS?";
		tts.oncePlayingClip.src = tts.url+tts.textToSpeakOnce;
		setTimeout("tts.oncePlayingClip.load();", 1000);
	}else if (tts.attempts == 4 && !CR.isIOS){
//		tts.toggleTTS()
//		tts.disabled = true;
		tts.offline = true;
		tts.speakText(tts.textToSpeakOnce)
	}

	console.log(tts.oncePlayingClip.src)
	console.log('-=-=-=-=-=')
}, false);

tts.oncePlayingClip.addEventListener("loadeddata", function() {	
		console.log("once play loaded")
		//audio.stopPlaying();	// stops any playing audio notes
		tts.oncePlayingClip.play();
		tts.doPlayOnce = true;
//		tts.oncePlayingClip = currentClip;
	}, false);

tts.oncePlayingClip.addEventListener("playing", function() {

	setTimeout("tts.checkAudioForSingle()", 1000);

	}, false);

tts.checkAudioForSingle = function(){
    if( tts.doPlayOnce ){
		clip = tts.oncePlayingClip;
		if( clip.currentTime == 0 || clip != null && clip.currentTime > 0 && clip.currentTime < 30 && !clip.paused && !clip.ended ){
			setTimeout("tts.checkAudioForSingle()", 200);
		}else{
			console.log("ENEDSINGLELJSDF:J:FDJS:")
			console.log(clip != null)
			
			console.log("CurrTime:::"+clip.currentTime)
			console.log(clip.currentTime > 0)
			console.log(clip.currentTime < 30)
			console.log(!clip.paused)
			console.log(!clip.ended)
			
			console.log(clip != null && clip.currentTime > 0 && clip.currentTime < 30 && !clip.paused && !clip.ended)
			console.log("really?")
			tts.doPlayOnce = false;
			if( tts.leftOverToSpeakOnce != "" ){
				tts.speakText(tts.leftOverToSpeakOnce);
			}
		}
    }
}


tts.playWarning = function(){

	currentClip = new Audio();
	
	currentClip.src = "/images/chimes.mp3";
	
	currentClip.addEventListener("loadeddata", function() {	
		currentClip.play();
		tts.doPlayOnce = true;
		tts.oncePlayingClip = currentClip;
	}, false);
	
	currentClip.load();

}










 

/*
 *  Toggle Enable mode or Stop/Cancel of TTS.
 */
tts.toggleTTS = function() {
	
	console.log("TTS TOGGLED");
	
	if( !tts.disabled ){
	
		if( !tts.selectMode && !tts.doPlay ){
		
			tts.paused = false;	

//			if (!CR.isIOS){
				$("#TextToSpeechBtn").attr('class', 'btn btn-info');
//			}else{
//				$("#TextToSpeechBtn").attr('class', 'btn btn-success');				
//			}
			$("#TextToSpeechBtn").html('Click Text to Start');

			tts.selectMode = true;
			$('[data-sara-original]').click(tts.startPlaying);		
			CR.log("starttts", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "", "");

		}else{
			$("#TextToSpeechBtn").html('Start Text-To-Speech');
//			if (!CR.isIOS){
				$("#TextToSpeechBtn").attr('class', 'btn btn-success');
//			}else{
//				$("#TextToSpeechBtn").attr('class', 'btn btn-success');				
//			}

			tts.stopPlaying();
			CR.log("stoptts", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, "", "");
		}
	}
	tts.toggle = !tts.toggle
}



/*
 *  Called when a sentence is clicked on.
 */
tts.startPlaying = function(event) {

	console.log("TTS START PLAYING");
	
	if( tts.selectMode ){
	
		console.log(event.target.getAttribute('data-sara-original'));
		
		if( event.target.getAttribute('data-sara-original') != null ){
		
			$("#TextToSpeechBtn").html('Stop Text-To-Speech');
//			if (!CR.isIOS){
				$("#TextToSpeechBtn").attr('class', 'btn btn-danger');
//			}else{
//				$("#TextToSpeechBtn").attr('class', 'btn btn-danger');				
//			}
			
			tts.selectMode = false;
			$('[data-sara-original]').unbind('click', tts.startPlaying);
			
			tts.doPlay = true;
			tts.playSentence( event.target.getAttribute('data-sara-original') );
		
		
		}else{
		
			if( event.target.parentNode.getAttribute('data-sara-original') != null ){

				$("#TextToSpeechBtn").html('Stop Text-To-Speech');
//				if (!CR.isIOS){
					$("#TextToSpeechBtn").attr('class', 'btn btn-danger');
//				}else{
//					$("#TextToSpeechBtn").attr('class', 'btn btn-danger');				
//				}

				tts.selectMode = false;
				$('[data-sara-original]').unbind('click', tts.startPlaying);

				tts.doPlay = true;
				tts.playSentence( event.target.parentNode.getAttribute('data-sara-original') );		
			}
		}
	
	}
}



/*
 *   Stop playback of TTS or cancel TTS being enabled.
 */
tts.stopPlaying = function() {

	if( tts.selectMode ){
		
		tts.selectMode = false;
		$('[data-sara-original]').unbind('click', tts.startPlaying);
		
	}else{
		try{
			$('#ttscontroller').remove();
		}catch(err){}
		
		tts.doPlay = false;
		if (tts.currPlayingClip) {
			tts.currPlayingClip.pause();
//			tts.currPlayingClip = null;
		}
		if (tts.currPlayingRange) {
			tts.currPlayingRange.css("background-color", "");
			tts.currPlayingRange = null;
		}		
	}
}



tts.pauseTTS = function() {
	
	console.log("TTS PAUSE");
	
	tts.stepping = false;
	tts.firstStep = true;
	
	if( !tts.paused ){
	
		tts.paused = true;
	
		//pause what we are already playing
		if (tts.currPlayingClip) {
			tts.currPlayingClip.pause();
		}
		
		$("#ttsplayimg").attr('src', '/images/tts_play_icon.png');
		$("#ttsstepimg").attr('style', 'display:inline');
	}else{
	
		tts.paused = false;

		if (tts.currPlayingClip) {
			tts.currPlayingClip.play();
			tts.checkTimer = setTimeout("tts.checkIfAudioDone()", 500);
		}
		
		$("#ttsplayimg").attr('src', '/images/tts_pause_icon.png');
		$("#ttsstepimg").attr('style', 'display:none');
	
	}
	
}


tts.repeatTTS = function() {
	
	console.log("TTS REPEAT");
	
	clearTimeout(tts.checkTimer);
	
	if( tts.paused ){
	
		tts.paused = false;
		$("#ttsplayimg").attr('src', '/images/tts_pause_icon.png');
	
	}

	if (tts.currPlayingClip) {
		tts.currPlayingClip.pause();
	}	
	
	//Play the same sentence again.
	tts.playSentence(tts.currPlayingClipId);	
	
}


tts.muteTTS = function() {
	if (CR.isMobile){ return; }
	
	console.log("TTS MUTE");
	
	if( !tts.muted ){
	
		tts.muted = true;
		$("#ttsmuteimg").attr('src', '/images/tts_muteoff_icon.png');

		if (tts.currPlayingClip) {
			tts.currPlayingClip.muted = true;
		}
	}else{
		tts.muted = false;
		$("#ttsmuteimg").attr('src', '/images/tts_muteon_icon.png');	

		if (tts.currPlayingClip) {
			tts.currPlayingClip.muted = false;
		}	
	}
	
	
}


tts.stepTTS = function() {
	
	console.log("TTS STEP");
	
	tts.stepping = true;
	
	tts.paused = false;
	$("#ttsplayimg").attr('src', '/images/tts_pause_icon.png');
	
	if( tts.firstStep ){
	
		if (tts.currPlayingClip) {
			tts.currPlayingClip.play();
		}
		
		tts.firstStep = false;
		
	}else{
		
		try{ clearTimeout(tts.checkTimer); }catch(err){};

		if (tts.currPlayingClip) {
			tts.currPlayingClip.pause();
		}	

		try{
			tts.currPlayingRange.css("background-color", "");
			$('#ttscontroller').remove();
		}catch(err){}
		tts.currPlayingClipId++;
		tts.playSentence(tts.currPlayingClipId);
	
	}
	
}

//clip = new Audio();
//ctr = 0;
//
//tts.playSentence=function(id){
//	console.log("Calling tts.playsentence")
//	
//	clip = $('#hiddenAudio')[0];
//	clip.src = tts.url+"this+works+right";
//	clip.load();
//	
//	clip.addEventListener("loadeddata", function() {	
//		console.log("TTS-playSentence- loadeddata")
//		console.log('-=-=-=-=-=')
//		clip.play();
//	}, false);
//
//	clip.addEventListener('ended', function(){if(ctr<3){tts.playSentence();}ctr++}, false);
//}
/*
 *
 */
tts.playSentence = function(sentenceId) {
	console.log("PLaySentenceURL-=--=-=:::"+tts.url)
	//Skip empty space or invalid ids.
	while( $('[data-sara-original=\"'+sentenceId+'\"]').text().replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, "").length < 1 )
		sentenceId++;
		

console.log("TTS SENTENCE ID: " + sentenceId);	
console.log("TTS SENTENCE TEXT: " + $('[data-sara-original=\"'+sentenceId+'\"]').text());
		
	
	//Prep the audio and sentence to play.
	//$('#controller').show("fast");
	tts.currPlayingClipId = sentenceId;
//	currentClip = tts.currPlayingClip;
	
	
	
	//Highlight:
	//r = sentenceArray[sentenceId];
	//tts.currPlayingRange = new ModifiedRange(false,0,"",r.startContainer, r.startOffset, r.endContainer, r.endOffset+2);
	//tts.currPlayingRange.highlight("#50fc03");
	
	tts.currPlayingRange = $('[data-sara-original=\"'+sentenceId+'\"]');
	//tts.currPlayingRange.highlight("#50fc03");
	tts.currPlayingRange.css("background-color", "#8DB5E9");
	//tts.currPlayingRange.css("background-color", "#86ED57");
	//tts.currPlayingRange.css("background-color", "#50fc03");
	
	
	//Scroll to the text being spoken
	$("#readerPanel").scrollTop( 
			($("[data-sara-original="+tts.currPlayingClipId+"]").offset().top + $("#readerPanel").scrollTop()) - ($("#readerPanel").height()/2)
	);
	
	
	
	
	//Piece together the text that should be spoken
	tts.textToSpeak = "";	
	$("[data-sara-original="+ tts.currPlayingClipId +"]").each(function() {
	    try{	
		tts.textToSpeak += $(this).text();
	    }catch(err){}
	});
	
	
	
	console.log("SPEAK: "+tts.textToSpeak);
	
	var pieces = tts.textToSpeak.replace("iOS", "i O S").replace("\t", " ").replace("\r", " ").replace("\n", " ").replace("\0", " ").replace("e.g.", "For example").replace("&", "and").replace("\_", "").trim().split(" ");
	tts.textToSpeak = pieces[0];
	
	if( tts.textToSpeak.indexOf("_") ==0 && tts.textToSpeak.lastIndexOf("_") == tts.textToSpeak.length-1 ){
		console.log("UNDERSCORES - BLANK LINE");
		tts.textToSpeak = "blank line"	
	}
	
	for(var i=1; i<pieces.length; i++)
		tts.textToSpeak += "+"+pieces[i].trim().replace("&gt;", "").replace("&lt;", "");
	
	//console.log(tts.textToSpeak);
	
	if( tts.textToSpeak.length > 100 ){  
		var indexToSplit = 0;
		for(var i=0; i<100; i++){
			if( tts.textToSpeak.indexOf(",+", i) < 90 && tts.textToSpeak.indexOf(",+", i) > -1 )
				indexToSplit = i;
		}
		for(var i=0; i<100; i++){
			if( tts.textToSpeak.indexOf("(", i) < 100 && tts.textToSpeak.indexOf("(", i) > -1 )
				indexToSplit = i;
		}
			
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeak.indexOf(",+", i) < 100 && tts.textToSpeak.indexOf(",+", i) > -1 )
					indexToSplit = i;
			}
		}
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeak.indexOf(";+", i) < 100 && tts.textToSpeak.indexOf(";+", i) > -1 )
					indexToSplit = i;
			}
		}			
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeak.indexOf(")+", i) < 100 && tts.textToSpeak.indexOf(")+", i) > -1 )
					indexToSplit = i;
			}
		}
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeak.indexOf(":+", i) < 100 && tts.textToSpeak.indexOf(":+", i) > -1 )
					indexToSplit = i;
			}
		}		
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeak.indexOf("+", i) < 100 && tts.textToSpeak.indexOf("+", i) > -1 )
					indexToSplit = i;
			}
		}		
		tts.leftOverToSpeak = tts.textToSpeak.substring(indexToSplit);
		tts.textToSpeak = tts.textToSpeak.substring(0,indexToSplit);
		
		//console.log("leftover: "+tts.leftOverToSpeak);
	}else{
		tts.leftOverToSpeak = "";
	}
		
	if (!tts.offline){
		tts.currPlayingClip.src = tts.url+tts.textToSpeak;
	}else if(!CR.isIOS){
		console.log("THE TEXT TO SPEAK"+tts.textToSpeak);
		tts.leftOverToSpeak = "";
		var src = doPlay($('[data-sara-original=\"'+sentenceId+'\"]').text())
		tts.currPlayingClip.src = src
	}

//	currentClip.addEventListener("error", function(e) {	
//		console.log("TTS-playSentence- ERROR")
//		console.log(e)
//		console.log('-=-=-=-=-=')
//		tts.attempts++;
//		
//		if( tts.attempts < 2){
//			tts.url = "https://www.coglink.com:8080/CR/TTS?";
//			currentClip.src = tts.url+tts.textToSpeak;
//			setTimeout("currentClip.load();", 500);
//		}else if( tts.attempts== 3){		
//			tts.url = "TTS?";
//			currentClip.src = tts.url+tts.textToSpeak;
//			setTimeout("currentClip.load();", 500);
//		}else if (tts.attempts == 4){
////			tts.toggleTTS()
////			tts.disabled = true;
//			tts.offline = true;
//			console.log("SETTING TO CLIENT SIDE TTS")
//			tts.playSentence(sentenceId)
//			alert("Switch To Client Side Text To Speech")
//		}else if( tts.attempts > 4 ){
//			tts.disabled = true;
//			tts.currPlayingRange.css("background-color", "");	
//			$("#TextToSpeechBtn").attr('disabled', 'disabled');
//			$("#TextToSpeechBtn").attr('value', 'Text to Speech Disabled');
//		}
//	
//	}, false);
	
	
//	currentClip.addEventListener("loadeddata", function() {	
//		console.log("TTS-playSentence- loadeddata")
//		console.log('-=-=-=-=-=')
//		
//		if( tts.doPlay ){
//			
//			if( tts.muted ) currentClip.muted = true;
//			
//			currentClip.play();			
//			tts.currPlayingClip = currentClip;
//			//console.log("Done");
//		}
//	}, false);
	
	tts.doPlay = true;
	tts.currPlayingClip.load();
}


tts.checkIfAudioDone = function(){
    
    if( tts.doPlay ){
	clip = tts.currPlayingClip;
	if( clip.currentTime == 0 || clip != null && clip.currentTime > 0 && clip.currentTime < 30 && !clip.paused && !clip.ended ){
		tts.checkTimer = setTimeout("tts.checkIfAudioDone()", 250);
	
	}else if( tts.doPlay && !tts.paused ){

		if( tts.leftOverToSpeak == "" ){
			
			if( !tts.stepping ){
				try{
					tts.currPlayingRange.css("background-color", "");
					$('#ttscontroller').remove();
				}catch(err){}
				tts.currPlayingClipId++;
				tts.playSentence(tts.currPlayingClipId);
			}else{

				tts.paused = true;
				$("#ttsplayimg").attr('src', '/images/tts_play_icon.png');
			}
		}else{
			tts.playLeftoverSentence();
		}
	}
    }
}


tts.playLeftoverSentence = function() {
	
	//$('#controller').show("fast");
//	currentClip = tts.currPlayingClip;
	
	
	//Piece together the text that should be spoken
	tts.textToSpeak = tts.leftOverToSpeak;	
	
	if( tts.textToSpeak.length > 100 ){
		var indexToSplit = 0;
		for(var i=0; i<100; i++){
			if( tts.textToSpeak.indexOf(",+", i) < 90 && tts.textToSpeak.indexOf(",+", i) > -1 )
				indexToSplit = i;
		}
		for(var i=0; i<100; i++){
			if( tts.textToSpeak.indexOf("(", i) < 100 && tts.textToSpeak.indexOf("(", i) > -1 )
				indexToSplit = i;
		}
				
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeak.indexOf(",+", i) < 100 && tts.textToSpeak.indexOf(",+", i) > -1 )
					indexToSplit = i;
			}
		}
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeak.indexOf(";+", i) < 100 && tts.textToSpeak.indexOf(";+", i) > -1 )
					indexToSplit = i;
			}
		}		
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeak.indexOf(")+", i) < 100 && tts.textToSpeak.indexOf(")+", i) > -1 )
					indexToSplit = i;
			}
		}
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeak.indexOf(":+", i) < 100 && tts.textToSpeak.indexOf(":+", i) > -1 )
					indexToSplit = i;
			}
		}			
		if( indexToSplit == 0 ){
			for(var i=0; i<100; i++){
				if( tts.textToSpeak.indexOf("+", i) < 100 && tts.textToSpeak.indexOf("+", i) > -1 )
					indexToSplit = i;
			}
		}			
		tts.leftOverToSpeak = tts.textToSpeak.substring(indexToSplit);
		tts.textToSpeak = tts.textToSpeak.substring(0,indexToSplit);
		
		//console.log("leftover: "+tts.leftOverToSpeak);
	}else{
		tts.leftOverToSpeak = "";
	}
		
	
	tts.currPlayingClip.src = tts.url+tts.textToSpeak;
	
	tts.currPlayingClip.load();

}

tts.currPlayingClip.addEventListener("playing", function() {
	console.log("TTS-playSentence- playing")
	console.log('-=-=-=-=-=')
	
	try{ clearTimeout(tts.checkTimer); }catch(err){};
	tts.checkTimer = setTimeout("tts.checkIfAudioDone()", 1750);

	try{
		$('#ttscontroller').remove();
	}catch(err){}
		
	//Draw play/pause icon by the element.
	var p = $(tts.currPlayingRange).offset();
	var w = $(tts.currPlayingRange).width();
	
	if (CR.isMobile){
		$('body').append("<div id='ttscontroller' style='background:white; border:3px solid #6D95C9; border-radius:20px; position:absolute; top:"+(p.top-45)+"px; left:"+(p.left+w)+"px;'><img id='ttsplayimg' onclick='tts.pauseTTS();' width='40px' src='/images/tts_pause_icon.png'><img id='ttsrepeatimg' onclick='tts.repeatTTS();' width='40px' src='/images/tts_repeat_icon.png'><img id='ttsmuteimg' onclick='tts.muteTTS();' width='40px' src='/images/disable_tts_muteon_icon.png'><img id='ttsstepimg' style='display:"+(tts.stepping?"inline":"none")+";' onclick='tts.stepTTS();' width='40px' src='/images/tts_step_icon.png'></div>");
	}else{
		$('body').append("<div id='ttscontroller' style='background:white; border:3px solid #6D95C9; border-radius:20px; position:absolute; top:"+(p.top-45)+"px; left:"+(p.left+w)+"px;'><img id='ttsplayimg' onclick='tts.pauseTTS();' width='40px' src='/images/tts_pause_icon.png'><img id='ttsrepeatimg' onclick='tts.repeatTTS();' width='40px' src='/images/tts_repeat_icon.png'><img id='ttsmuteimg' onclick='tts.muteTTS();' width='40px' src='/images/tts_mute"+(tts.muted?"off":"on")+"_icon.png'><img id='ttsstepimg' style='display:"+(tts.stepping?"inline":"none")+";' onclick='tts.stepTTS();' width='40px' src='/images/tts_step_icon.png'></div>");
	}
	
	/* The ended event is not being called, so we loop to check fields.
	tts.currPlayingClip.addEventListener("ended", function() {
		tts.currPlayingRange.css("background-color", "");
		tts.currPlayingClipId++;
		tts.playSentence(tts.currPlayingClipId);
	}, false);
	*/
}, false);

tts.currPlayingClip.addEventListener("error", function(e) {	
	console.log("TTS-playSentence- ERROR")
	console.log(e)
	console.log('-=-=-=-=-=')
	tts.attempts++;
	
	if( tts.attempts < 2){
		tts.url = "https://www.coglink.com:8080/CR/TTS?";
		tts.currPlayingClip.src = tts.url+tts.textToSpeak;
		setTimeout("tts.currPlayingClip.load();", 500);
	}else if( tts.attempts== 3){		
		tts.url = "TTS?";
		tts.currPlayingClip.src = tts.url+tts.textToSpeak;
		setTimeout("tts.currPlayingClip.load();", 500);
	}else if (tts.attempts == 4){
	//	tts.toggleTTS()
	//	tts.disabled = true;
		if (CR.isIOS){
			tts.disabled = true;
			tts.currPlayingRange.css("background-color", "");	
			$("#TextToSpeechBtn").attr('disabled', 'disabled');
			$("#TextToSpeechBtn").html('Text to Speech Disabled');
			$('#ttscontroller').remove();
			
		}else{
			tts.offline = true;
			console.log("SETTING TO CLIENT SIDE TTS")
			tts.playSentence(tts.currPlayingClipId)
//			alert("Switch To Client Side Text To Speech")
		}			
	}else if( tts.attempts > 4 ){
		tts.disabled = true;
		tts.currPlayingRange.css("background-color", "");	
		$("#TextToSpeechBtn").attr('disabled', 'disabled');
		$("#TextToSpeechBtn").html('Text to Speech Disabled');
		$('#ttscontroller').remove();
	}

}, false);

tts.currPlayingClip.addEventListener("loadeddata", function() {	
	console.log("TTS-playSentence- loadeddata")
	console.log('-=-=-=-=-=')
	
	if( tts.doPlay ){
		
		if( tts.muted ) tts.currPlayingClip.muted = true;
		
		tts.currPlayingClip.play();
	}
}, false);

