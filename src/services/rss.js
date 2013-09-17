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
        $headStyles = $('head style'),
        $lastStyle = {},
        css = '/* jQuery Lifestream */' + '.' + classname +
          '{background-image:url("' + favicon + '")};';

        if($headStyles.length) {
          $lastStyle = $headStyles.last();
        } else {
          $lastStyle = $('<style type="text/css" />');
          $('head').append($lastStyle);
        }

        $lastStyle.text( $lastStyle.text() + css );
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
      var output = [], list = [], i = 0, j = 0, url = '', classname = '';
      if(input.query && input.query.count && input.query.count > 0) {
        // setup
        getHost();
        getDomain();
        addStyle();

        list = input.query.results.item;
        j = list.length;
        url = 'http://' + host; // this should be the user profile page
        classname = domain;

        for( ; i<j; i++) {
          var item = list[i];
          item.action = config.action || 'posted';

          output.push({
            url: url,
            date: new Date( item.pubDate ),
            config: config,
            html: $.tmpl( template.posted, item ),
            classname: classname
          });
        }
      }
      return output;
    };

    $.ajax({
      url: $.fn.lifestream.createYqlUrl('select * from rss where url="' +
        config.url + '"'),
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
