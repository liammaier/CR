$(document).ready(function() {
	$('#calendar').fullCalendar({
        // put your options and callbacks here
		height: 400,
		weekMode: "liquid",
		selectable: true,
		showing: false,
		
		events: {
    	   url: '/getAssignments',
           type: 'POST',
           data: {
               id: "" + getURLParameter("lib"),
               type: "calendarEvents",
           },
           editable: false,
        },
		
        eventClick: function(calEvent, jsEvent, view) {
        	
        	var getContent = function() {
        		if(calEvent.reminder){
        			return calEvent.description + "<br><br><br><div class='bottom-right'>" +
						"<i class='reminderText'>Reminder set!</i></div>";
        		}else {
        			return calEvent.description + "<br><br><br><div class='bottom-right'>" +
						"<input id='" + calEvent.id + "' type='button' class='btn btn-mini btn-success reminderBtn' value='Set Reminder'/></div>"; 
        		}
        	};

	       	// Make a popover for showing the data
        	if($(this).data("popover") == null){
        		$(this).popover({title: calEvent.title + "<div class='x-close'>x</div>", placement: "top", trigger: "manual",
    	    		content: function() { return getContent; }});
        		
        	}
        	if(calEvent.showing){
        		$(this).popover("hide");
        	}else {
        		$(this).popover("show");
        	}
        	calEvent.showing = !calEvent.showing;

	    },
	    
	    dayClick: function(date, allDay, jsEvent, view) {
			
	    },
		
    });
})