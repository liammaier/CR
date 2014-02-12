/**OVERWRITTEN BOOSTRAP JQUERY AND BACKBONE STUFF**/
Backbone.View.prototype.destroyView = function() {
//COMPLETELY UNBIND THE VIEW
    this.undelegateEvents();

    this.$el.removeData().unbind(); 

    //Remove view from DOM
    this.remove();  
    Backbone.View.prototype.remove.call(this);
};

if (!XMLHttpRequest.prototype.sendAsBinary) {
  XMLHttpRequest.prototype.sendAsBinary = function (sData) {
    var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
    for (var nIdx = 0; nIdx < nBytes; nIdx++) {
      ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
    }
    /* send as ArrayBufferView...: */
    this.send(ui8Data);
    /* ...or as ArrayBuffer (legacy)...: this.send(ui8Data.buffer); */
  };
}
$.fn.modal.Constructor.prototype.enforceFocus = function () {};

/** END OF OVERWRITTEN BOOSTRAP JQUERY AND BACKBONE STUFF**/

CRImport = {};
$(document).ready(init);

CRImport.numEditors = 1;
CRImport.textParagraphs = false;
CRImport.importing = false;

function init(){
    //event handler and delegator
	CRImport.events = _.extend({}, Backbone.Events);
	CRImport.welcomeView = new CaretWelcomeView();
	$('body').html(CRImport.welcomeView.render().el);
	
    //get all of the caret content
	
	if(CRImport.textParagraphs == true){
		//use brs instead
		CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
	}
    $.ajax({
    	type: "GET",
    	url:"/getCaretBook",
    	success:function(data){
    		CRImport.bookData = new BookCollection(data)
    		
    		//if we don't already have a book show them the selector
    		if(data.length == 0 ){
    			var allEmpty = _.every(data,function(chapter){
    				return chapter == 0;
    			})
    			if(allEmpty){
	    			//show the add content view but don't allow dismissal
	    			if(CRImport.mainView){
	    				CRImport.mainView.newUser();
	    			}else{
	    				//set the flag for new user so that the main view will know
	    				CRImport.newUser = true;
	    			}
    			}
    		}
    		CRImport.welcomeView.setReady();
    	},
    	error:function(data,a,b){
    		console.error("server failed to get caret content, BAD SERVER!!")
    	},
    	dataType:"json",
    });
	
}
CRImport.startCaret = function(){
	CRImport.mainView = new CRImportView({newUser:CRImport.newUser});
	
	//in case things load out of order
	if(CRImport.mainView != null){
		$('body').html(CRImport.mainView.render().el);
//		CRImport.mainView.contentView.forceHTML();
	}else{
		setTimeout(function(){
			$('body').html(CRImport.mainView.render().el);
		},1000);
	}
	//$('body').append(CRImport.contentSelector.render().el);
};
CRImport.validURL = function(url){
	if(/^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url)) {
		return true;
	} else {
		return false;
	}
};