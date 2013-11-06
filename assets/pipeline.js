;(function($,exports) {
$(function() {
    "use strict";

    var twS = tiddlyweb.status,
        space = twS.space.name,
        defaultBag = space + '_public',
        defaultTags = ['project'],
        host = '/';

    function submitForm(form) {
        var tiddler = formTiddler(form),
            url = tiddlerURI( host, defaultBag, tiddler.title),
            success,
            error;

            _doPUT(url, tiddler);
    }

    function formTiddler(form) {
        var tiddler = {};

        tiddler = {
            title: $("#inputTitle", form).val(),
            modifier: twS.username,
            tags: defaultTags.concat(getFormTags(form))
        }
        var additionalFields = getFormFields(form);
        tiddler.fields = $.extend({}, additionalFields);
        return tiddler;
    }

    function getFormTags(form) {
        var tags = [];
        $("[data-tag-prefix]").each( function(index, el) {
            var $el = $(el);
            tags.push( $el.data("tag-prefix") + ":" + $el.val() );
        });
        return tags;
    }

    function getFormFields(form) {
        var fields = {};
        $("[data-field-name").each( function(index, el) {
            var $el = $(el);
            if( $el.data("input-type") === "radio" ) {
                var $radio = $("input[type='radio']:checked", $el);
                fields[ $el.data("field-name") ] = $radio.val();
            } else {
                fields[ $el.data("field-name") ] = $el.val();
            }
        });
        return fields;
    }

    function tiddlerURI(host, bag, title) {
        return host + 'bags/'
            + encodeURIComponent(bag)
            + '/tiddlers/'
            + encodeURIComponent(title);
    }

    function _doPUT(url, data, success, error) {
        $.ajax({
            url: url,
            type: 'PUT',
            success: success,
            error: error,
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data)
        });
    }

    function add_init() {
        $.ajaxSetup({
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-ControlView", "false");
            }
        });
        //check hash and fill in form if necessary

        $('form').on('submit', function(ev) {
            ev.preventDefault();
            submitForm( ev.currentTarget );
        });
    }

    function pipe_init() {}

    exports.pipeline = {
        add_init: add_init,
        pipe_init: pipe_init
    };
});
}(jQuery, window));
 