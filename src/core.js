/*!
 * jQuery Lifestream Plug-in
 * @version 0.2.0
 * Show a stream of your online activity
 *
 * Copyright 2011, Christian Vuerings - http://denbuzze.com
 */
/*globals jQuery, $ */
;(function( $ ){

  /**
   * Initialize the lifestream plug-in
   * @param {Object} config Configuration object
   */
  $.fn.lifestream = function( config ) {

    // Make the plug-in chainable
    return this.each(function() {

      // The element where the lifestream is linked to
      var outputElement = $(this),

      // Extend the default settings with the values passed
      settings = jQuery.extend({
        // The name of the main lifestream class
        // We use this for the main ul class e.g. lifestream
        // and for the specific feeds e.g. lifestream-twitter
        classname: "lifestream",
        // Callback function which will be triggered when a feed is loaded
        feedloaded: null,
        // The amount of feed items you want to show
        limit: 10,
        // An array of feed items which you want to use
        list: []
      }, config),

      // The data object contains all the feed items
      data = {
        count: settings.list.length,
        items: []
      },

      // We use the item settings to pass the global settings variable to
      // every feed
      itemsettings = jQuery.extend( true, {}, settings ),

      /**
       * This method will be called every time a feed is loaded. This means
       * that several DOM changes will occur. We did this because otherwise it
       * takes to look before anything shows up.
       * We allow 1 request per feed - so 1 DOM change per feed
       * @private
       * @param {Array} inputdata an array containing all the feeditems for a
       * specific feed.
       */
      finished = function( inputdata ) {

        // Merge the feed items we have from other feeds, with the feeditems
        // from the new feed
        $.merge( data.items, inputdata );

        // Sort the feeditems by date - we want the most recent one first
        data.items.sort( function( a, b ) {
            return ( b.date - a.date );
        });

        var items = data.items,

            // We need to check whether the amount of current feed items is
            // smaller than the main limit. This parameter will be used in the
            // for loop
            length = ( items.length < settings.limit ) ?
              items.length :
              settings.limit,
            i = 0, item, itemDate, feedDateLimit, isAcceptableFeedLimit,

            // We create an unordered list which will create all the feed
            // items
            ul = $('<ul class="' + settings.classname + '"/>');

        if ( inputdata.length > 0 ) {
          feedDateLimit = inputdata[0].config.datelimit;

          isAcceptableFeedLimit = ( feedDateLimit !== undefined ) ?
              ( isAcceptableLimit( feedDateLimit ) ||
              isLimitedToToday( feedDateLimit ) ) : false;

          if ( isAcceptableFeedLimit ) {
            dateLimit = getDateLimit( feedDateLimit );
          } else {
            dateLimit = configDateLimit;
          }

          feedsDateLimits[inputdata[0].config.service] = dateLimit;
        }

        // Run over all the feed items + add them as list items to the
        // unordered list
        for ( ; i < length; i++ ) {
          item = items[i];
          itemDate = new Date(item.date);
          itemDate.setHours(0,0,0,0);

          if ( item.html && (!dateLimit || (dateLimit &&
           itemDate >= feedsDateLimits[item.config.service].getTime())) ) {
            $('<li class="'+ settings.classname + '-'
              + item.config.service + '">').data( "time", item.date )
                                           .append( item.html )
                                           .appendTo( ul );
          }
        }

        // Change the innerHTML with a list of all the feeditems in
        // chronological order
        outputElement.html( ul );

        // Trigger the feedloaded callback, if it is a function
        if ( $.isFunction( settings.feedloaded ) ) {
          settings.feedloaded();
        }

      },

      /**
       * Fire up all the feeds and pass them the right arugments.
       * @private
       */
      load = function() {

        var i = 0, j = settings.list.length;

        // We don't pass the list array to each feed  because this will create
        // a recursive JavaScript object
        delete itemsettings.list;

        // Run over all the items in the list
        for( ; i < j; i++ ) {

          var config = settings.list[i];

          // Check whether the feed exists, if the feed is a function and if a
          // user has been filled in
          if ( $.fn.lifestream.feeds[config.service] &&
               $.isFunction( $.fn.lifestream.feeds[config.service] )
               && config.user) {

            // You'll be able to get the global settings by using
            // config._settings in your feed
            config._settings = itemsettings;

            // Call the feed with a config object and finished callback
            $.fn.lifestream.feeds[config.service]( config, finished );
          }

        }

      };

      // Load the jQuery templates plug-in if it wasn't included in the page.
      // At then end we call the load method.
      if( !jQuery.tmpl ) {
        jQuery.getScript(
          "https://raw.github.com/jquery/jquery-tmpl/master/"
            + "jquery.tmpl.min.js",
          load);
      } else {
        load();
      }

    });

  };

  /**
   * Create a valid YQL URL by passing in a query
   * @param {String} query The query you want to convert into a valid yql url
   * @return {String} A valid YQL URL
   */
  $.fn.lifestream.createYqlUrl = function( query ) {
      return ( "http://query.yahooapis.com/v1/public/yql?q=__QUERY__&env=" +
      "store://datatables.org/alltableswithkeys&format=json")
        .replace( "__QUERY__" , encodeURIComponent( query ) );
  };

  var isLimitedToToday = function( limit ) {
    return ( limit &&
                (limit.indexOf('today') > -1 || limit.indexOf('1day') > -1) );
  };

  var isAcceptableLimit = function( limit ) {
    var humanReadableLimits = [ 'today', 'yesterday' ],
        isGoodLimitFormat = ( limit && limit.match(
		      /^((1\s*(day|week|month))|([0-9]*\s*(days|weeks|months)))$/i)
		      !== null );

		return ( limit &&
		      (isGoodLimitFormat || $.inArray(limit, humanReadableLimits) > -1) );
  };

  var getDateLimit = function( limit ) {
    var isLimited = isAcceptableLimit( limit ),
        dateLimit;

    if ( !isLimited && !isLimitedToToday( limit ) ) {
      dateLimit = false;
    } else {
      dateLimit = new Date();
      dateLimit.setHours(0,0,0,0);
    }

    if ( isLimited ) {
      var gap, currentDay, currentMonth;
      currentDay = dateLimit.getDate();

      switch ( limit ) {
        case 'yesterday':
          dateLimit.setDate( currentDay - 1 );
          break;
        default:
          if ( limit.indexOf('days') > -1 ) {
            gap = parseInt( limit.split('days')[0], 10 );
            dateLimit.setDate( currentDay - gap+1 );
          }
          else if ( limit.indexOf('week') > -1 ) {
            gap = parseInt( limit.split('week')[0], 10 );
            dateLimit.setDate( currentDay - gap*7 );
          }
          else if ( limit.indexOf('month') > -1 ) {
            gap = parseInt( limit.split('month')[0], 10 );
            currentMonth = dateLimit.getMonth();
            dateLimit.setMonth( currentMonth - gap );
          }
          break;
      }
    }

    return dateLimit;
  };

  /**
   * A big container which contains all available feeds
   */
  $.fn.lifestream.feeds = $.fn.lifestream.feeds || {};

}( jQuery ));