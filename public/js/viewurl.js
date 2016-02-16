$(document).ready(function() {
	initial();

	// Fix long title
	var link_title = $('#link-title').text();
	if (link_title) {
		var new_title = link_title;
		if (new_title.indexOf('raw.githubusercontent.com') > -1) {
			new_title = new_title.replace('http://', '');
			new_title = new_title.replace('https://', '');
			new_title = new_title.replace('raw.githubusercontent.com/', '');

			$('#link-title').text(new_title);
		}
	}

	// Markdown render 
	var md;
	if (marked && (md = $('#md2html')).length) {
		var md_url = md.data('md-url');
		if (md_url) {
			$.get(md_url, function(data) {
				if (!data) return false;
				md.html(marked(data));
			});
		}
	}

	// Share
	$('.share-this').click(function() {
		var share_url = $(this).data('url');
		alertify.prompt("share this via URL", share_url).set('onok', function(closeEvent) {
			if (0 == closeEvent.index) {
				copy(share_url, function(err) {
					if (!err) return alertify.message("Copied!");	
				});
			}
		});
	});

	// ==============================
	function initial() {
		// Fix page width
		$('.container').css({maxWidth: '66rem'});

		// Tooltip
        $('[data-toggle="tooltip"]').tooltip();

		// Detect Ctrl press
		$(document).keydown(function(e) {
			if (e.which == '17') ctrlPressed = true;
		});
		$(document).keyup(function() {
			ctrlPressed = false;
		});
		var ctrlPressed = false;

		// Clipboard 
		var clipboard = new Clipboard('.short_url_item');
		clipboard.on('success', function(e) {
		    if (ctrlPressed) {
		        window.location = e.text;
		        return true;
		    }

		    alertify.message("Copied!");
		});
		clipboard.on('error', function(e) {
		    alertify.message("ops, using right click > copy.");
		});

		// Moment
		if (moment) {
			$('.created').html(moment($('.created').text()).fromNow())
		}
	}
});
