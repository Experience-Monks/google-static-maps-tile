# google-static-maps-tile

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Given a center map cordinate Google Static Maps API will be used to load tiles of a map in a given area.

## Example
```javascript
var googleStaticMapsTile = require('google-static-maps-tile');

googleStaticMapsTile({ 
    areaSize: '2560x2560', 
    center: '26.443397,-82.111512', 
    zoom: 12, 
    maptype: 'satellite' 
})
.on('progress', function(info) {

  var image = info.image;
  image.style.position = 'absolute';
  image.style.left = info.data.x + 'px';
  image.style.top = info.data.y + 'px';
  document.body.appendChild(image);
});
```

## Usage

[![NPM](https://nodei.co/npm/google-static-maps-tile.png)](https://www.npmjs.com/package/google-static-maps-tile)

#### var emitter = googleStaticMapsTile(options, [cb])

Will start loading Google Maps imagery based on the options passed. An [event emitter](https://nodejs.org/api/events.html#events_class_events_eventemitter) is returned. Options are largely based on the module [`google-maps-image-api-url`](http://github.com/Jam3/google-maps-image-api-url). 

Some options outside of [`google-maps-image-api-url`](https://github.com/Jam3/google-maps-image-api-url) options:
```javascript
{
    // the following are used to control what's rendered
    center: '26.443397,-82.111512', // must be a latitude and longitude
    areaSize: '2560x2560', // a string representing the area 
                           // you'd like to fill with google maps imagery
                           
    // the following are used to comply with Google Maps Image API
    // rate limiting for more info:
    // https://developers.google.com/maps/documentation/staticmaps/
    imagePerLoad: 50, // how many images to load in one batch load
    durationBetweenLoads: 60 * 1000 + 100, // interval in ms between 
                                           // batch images loads
    crossOrigin: 'Anonymous' // cross origin property for all images
}
```

#### emitter.on('progress', fn)

When a Google Maps Image Tile is loaded the progress event will be called. An info object will be returned that is the following:

```javascript
{
    count: 0,
    total: 50,
    image: <img>,
    data: {
        positionIDX: {
            x: 0,
            y: 1
        },
        positionPX: {
            x: 640,
            y: 640
        },
        latlng: {
            lat: 28.00640077242305,
            lng: -80.35369949999999
        }
    }
}
```


## License

MIT, see [LICENSE.md](http://github.com/Jam3/google-static-maps-tile/blob/master/LICENSE.md) for details.
