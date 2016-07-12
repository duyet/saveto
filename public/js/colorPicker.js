$.fn.colorPicker = function() {
	var that = this;
	this.on('click', 'li', function(event) {
		event.preventDefault();
		
		that.find('.active').removeClass('active');
		$(this).addClass('active');
	});

	return this;
};