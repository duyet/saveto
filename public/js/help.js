$(document).ready(function () {
	if ($('#bookmarkletform')) updateBookmarkletCode();
	$('#bookmarkletform').change(updateBookmarkletCode);

	function updateBookmarkletCode() {
		var is_auto = $("[name=auto_save]:checked").length;
		var bookmark_name = $('#bookmark_name').val();

		var code = "javascript:(function(w,e,a){w.location='"+ app.basepath +"/add?url=' + e(document.location)+'&title=' + e(document.title)+'&auto='+a})(window,encodeURIComponent,"+ is_auto +")";
		$('#card-bookmarklet-content').text(code);
		$('.card-bookmarklet-link').attr('href', code).text(bookmark_name);
	
	}
})