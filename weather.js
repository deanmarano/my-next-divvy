var jf = require('jsonfile'),
    http = require('request'),
    _ = require('lodash');
var forecastUrl = 'https://api.forecast.io/forecast/',
    forecastApiKey = 'b610994c303090b04bdc6eab1d475cc0',
    latitude = '41.8739580629',
    longitude = '-87.6277394859';

//var dates = jf.readFileSync('./days.json');
var dates = ['2014-12-01',
             '2014-12-02',
             '2014-12-03',
             '2014-12-04',
             '2014-12-05',
             '2014-12-06',
             '2014-12-07',
             '2014-12-08',
             '2014-12-09',
             '2014-12-10'];

dates.forEach(function(dateStr) {
  console.log('fetching weather data for: ' + dateStr);
  var date = Date.parse(dateStr);
  var hoursInMilliseconds = 19 * 60 * 60 * 1000;
  var time = (date + hoursInMilliseconds) / 1000;
  var url = forecastUrl + forecastApiKey + '/' + [latitude, longitude, time].join(',');
  http(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      jf.writeFileSync('./weather/' + dateStr + '.json', JSON.parse(body));
    } else {
      console.log('error fetching day: ' + dateStr + ' statusCode: ' + response.statusCode);
    }
  });
});
