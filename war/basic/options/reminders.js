$(document).ready(function(){
	
	
	$('#spinnerbox').fadeIn("fast");
	
	// use view to initialize complicated, repetitive reminders ones
	// ENCOURAGE PROGRESS
	$("#encourage-progress-fields").append((new ReminderView({message:"I can do this!", name:"icandothis"} )).render().el);
	$("#encourage-progress-fields").append((new ReminderView({message:"This is a step toward my goal", name:"stepgoal"} )).render().el);
	$("#encourage-progress-fields").append((new ReminderView({message:"One day at a time", name:"oneday"} )).render().el);
	$("#encourage-progress-fields").append((new ReminderView({message:"Other", name:"encourage-other"} )).render().el);
	
	// MANAGE SYMPTOMS
	$("#manage-symptoms-fields").append((new ReminderView({message:"Take a deep breath", name:"deepbreath"} )).render().el);
	$("#manage-symptoms-fields").append((new ReminderView({message:"Stretch", name:"stretch"} )).render().el);
	$("#manage-symptoms-fields").append((new ReminderView({message:"Massage my temples and neck", name:"massage"} )).render().el);
	$("#manage-symptoms-fields").append((new ReminderView({message:"Other", name:"manage-other"} )).render().el);

	$.get("/getreminders", function(data){
		var count = 0;
		for(pro in data){

			count ++;
			break;
		}
		if(count > 0){
			
			// loop through reminders and check the ones that have been chosen
			var reminder = null;
			for (var i = 0; i < data.length; i++){
				reminder = data[i];
				if (reminder.name === "total-time") {
					$("#total-time").attr("checked", "checked").nextAll(".fields").first().show();
					$("#total-time"+reminder.time).click();
					continue;
				}
				if (reminder.name === "time-left") {
					$("#time-left").attr("checked", "checked").nextAll(".fields").first().show();
					$("#time-left"+reminder.time).click();
					continue;
				}
				if (reminder.name === "startup-materials") {
					$("#startup-materials").attr("checked", "checked").nextAll(".fields").first().show();
					$("#startup-materials-"+reminder.reminderid).click();
					if (reminder.reminderid === "other") {
						$("#startup-materials-other-text").val(reminder.message)
					}
					continue;
				}
				if (reminder.name === "startup-organize") {
					$("#startup-organize").attr("checked", "checked").nextAll(".fields").first().show();
					$("#startup-organize-"+reminder.reminderid).click();
					if (reminder.reminderid === "other") {
						$("#startup-organize-other-text").val(reminder.message)
					}
					continue;
				}
				if (reminder.reminderid === "review-time") {
					$("#review-time").attr("checked", "checked").nextAll(".fields").first().show();
					$("#review-time-"+reminder.frequency).click();
					continue;
				}
				if (reminder.reminderid === "review-section") {
					$("#review-section").attr("checked", "checked").nextAll(".fields").first().show();
					$("#review-section-"+reminder.frequency).click();
					continue;
				}
				
				if (reminder.name === "temp") {
					// main one
					$("#"+reminder.reminderid).attr("checked", "checked").nextAll(".fields").first().show();
					// see it hear it
					var seeorhearit = "justseeit";
					if (reminder.hearIt) {
						seeorhearit = "seeithearit";
					}
					$("#"+reminder.reminderid+"-"+seeorhearit).attr("checked", "checked").nextAll(".fields").first().show();
					// frequency type
					$("#"+reminder.reminderid+"-"+seeorhearit+"-"+reminder.frequencyType).attr("checked", "checked").nextAll(".fields").first().show();
					// frequency
					$("#"+reminder.reminderid+"-"+seeorhearit+"-"+reminder.frequencyType+"-"+reminder.frequency).attr("checked", "checked").nextAll(".fields").first().show();
				}
				if (reminder.name === "permanent") {
					// main one
					$("#"+reminder.reminderid).attr("checked", "checked").nextAll(".fields").first().show();
					// see it hear it
					var seeorhearit = "justseeit";
					if (reminder.hearIt) {
						seeorhearit = "seeithearit";
					}
					$("#"+reminder.reminderid+"-"+seeorhearit).attr("checked", "checked").nextAll(".fields").first().show();
					// frequency type
					$("#"+reminder.reminderid+"-"+seeorhearit+"-"+reminder.frequencyType).attr("checked", "checked").nextAll(".fields").first().show();
				}
				if(reminder.reminderid != null){
					
					// set the other field for temp and permanent
					if (reminder.reminderid.indexOf("other") !== -1) {
						$("#"+reminder.reminderid+"-text").val(reminder.message);
					}
					// check the parent field for temp and permanent
					if (reminder.reminderid == "icandothis" || reminder.reminderid == "stepgoal"|| reminder.reminderid == "oneday"|| reminder.reminderid == "encourage-other") {
						$("#encourage-progress").attr("checked", "checked").nextAll(".fields").first().show();
					}
					if (reminder.reminderid == "deepbreath" || reminder.reminderid == "stretch"|| reminder.reminderid == "massage"|| reminder.reminderid == "manage-other") {
						$("#manage-symptoms").attr("checked", "checked").nextAll(".fields").first().show();
					}
				}
			}
			
		}		
		
		// reset submit button to be grey
		$("#submitbtn").addClass("disabled");
		$("#submitbtn").removeClass("btn-primary");
		
		$('#spinnerbox').fadeOut("fast");
	});
	//submit btton listener
	$("#submitbtn").click(function(){
		$("#myform").submit(function(event) {
			// Cancels the form's submit action.
			event.preventDefault();
		});
		window.location = "/menu";
	});
	// Reminders Behavior
	$("input.single-input").click(function(){
		if ($(this).attr("checked") == "checked") {
			$(this).nextAll(".fields").first().show();
		} else {
			$(this).nextAll(".fields").first().hide();
		}
	});
	
	// make the button change when they change anything
	$("input").click(function() {
		$("#submitbtn").removeClass("disabled");
		$("#submitbtn").addClass("btn-primary");
	});
	

	// BUTTONS and other stuff

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
	
	$.post("/log", {type: "userreminderspage", strategy: "menus", contentkey: "", sectionkey: "", data1: "", data2: ""});
	
});