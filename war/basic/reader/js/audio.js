var audio = audio || {}; // the audio namespace

audio.playingAudioClip;
audio.playingNoteId;

audio.playAudioWithId = function(id){
	// stop TTS first; don't want dueling sound clips playing
	tts.stopPlaying();
	if (audio.playingAudioClip) {
		audio.playingAudioClip.pause();
		audio.stopAudio(audio.playingNoteId);
	}
	console.log("Trying to play an audio clip with id " + id);
	$("[audiobuttonid="+id+"]").css('backgroundImage','url(/images/loading_animated_32.gif)');
	var clip = new Audio();
	clip.src = "/audio?id=" + id;
	clip.load();
	clip.addEventListener("loadeddata", function() {
		audio.playingAudioClip = clip;
		audio.playingNoteId = id;
		$("[audiobuttonid="+id+"]").css('backgroundImage','url(/images/pause.png)');
		$("[audiobuttonid="+id+"]").attr("href", "javascript:audio.pauseAudio();");
	    clip.play();
	}, false);
	clip.addEventListener("ended", function() {
		audio.stopAudio(id);
	}, false);
	console.log("done with playAudioWithId");
}

audio.pauseAudio = function(){
	if (audio.playingAudioClip) {
		audio.playingAudioClip.pause();
		$("[audiobuttonid="+audio.playingNoteId+"]").css('backgroundImage','url(/images/play.png)');
		$("[audiobuttonid="+audio.playingNoteId+"]").attr("href", "javascript:audio.resumeAudio();");
	}
}

audio.resumeAudio = function(){
	tts.stopPlaying();
	if (audio.playingAudioClip) {
		audio.playingAudioClip.play();
		$("[audiobuttonid="+audio.playingNoteId+"]").css('backgroundImage','url(/images/pause.png)');
		$("[audiobuttonid="+audio.playingNoteId+"]").attr("href", "javascript:audio.pauseAudio();");
	}
}

audio.stopAudio = function(id){
	audio.playingAudioClip = null;
	$("[audiobuttonid="+id+"]").css('backgroundImage','url(/images/play.png)');
	$("[audiobuttonid="+audio.playingNoteId+"]").attr("href", "javascript:audio.playAudioWithId(" + id + ");");
	audio.playingNoteId = null;
}

audio.stopPlaying = function(){
	if (audio.playingAudioClip && audio.playingNoteId) {
		audio.playingAudioClip.pause();
		audio.stopAudio(audio.playingNoteId);
	}
}