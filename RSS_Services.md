# RSS Services

Most services can be accesed via [RSS](http://www.rss.com/). To give you more flexibility and keep the filesize low we decided to remove these services from jQuery Lifestream and improve the RSS Service so they would work the same through it.

Basically you will have to add another RSS Service to your list, with some specific options. Have a look at our [example page](https://github.com/christianv/jquery-lifestream/blob/master/example.html#files) as well.

Below you will find the configuration examples for these services, as well as the options you have to access any other rss service we might have missed.

## Configuration

These are the options for the RSS service:

```javascript
{
  "service": "rss",
  "url": "http://example.org/rss.xml",
  "author": {
    "name": "James Bond",
    "url": "http://example.org/jamesbond/"
  },
  "action": "posted"
  "favicon": "http://example.org/favicon.png"
}
```

* `url`: The URI to the RSS feed. The domain will be used together with the `classname` option to generate a class. E.g. for http://example.org the stream items will have the class `lifestream-example`
* `author`: optional, by default ommitted. Display Author asa well. If this is specified, both `author.name` is required. E.g. *[James Bond](http://example.org/) posted "Another one bites the dust"*.
    * `name`: The author name (e.g. "James Bond").
    * `url`: optional, defaults to the root url (i.e. "http://example.org"). Specify the author's profile page.
* `action`: optional, defaults to "posted". Set the stream verb. E.g. `"action": "listended to"` *[James Bond](http://example.org/) _listened to_ "Another one bites the dust"*.
* `favicon`: optional. By default jQuery Lifestream will grab the favicon of the domain. This can have two possible values:
    * `false`: no action is taken. We assume you have the favicon in your stylesheet.
    * an URI to your favicon. A style tag is appended to the `<head>` of your html file and the `background-image` of this stream is set to your URI.

## Examples

Example configurations for services. Where possible, optional arguments were ommited.

We suggest you add the favicons to your stylesheet. Find them [here](https://github.com/christianv/jquery-lifestream/tree/master/src/favicons).

Throughout these examples "jamesbond" is used as a username and "007" as the user ID.

### Blogger


```javascript
{
  "service": "rss",
  "url": "http://jamesbond.blogspot.com/feeds/posts/default"
}
```
### DailyMotion

```javascript
{
  "service": "rss",
  "url": "http://www.dailymotion.com/rss/user/jamesbond",
  "action": "uploaded a video"
}
```

### Deviantart

If you want to fetch your main gallery use your DeviantART nickname.

To fetch a gallery folder, add the id after a slash character. E.g.:
Pick the gallery folder url (http://giuliom.deviantart.com/gallery/30227724), then append the id, which is 30227724, to your nick obtaining something like 'jamesbond/30227724'.

```javascript
{
  "service": "rss",
  "url": "http://backend.deviantart.com/rss.xml?q=by:jamesbond&type=journal&formatted=1",
  "author": {
    "name": "James Bond",
    "url": "http://jamesbond.deviantart.com/"
  },
  "action": "uploaded a deviation",
  "favicon": "http://deviantart.com/favicon.ico"
}
```

### Facebook Page

If you don't know your facebook page id, go [here](http://findmyfacebookid.com/). Make sure you set your page's *Age Resctriction* to be available for everyone.

```javascript
{
  "service": "rss",
  "url": "http://www.facebook.com/feeds/page.php?id=007&format=rss20"
}
```

### Fancy

```javascript
{
  "service": "rss",
  "url": "http://www.fancy.com/rss/jamesbond",
  "action": "fancy'd"
}
```

### Foursquare

Every user has a custom feed url, which you can get for yourself at [foursquare.com/feeds](https://foursquare.com/feeds/).

```javascript
{
  "service": "rss",
  "url": "https://feeds.foursquare.com/history/jamesbond.rss",
  "action": "checked in @"
}
```

### Instapaper

Go to instapaper.com, click *Liked* and open rss feed, copy the url.

```javascript
{
  "service": "rss",
  "url": "http://www.instapaper.com/starred/rss/007007/a2bcde3fg4h5jkl6mnopqrst7",
  "action": "loved"
}
```

### Miso

While logged in, visit [gomiso.com](http://www.gomiso.com) and view the page's source. Look for a tag in the `<head>` of the html that looks like this: `<meta name="user" content="123456">`. That number is your user ID, with which you need to replace *007* below.

```javascript
{
  "service": "rss",
  "url": "http://www.gomiso.com/feeds/user/007/checkins.rss",
  "action": "checked in to"
}
```

### Mlkshk

```javascript
{
  "service": "rss",
  "url": "http://mlkshk.com/user/jamesbond/rss"
}
```

### Pinboard

```javascript
{
  "service": "rss",
  "url": "http://feeds.pinboard.in/rss/u:jamesbond",
  "favicon": "http://pinboard.in/favicon.ico"
}
```

### Quora

Please note, this endpoint is different, as all your Quora actions are exposed in the RSS feed, including upvotes. That is why `action` is empty. Currently, RSS is the only way to get your Quora stream, as they do not have an API.

```javascript
{
  "service": "rss",
  "url": "http://www.quora.com/jamesbond/rss",
  "action": ""
}
```

### Slideshare

```javascript
{
  "service": "rss",
  "url": "http://www.slideshare.net/rss/user/jamesbond",
  "action": "uploaded a presentation"
}
```

### Snipplr

```javascript
{
  "service": "rss",
  "url": "http://snipplr.com/rss/users/jamesbond",
  "action": "posted a snippet"
}
```

### Wordpress

This should work both for wordpress.org feeds and self-hosted sites. If there are multiple authors, you can get a dedicated feed for each author.

```javascript
{
  "service": "rss",
  "url": "http://jamesbond.wordpress.com/feed"
}
```
