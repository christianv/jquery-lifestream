
n($) {
$.fn.lifestream.feeds.medium = function( config, callback ) {

  var template = $.extend({}, config.template);

  var parseMediumItem = function( item ) {

    title = item.title;
    link = item.link;

    return {
      link: link,
      title: title,
      description: item.description
    };
  };
  
  var url = $.fn.lifestream.createYqlUrl('select * from xml where url="' +
      'https://medium.com/feed/' + config.user + '"');

  $.ajax({
    url: url,
    dataType: "jsonp",
    success: function( data ) {
      var output = [];

      if(data && data.query.results.rss.channel.item) {
        var items = data.query.results.rss.channel.item;

        for(var i = 0 ; i < items.length; i++) {
          var item = items[i];
          output.push({
            date: item.pubDate,
            config: config,
            html: '<h3><a href="'+item.link+'">'+item.title+' </a></h3> by <a href="http://medium.com/' +
                   config.user +'">'+ config.user + '</a>' + item.description
          });
        }
      }

      callback(output);
    }
  });

  // Expose the template.
  // We use this to check which templates are available
  return {
    "template" : template
  };

};
})(jQuery);
