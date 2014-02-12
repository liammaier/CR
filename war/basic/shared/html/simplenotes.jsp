<html>

	<head>
		<!-- Stylesheets -->
		<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.css" />

		<!-- Scripts -->
		<script src="/lib/jquery-1.7.2.min.js"></script>
		
		<script>

			$(function(){
				var ta = $("#textarea");
				ta.focus();

				// retrieve old notes

				$.getJSON("/get_simplenotes", {}, function(json){

					if (json[0] != null){ 
						ta.text(json[0].notes);
					} 

					// initalize normal checking 
					var taText = ta.val();
					
					// every 5 seconds, see if there's a change and send to server if there is
					setInterval (function (){
						
						if (taText != ta.val()) {
							taText = ta.val();

							$.post("/add_simplenotes", {
								notes: taText, 
							}); 

						}

					}, 5000);
				});



			});


		</script>


	</head>

	<body>


		<textarea id="textarea" style="height: 100%; width: 100%">Enter your notes here...</textarea>
		

	</body>

</html>