var googleMapsTile = require('./..');

googleMapsTile({ areaSize: '10000x10000', center: '26.443397,-82.111512', zoom: 12, maptype: 'satellite' })
.on('progress', function(info) {

  var image = info.image;
  image.style.position = 'absolute';
  image.style.left = info.data.positionPX.x + 'px';
  image.style.top = info.data.positionPX.y + 'px';
  document.body.appendChild(image);

  console.log('succeed', info);
})
.on('not-found', function(info) {

  console.log('fail', info);
});