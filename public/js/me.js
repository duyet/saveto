$(document).ready(function() {
	$('#reset_accesstoken').click(function(e) {
		$.get(app.base_url + 'me/reset_access_token', function(result) {
			if (!result || !result.access_token) console.log('Reset access_token fail.');
			else {
				$('#access_token_value').text(result.access_token);
				app.user.access_token = result.access_token;
			}
		});
	});
});