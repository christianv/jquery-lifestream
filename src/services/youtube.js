(function($) {
  "use strict";

  $.fn.lifestream.feeds.youtube = function( config, callback ) {

    var template = $.extend({},
      {
        "uploaded": 'uploaded <a href="https://www.youtube.com/watch?v=${resourceId.videoId}">${title}</a>'
      },
      config.template);

    var parseYoutube = function(response) {
      var output = [];

      if(!response.items) {return output;}

      for (var i=0; i<response.items.length;i++){
        var video = response.items[i];

        output.push({
          "date": new Date(video.publishedAt),
          "config": config,
          "html": $.tmpl(template.uploaded, video.snippet)
        });
      }
      callback(output);
    };
    var videos_request_params = {
      part: "snippet",
      key: config.api_key
    };

    var fetchAndParseYoutube = function(){
      $.ajax({
        "url": "https://www.googleapis.com/youtube/v3/playlistItems",
        "data": videos_request_params,
        "cache": false
      }).success(parseYoutube);
    }

    //If the playlist id was given in the config, get the videos from that
    if (config.hasOwnProperty("playlist")){
      videos_request_params['playlistId'] = config['playlist'];
      fetchAndParseYoutube();
    }

    //If the playlist id wasn't specified, request the uploads playlist id for the specified user and use that
    else    {
      $.ajax({"url":"https://www.googleapis.com/youtube/v3/channels",
        "data":{
          forUsername:config.user,
          part:"contentDetails",
          key:config.api_key
        }}).success(function(channels_resp){
        videos_request_params['playlistId'] = channels_resp.items[0].contentDetails.relatedPlaylists.uploads;
        fetchAndParseYoutube();
      })
    };

    // Expose the template.
    // We use this to check which templates are available
    return {
      "template" : template
    };
  };
  })(jQuery);
