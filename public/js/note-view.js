ace.define("quick/note/review", ["require", "ace/ext/static_highlight"],
    function(require, modelist) {
        var highlight = ace.require("ace/ext/static_highlight")
        var dom = ace.require("ace/lib/dom")

        function qsa(sel) {
            return Array.apply(null, document.querySelectorAll(sel));
        }

        qsa(".quick-note-review").forEach(function(codeEl) {
            highlight(codeEl, {
                mode: codeEl.getAttribute("ace-mode"),
                theme: codeEl.getAttribute("ace-theme"),
                startLineNumber: 1,
                showGutter: codeEl.getAttribute("ace-gutter"),
                trim: true,
                fontSize: "18px"
            }, function(highlighted) {
            	
            });
        });
    });

jQuery(document).ready(function($) {
    $('time').each(function() {
        var time = $(this).text();
        if (time) $(this).text(moment(new Date(time)).fromNow());
    });

    ace.require(["quick/note/review"], function() {});
});
