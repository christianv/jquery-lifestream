(function($) {
$.fn.lifestream.feeds.googleplus = function(config, callback ) {

  var template = $.extend({},
    {
    posted: '<a href="${actor.url}">${actor.displayName}</a> has posted a new entry <a href="${url}" '
        + 'title="${id}">${titles}</a> With ${object.replies.totalItems} replies, ${object.plusoners.totalItems} +1s, ${object.resharers.totalItems} Reshares'
    },
    config.template),

  parseGooglePlus = function( input ) {
    var output = [], i = 0, j, item

    if(input && input.items) {
      j = input.items.length
	  
      for( ; i<j; i++) {
        item = input.items[i]
        titles =posttempl(item)
		output.push({
          date: new Date( item.published ),
          config: config,
          html: $.tmpl( template.posted, item )
			});

		}
		
    }
    return output;
  };
  
  var posttempl = function(item) {

    var belongsToPhotoAlbum = function() {
        return item.object.attachments &&
            item.object.attachments.any(function(a) { 
                return a.objectType === 'photo-album' 
            })
    }

    var userAnnotation = function() {
        if (item.verb === 'share' && item.annotation) {
            return item.annotation
        }
    }

    var titleFromAttachments = function() {
        if (item.object.attachments) {
            for (var i = 0; i < item.object.attachments.length; i++) {
			if(item.object.attachments[0].objectType==="photo") {
			return item.object.attachments[0].content
			}
                title = item.object.attachments[i].displayName
                if (title) return title
            }
        }
    }

    var title = userAnnotation()

    // When item is an album photo G+ uses the album title as the content, but 
    // we'll prefer photo's own annotation
    if (! title && ! belongsToPhotoAlbum()) title

    if (! title) title = titleFromAttachments()

    if (! title && belongsToPhotoAlbum()) title

    if (! title) title = '' // Avoid undefineds


    // Include attachment type
   if (item.object.attachments) {
        var type = (function() {
            if (item.object.attachments.some(function(a) { return a.objectType === 'article' })) return 'link'
            if (item.object.attachments.any(function(a) { return a.objectType === 'photo' })) return 'image'
            if (item.object.attachments.any(function(a) { return a.objectType === 'video' })) return 'video'
        })()
        if (type) title
	}
		
	if(!type) type='text'
	typish = " @ " + type
	if(item.verb==="share") typish+=",share"
	if(item.title==="" || item.verb==="share")
     return title+typish
	 
	else return item.title+typish

}
  
  
  
  

  $.ajax({
    url: "https://www.googleapis.com/plus/v1/people/" + config.user +
	    "/activities/public",
	  data: {
	    key: config.key,
	    maxResults: config.num
	  },
    dataType: 'jsonp',
    success: function( data ) {
	   if (data.error) {
        callback([])
        if (console && console.error) {
          console.error('Error loading Google+ stream.', data.error)
        }
        return
      } else {
        callback(parseGooglePlus(data))
      }
    }
  });

  // Expose the template.
  // We use this to check which templates are available
  return {
    "template" : template
  };

};
})(jQuery);