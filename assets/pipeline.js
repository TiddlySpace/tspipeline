;(function($,exports) {
$(function() {
    "use strict";

    var twS = tiddlyweb.status,
        space = twS.space.name,
        defaultBag = space + '_public',
        defaultTags = ['project'],
        host = '/',
        $submitEl = undefined;

    function submitSucess() {
        $submitEl
            .addClass('success')
            .text("successfully added")
            .fadeOut(4000);
    }

    function submitError() {
        $submitEl
            .addClass('error')
            .text("there was an error whilst submitting")
            .fadeOut(4000);
        // other tasks that need doing on error....
    }

    function submitForm(form) {
        var tiddler = formTiddler(form),
            url = tiddlerURI( host, defaultBag, tiddler.title);

            _doPUT(url, tiddler, submitSucess, submitError);
            // should probably use deferreds to ensure both notes and project
            // details are put successfully
            noteTiddler(tiddler.title, form);
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

    function noteTiddler(title, form) {
        var note_title = title + "_notes",
            url = tiddlerURI( host, defaultBag, note_title );

        var note_tiddler = {
            title: note_title,
            modifier: twS.username,
            tags: ["note"],
            text: $("#notesText", form).val()
        };

        _doPUT(url, note_tiddler);
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

    function fetchProjects( callback ) {
        $.getJSON("/tiddlers.json?select=tag:project&fat=1&render=1", function(resp) {
            if(resp) {
                callback(resp);
            }
        });
    };

    function displayProjects(projects) {
        var projecttmpl = Handlebars.compile( $("#project-card-template").html() );
        $.each(projects, function(ind, item) {
            var data = {
                title: item.title,
                lead: item.fields.lead,
                sponsor: item.fields.gs_sponsor
            };
            var compdata = resolveMachineTags(item.tags, data);
            $( projecttmpl( compdata ) ).appendTo("section." + compdata.mat);
        });
    }

    function resolveMachineTags(tags, data) {
        $.each(tags, function(ind, item) {
            if(item.indexOf(":") !== -1) {
                var parts = item.split(":");
                data[parts[0]] = parts[1];
            }
        })
        return data;
    }

    function performFilter(filter) {
        var $projects = $(".project", ".wrapper");
        $projects
            .removeClass("active")
            .filter(function(index) {
                return $(this).find(".origin a").attr("href") === "#"+filter;
            })
            .addClass("active");
        $(".filter-switch").show();
    }

    function add_init() {
        $.ajaxSetup({
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-ControlView", "false");
            }
        });
        //check hash and fill in form if necessary

        $submitEl = $(".submit-msg", "form");

        $('form').on('submit', function(ev) {
            ev.preventDefault();
            $submitEl
                .removeClass()
                .addClass("submit-msg")
                .text( "submitting....")
                .fadeIn('fast');
            submitForm( ev.currentTarget );
        });
    }

    function pipe_init() {
        // fetch and render project cards
        fetchProjects( displayProjects );

        // handler to watch for origin filters
        $(".wrapper").on("click", ".origin a" , function(ev) {
            performFilter( $(ev.currentTarget).text() );
        });

        // handler to watch for filters to be removed
        $(".filter-switch").on("click", function() {
            $(".project", ".wrapper").addClass("active");
        });
    }

    exports.pipeline = {
        add_init: add_init,
        pipe_init: pipe_init
    };
});
}(jQuery, window));
 