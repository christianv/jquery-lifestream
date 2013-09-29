(function($) {
  $.fn.lifestream.feeds.rss = function( config, callback ) {

    var template = $.extend({},
      {
        posted: '${action} <a href="${link}">${title}</a>'
      },
      config.template),
      host = '',
      domain = '',

    addStyle = function() {
      if (config.favicon === true) {
        return;
      }

      var classname = config._settings.classname + '-' + domain,
        favicon = (typeof config.favicon === 'string') ? config.favicon : '' +
          'https://plus.google.com/_/favicon?domain=' + host,
        styleId = config._settings.classname + '-styles',
        $style = $('#' + styleId),
        css = '.' + classname +
          '{background-image:url("' + favicon + '")}';

        if(!$style.length) {
          $style = $('<style id="' + styleId + '" type="text/css" />');
          $('head').append($style);
        }

        $style.text( $style.text() + css + "\n");
    },

    getHost = function(){
      var a = document.createElement('a');

      a.href = config.url;
      host = a.hostname;
    },

    getDomain = function() {
      var matches = host.match(/[\w-]+/g);

      // what about .co.uk?!
      domain = matches[Math.max(matches.length - 2, 0)].toLowerCase();
    },

    /**
     * Parse the input from rss feed
     * @param  {Object[]} input - Array of rss items
     * @return {Object[]} - Array of stream items
     */
    parseRSS = function( input ) {
      var output = [], list = [], i = 0, j = 0, url = '';
      if(input.query && input.query.count && input.query.count > 0) {
        // setup
        getHost();
        getDomain();
        addStyle();

        // the world vs. blogger
        list = input.query.results.item || input.query.results.entry;
        j = list.length;
        url = 'http://' + host; // this should be the user profile page

        for( ; i<j; i++) {
          var item = list[i];
          item.action = config.action || 'posted';

          output.push({
            url: url,
            date: new Date( item.pubDate ),
            config: config,
            html: $.tmpl( template.posted, item),
            classname: domain
          });
        }
      }
      return output;
    };

    $.ajax({
      // feed - support rss and atom
      url: $.fn.lifestream.createYqlUrl('select title, pubDate, link ' +
        'from feed where url="' + config.url + '" | unique(field="title")'),
      dataType: 'jsonp',
      success: function( data ) {
        callback(parseRSS(data));
      }
    });

    // Expose the template.
    // We use this to check which templates are available
    return {
      "template" : template
    };

  };
})(jQuery);
