var getGoogleURL = require('google-maps-image-api-url');
var merc = require('mercator-projection');
var rateLoader = require('rate-limited-image-loader');
var merge = require('merge');

module.exports = function googleMapsTile(settings, callback) {

  settings = merge({}, settings);
  settings.size = settings.size || '640x640';
  settings.areaSize = settings.areaSize || '1024x768';
  settings.type = 'staticmap';
  settings.imagePerLoad = settings.imagePerLoad || 50;

  var durationBetweenLoads = settings.durationBetweenLoads || 60 * 1000 + 100;
  var imagePerLoad = settings.imagePerLoad;
  var crossOrigin = settings.crossOrigin || 'Anonymous';
  var loader = rateLoader(imagePerLoad, durationBetweenLoads);
  var zoom = parseInt(settings.zoom) || 14;
  var scale = Math.pow(2, zoom);
  var center = settings.center.split(',').map(parseFloat);
  var tileSize = settings.size.split('x').map(parseFloat);
  var areaSize = settings.areaSize.split('x').map(parseFloat);
  var centerPX = pointToPX(
    merc.fromLatLngToPoint({ lat: center[ 0 ], lng: center[ 1 ] }),
    scale
  );
  var imageLoadInfo = [];
  var width = 0;
  var height = tileSize[ 1 ];
  var inc = 0;
  var rowCenter = {x: centerPX.x, y: 0};
  var tilesXY = [];

  // remove properties which should not be used to load images
  delete settings.visible;
  delete settings.crossOrigin;
  delete settings.durationBetweenLoads;
  delete settings.imagePerLoad;

  var getURLForRow = function(centerPX) {

    var row = [];
    var inc = 0;
    var tilePX = { x: 0, y: 0 };
    var cornerX;
    var cornerY;

    width = tileSize[ 0 ];

    row.push(getInfo(settings, scale, centerPX));

    while(width < areaSize[ 0 ]) {
      inc++;
      width += tileSize[ 0 ] * 2;

      // load tile on left
      tilePX.x = centerPX.x - inc * tileSize[ 0 ];
      tilePX.y = centerPX.y;

      row.unshift(getInfo(settings, scale, tilePX));

      // load tile on right
      tilePX.x = centerPX.x + inc * tileSize[ 0 ];
      tilePX.y = centerPX.y;

      row.push(getInfo(settings, scale, tilePX));
    }

    return row;
  };

  // load the center row
  imageLoadInfo.push.apply(imageLoadInfo, getURLForRow(centerPX) );

  while(height < areaSize[ 1 ]) {
    inc++;
    height += tileSize[ 1 ] * 2;

    rowCenter.y = centerPX.y - inc * tileSize[ 1 ];
    imageLoadInfo.unshift.apply( imageLoadInfo, getURLForRow(rowCenter) );

    rowCenter.y = centerPX.y + inc * tileSize[ 1 ];
    imageLoadInfo.push.apply( imageLoadInfo, getURLForRow(rowCenter) );

    console.log(inc);
  }

  console.log(height, areaSize[ 1 ]);


  tilesXY = [ width / tileSize[ 0 ], height / tileSize[ 1 ] ];

  cornerX = ( areaSize[ 0 ] - width ) * 0.5;
  cornerY = ( areaSize[ 1 ] - height ) * 0.5;

  imageLoadInfo = imageLoadInfo.map( function( image, i ) {
    var y = Math.floor(i / tilesXY[ 0 ]);
    var x = i - y * tilesXY[ 0 ];

    image.positionIDX = {
      x: x,
      y: y
    };

    image.positionPX = {
      x: x * tileSize[ 0 ],
      y: y * tileSize[ 1 ]
    };

    return image;
  });

  return loader(imageLoadInfo, { crossOrigin: crossOrigin }, callback);
};

function getInfo(settings, scale, tilePX) {

  var tileLL = merc.fromPointToLatLng(pxToPoint(tilePX, scale));
  settings.center = tileLL.lat + ',' + tileLL.lng;

  return {
    url: getGoogleURL(settings),
    latlng: {
      lat: tileLL.lat,
      lng: tileLL.lng
    }
  };
}

function pointToPX(point, scale) {
  return {
    x: point.x * scale,
    y: point.y * scale
  };
}

function pxToPoint(px, scale) {
  return {
    x: px.x / scale,
    y: px.y / scale
  };
}