$(document).ready(function () {
	if ($('#bookmarkletform')) updateBookmarkletCode();
	$('#bookmarkletform').change(updateBookmarkletCode);

	function updateBookmarkletCode() {
		var is_auto = $("[name=auto_save]:checked").length;
		var bookmark_name = $('#bookmark_name').val();
		var bookmark_newwindow = $('[name=bookmark_newwindow]:checked').length;

		var quick_url = "'" + app.basepath + "/add?url=' + e(d.location)+'&title=' + e(d.title)+'&auto=' + a";
		var code = "javascript:(function(w,d,e,a){var u = "+ quick_url +";w." + (bookmark_newwindow ? 'open(' : 'location=') + "u"+ (bookmark_newwindow ? ')' : '') +";})(window, document, encodeURIComponent, "+ is_auto +")";
		$('#card-bookmarklet-content').text(code);
		$('.card-bookmarklet-link').attr('href', code).text(bookmark_name);
	
	}
})