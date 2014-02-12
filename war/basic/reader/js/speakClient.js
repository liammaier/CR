  function playHTMLAudioElement(wav) {
    function encode64(data) {
      var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      var PAD = '=';
      var ret = '';
      var leftchar = 0;
      var leftbits = 0;
      for (var i = 0; i < data.length; i++) {
        leftchar = (leftchar << 8) | data[i];
        leftbits += 8;
        while (leftbits >= 6) {
          var curr = (leftchar >> (leftbits-6)) & 0x3f;
          leftbits -= 6;
          ret += BASE[curr];
        }
      }
      if (leftbits == 2) {
        ret += BASE[(leftchar&3) << 4];
        ret += PAD + PAD;
      } else if (leftbits == 4) {
        ret += BASE[(leftchar&0xf) << 2];
        ret += PAD;
      }
      return ret;
    }

//    var someClip = new Audio();
//    someClip.src = "data:audio/x-wav;base64,"+encode64(wav)
//    someClip.load();
//    someClip.play();
    return "data:audio/x-wav;base64,"+encode64(wav)
    // document.getElementById("audio").innerHTML=("<audio id=\"player\" src=\"data:audio/x-wav;base64,"+encode64(wav)+"\">");
    // document.getElementById("player").play();
  }

  function parseWav(wav) {
    function readInt(i, bytes) {
      var ret = 0;
      var shft = 0;
      while (bytes) {
        ret += wav[i] << shft;
        shft += 8;
        i++;
        bytes--;
      }
      return ret;
    }
    if (readInt(20, 2) != 1) throw 'Invalid compression code, not PCM';
    if (readInt(22, 2) != 1) throw 'Invalid number of channels, not 1';
    return {
      sampleRate: readInt(24, 4),
      bitsPerSample: readInt(34, 2),
      samples: wav.subarray(44)
    };
  }
  
  function handleWav(wav) {
    var startTime = Date.now();
    var data = parseWav(wav); // validate the data and parse it
    // TODO: try playAudioDataAPI(data), and fallback if failed
    return playHTMLAudioElement(wav);
//    if (1) console.log('speak.js: wav processing took ' + (Date.now()-startTime).toFixed(2) + ' ms');
  }

  function doPlay(txt){
    var wav = generateSpeech(txt, {amplitude: 150, wordgap: 4, pitch: 20, speed: 185})
    console.log(wav)
    var src = handleWav(wav)
    return src
  }