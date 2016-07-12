$.fn.colorPicker = function(options) {
	this.html('<ul class="color-picker">\
		<li class="active"></li>\
		<li class="green"></li>\
		<li class="blue"></li>\
		<li class="orange"></li>\
		<li class="red"></li></ul>');
	
	var onChangeColor = options.onChange || function () {}; 

	var that = this;
	this.on('click', 'li', function(event) {
		event.preventDefault();
		
		var currentColor = $(this).attr('class');
		// .atrr('data-color', currentColor);
		$(this).parent().attr('data-color', currentColor);
		that.find('.active').removeClass('active');
		$(this).addClass('active');

		onChangeColor(currentColor);
	});

	return this;
};