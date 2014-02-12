function parsePartOfSpeech(text, lookfor, upperBound)
{
	var curString = "";

	var indexOfVerb  = text.indexOf('<span class="mw-headline" id="' + lookfor + '">' + lookfor + '</span>');
	if ((indexOfVerb >= upperBound) && (upperBound != -1)){
		return curString;
	}
	if (indexOfVerb != -1){
//		for (var i = indexOfVerb; i < text.length; i++){
//			curString += text[i];
//			if (text[i] == '>'){
//				if (text.substr(i-4,5) == '</ol>'){
//					return curString;
//				}
//			}
//		}
		return text.split("").splice(indexOfVerb, text.indexOf('</ol>') - indexOfVerb).join("");
	}
	return curString;
}
//
function parseAllPartOfSpeech(el, sectionEnds){
	var definition = "";
	definition += parsePartOfSpeech(el, "Verb", sectionEnds);
	definition += parsePartOfSpeech(el, "Noun", sectionEnds);
	definition += parsePartOfSpeech(el, "Adjective", sectionEnds);
	definition += parsePartOfSpeech(el, "Adverb", sectionEnds);
	definition += parsePartOfSpeech(el, "Pronoun", sectionEnds);
	definition += parsePartOfSpeech(el, "Preposition", sectionEnds);
	definition += parsePartOfSpeech(el, "Conjunction", sectionEnds);
	definition += parsePartOfSpeech(el, "Interjection", sectionEnds);
	return definition
}



//'<button id="dict-singular" type="button" class="btn btn-primary" style="display: none;"></button>' +

function setSingularButton(text, plural){
	// find the beginning of the singular
	console.log("plural: " + plural)
	var index = plural
	while (text[index] != ">"){
		index++;
	}
	if (text[index+1] == "<"){
		index++
		while (text[index] != ">"){
			index++;
		}
	}
	index++;
	
	text = [text.slice(0, index), '<button id="dict-singular" type="button" class="btn btn-primary">', text.slice(index)].join('');

	index += 65;
	while (text[index] != "<"){
		index++;
	}
	
	text = [text.slice(0, index), '</button>', text.slice(index)].join('');
	
	return text
}

var dictionary = Backbone.Model.extend({
	baseURL : 'https://en.wiktionary.org',
	
	defaults: function() {
		return {
			word: "",
		}
	},
	
	// parses content from wikdicationary.org
	getPage: function(newWord){		
		this.word = newWord;
		
		// log the word
		CR.log("dictionary", CR.getCurrentStrategy(), CR.contentID, CR.getCurrentSection().id, newWord, "");
		CR.sendLogs();
		
		// get the wiki page and replace dict-body when loaded
		$.getJSON(this.baseURL+'/w/api.php?action=parse&format=json&prop=text|revid|displaytitle&callback=?&page='+newWord,
		function(json) {
			if (json.parse == null){
				$("#dict-bodyinner").html("Word Not Found.");
			}else if(json.parse.revid > 0) {
				var el = json.parse.text["*"];
					el = el.replace(/<[\/]{0,1}(a)[^><]*>/g,"").replace(/edit/g,"").replace(/\[/g,"").replace(/\]/g,"");
				
				var definition = "";
				var sectionStarts = el.indexOf('<h2><span class="mw-headline" id="English">English');
				var sectionEnds = el.indexOf('<h2>', sectionStarts+1);
//				
//				console.log(sectionStarts + " " + sectionEnds)
//				if (sectionEnds != -1){
//					for (var i = sectionStarts; i < sectionEnds; i++){
//						definition += el[i];
//					}
//				}else{
//					for (var i = sectionStarts; i < el.length; i++){
//						definition += el[i];
//					}
//				}
				definition = parseAllPartOfSpeech(el, sectionEnds);
				if (definition != ""){
					//console.log(definition)
					
					var pluralIndex = definition.indexOf("Plural form of");

					if (definition.indexOf("Plural form of") != -1){
						definition = setSingularButton(definition, pluralIndex);
					}
					$("#dict-bodyinner").html(definition);
				}else{
					$("#dict-bodyinner").html("Word Not Found.");
				}
				

			}
		});
	},

	clear: function() {
        this.destroy();
    },
});