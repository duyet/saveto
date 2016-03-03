ace.define("quick/note", ["require", "ace/ext/modelist"], 
	function(require, modelist) {
	var editor = ace.edit("quick-note-editor");

	editor.setTheme('ace/theme/github');
	editor.session.setMode("ace/mode/html");
	editor.setAutoScrollEditorIntoView(true);
	editor.setOption("minLines", 20);
	editor.setOption("maxLines", Infinity);
	editor.setHighlightActiveLine(false);
	editor.setShowPrintMargin(false);
	editor.resize();
	
	// Fix text size
	document.getElementById('quick-note-editor').style.fontSize='16px';

	// Trick, get form data from ace editor
	var note_content = $('input[name="note_content"]');
	editor.getSession().on("change", function () {
        note_content.val(editor.getSession().getValue());
    });

	// Auto syntax
	$('#note_title').on('change', function() {
		var mode = modelist.getModeForPath($(this).val()).mode;
		console.log('mode', mode);
		editor.session.setMode(mode);
	});
});

(function() {
    ace.require(["quick/note"], function() {});
})();
