$(document).ready(function() {
	$("#clearL").click(function(){
		
		if(confirm("Are you sure you want to delete all logs for all users!?")){
			$.post("/admin/clearlogs",function(){
				alert("All logs have been successfully deleted");
			});
		}
	});
	$("#clearuserdata").click(function(){
		
		if(confirm("Are you sure you want to delete all Logs ,Feed Data, Notes, Simple Notes, Strategy Data, Answers, and Note Ignores?!")){
			if(confirm("Are you REALLY SURE you want to delete all Logs ,Feed Data, Notes, Simple Notes, Strategy Data, Answers, and Note Ignores?!")){
				$.post("/admin/clearuserdata",function(){
					alert("All Logs,Feed Data, Notes, Simple Notes, Strategy Data, Answers, and Note Ignores have been successfully deleted.");
				});
			}
		}
	});
	$("#clearResources").click(function(){
		
		if(confirm("Are you sure you want to delete all LIBRARIES, Resources, Content, Sections, and Glossary items??!")){
			if(confirm("Are you REALLY SURE you want to delete all LIBRARIES, Resources, Content, Sections, and Glossary items??!")){
				$.post("/admin/clearresources",function(){
					alert("All Libraries, Resources, Content, Sections, and Glossary items have been successfully deleted.");
				});
			}
		}
	});
	$("#clearUsers").click(function(){
		
		if(confirm("Are you sure you want to delete all Users, Libraries, UserLibraryRoles, and Options??!")){
			if(confirm("Are you REALLY SURE you want to delete all Users, Libraries, UserLibraryRoles, and Options??!")){
				$.post("/admin/clearusers",function(){
					alert("All Users, Libraries, UserLibraryRoles, and Options have been successfully deleted.");
				});
			}
		}
	});
	$("#cleareverything").click(function(){
		
		if(confirm("Are you sure you want to delete EVERYTHING??!")){
			if(confirm("Are you REALLY SURE you want to delete Everything???!")){
				$.post("/admin/cleareverything",function(){
					alert("Everything has been successfully deleted.");
				});
			}
		}
	});
	
	$("#addBasic").click(function(){
		
		if(confirm("Are you sure you want to add basic data")){
			$.post("/admin/addbasicdata",function(){
				alert("Basic data has been added. Click Add All Resources to add resources.");
			});
		}
	});
	
	$("#addResources").click(function(){
		
		$("#xmldiv").load("/contents/contentmap.xml", function(){
			
			// recursively process reources
			processResource(true, $("resource").first(), null, null, null)
			
		});
	});
	
});

function processResource (newbook, book, i, chapter, args) {
	
	// if we're starting a new resource
	if (newbook) {
		// check if it's an article or a book
		if (book.length && $(book).attr("type") === "article") {
			// PROCESS ARTICLE
			
			var args = {};
			args["resourceName"] = $(book).attr("name");
			args["resourceType"] = $(book).attr("type");
			args["resourceDescription"] = $(book).attr("description");
			args["resourceUrl"] = "/contents/" +$(book).attr("id")+"/"+$(book).attr("id")+".html";
						
			// load document
			$('#contnetdiv').load(args["resourceUrl"], function() {
				// SECTIONS
				var sendsections = new Array();
				$("#contnetdiv section[data-number]").each(function(i) {
					var issubsection = false;
					if($(this).hasClass("subsection")){
						issubsection = true;
					}
					sendsections[i] = {sectionNumber: $(this).data("number") + "", name: $(this).data("name") + "", subsection: issubsection};
				});
				args["sections"] = JSON.stringify(sendsections);	
				
				// GLOSSARY
				var glossaryItems = {};
				var glossaryOrder = {};
				var order = 0;
				$("#contnetdiv aside dl").each(function() {
					var name = $(this).find("dt span").html();
					var desc = $(this).find("dd span").html();
					glossaryItems[name] = desc;
					glossaryOrder[name] = order++;
				});
				args["glossaryitems"] = JSON.stringify(glossaryItems)
				args["glossaryorder"] = JSON.stringify(glossaryOrder)
				
				// PAGE AND SECTION COUNT
				args["articlepages"] = $("#contnetdiv .pagebreak").length;
				args["articlesections"] = $("#contnetdiv section[data-number]").length;
				
				// SEND TO SERVER
				$.post("/addresource", args, function(data){
					// Get back an array of IDs of the content. 
					console.log(data);
				});
				
				// call the next resource
				processResource(true, book.next(), null, null, null)
			});
			
		} else if (book.length && $(book).attr("type") === "book"){
			// PROCESS BOOK
			
			var args = {};
			args["resourceName"] = $(book).attr("name");
			args["resourceType"] = $(book).attr("type");
			args["resourceDescription"] = $(book).attr("description");
			args["resourceUrl"] = $(book).attr("id");
			
			console.log("STARTING RESOURCE: " + args["resourceName"]);
			
			// recurse to call chapters. call on first chapter
			processResource (false, book, 0, $(book).children().first(), args)
			
		}
		 		
	} else if (chapter.length) { // if it's not a new book, see if the chapter isn't empty
		// PROCESS CHAPTER
		
		args["chaptername"+i] = $(chapter).attr("name");
		args["desc"+i] = $(chapter).attr("description");
		args["url"+i] = "/contents/"+$(chapter).parent().attr("id") +"/" + $(chapter).attr("id")+".html";
		
		console.log(args["resourceName"] + " - - " + args["desc"+i]);
		
		// Load chapter
		$('#contnetdiv').load(args["url"+i], function() {
			
			// ADD SECTION DATA
			var sendsections = new Array();
			$("#contnetdiv section[data-number]").each(function(n) {
				var issubsection = false;
				if($(this).hasClass("subsection")){
					issubsection = true;
				}
				sendsections[n] = {sectionNumber: $(this).data("number") + "", name: $(this).data("name") + "", subsection: issubsection};
			});
			args["sections"+i] = JSON.stringify(sendsections);		
			
			// ADD GLOSSARY DATA
			var glossaryItems = {};
			var glossaryOrder = {};
			var order = 0;
			$("#contnetdiv aside dl").each(function() {
				var name = $(this).find("dt span").html();
				var desc = $(this).find("dd span").html();
				glossaryItems[name] = desc;
				glossaryOrder[name] = order++;
			});
			args["glossaryitems"+i] = JSON.stringify(glossaryItems)
			args["glossaryorder"+i] = JSON.stringify(glossaryOrder)	
			
			//PAGES AND SECTION COUNT
			args["pages"+i] = $("#contnetdiv .pagebreak").length;
			args["sectioncount"+i] = $("#contnetdiv section[data-number]").length;
					
			// recursively call next chapter
			i ++;
			args = processResource(false, book, i, chapter.next(), args)
			
			return args;
		});
	} else {
		// if it's not a new book and we've gone through all the chapters, then send to the server
		
		// SEND TO SERVER
		var finished = args["resourceName"];
		$.post("/addresource", args, function(data){
			// Get back an array of IDs of the content. 
			console.log("FINISHED RESOURCE: " + finished);
		});
		
		// call next book
		processResource(true, book.next(), null, null, null)
	}
}
