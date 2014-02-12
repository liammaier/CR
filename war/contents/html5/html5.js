$(document).ready(function() {
	$('.codeimage').mouseover(function() {
		$(this).attr('title', 'Click to view code');
	});
	$('.codeimage').hover(
		function() { $(this).addClass("codeimagehover"); },
		function() { $(this).removeClass("codeimagehover"); }
	);

	$('.codeimage').click(function() {
		$(this).parents('.hiddencode').find('.modal-body').html("<textarea readonly>"+$(this).parents('.hiddencode').find('.modal-body').text()+"</textarea>");
		$(this).parents('.hiddencode').find('.modal').modal('show');
	});	
	
	$('body').on('shown', '.modal', function () {
  	$(document).off('focusin.modal');
	});

});