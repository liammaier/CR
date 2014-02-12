$(document).ready(function(){
	
	$('#spinnerbox').fadeIn("fast");
	
	$.get("/getoptions", function(data){
		var count = 0;
		for(pro in data){

			count ++;
			break;
		}
		if(count > 0){

			var option;
			for (var i = 0; i < data.length; i++){
				option = data[i];
				
				if (option.data != "") {
					$("#"+option.name).val(option.data);
				} else {
					$("#"+option.name).attr("checked", "checked");
				}
					
				

			}	
		}	
		
		// reset submit button to be grey
		$("#submitbtn").addClass("disabled");
		$("#submitbtn").removeClass("btn-primary");
		
		$('#spinnerbox').fadeOut("fast");
	});
	
	// make the button change when they change anything
	$("input").change(function() {
		$("#submitbtn").removeClass("disabled");
		$("#submitbtn").addClass("btn-primary");
	});
	$("select").change(function() {
		$("#submitbtn").removeClass("disabled");
		$("#submitbtn").addClass("btn-primary");
	});
	
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
		resizeElements();
	});

	resizeElements();
	
	$.post("/log", {type: "useroptionspage", strategy: "menus", contentkey: "", sectionkey: "", data1: "", data2: ""});
	
});