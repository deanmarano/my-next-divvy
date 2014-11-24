var moment = require('moment'),
    jf = require('jsonfile');

var processStation = function(id) {
  var filename = './stations/' + id + '.json';
  var data = jf.readFileSync(filename);
  var times = Object.keys(data.points);
  data.bikeCounts = {};
  data.totalPoints = Object.keys(data.points).length;
  if(data.totalDocks) {
    data.maxDocs = data.totalDocks;
  } else {
    var totalDocks = Object.keys(data.points).map(function(a) { return data.points[a].totalDocks; });
     data.maxDocs = Math.max.apply(null, totalDocks);
  }
  times.forEach(function(time) {
    var parsed = moment(time, 'YYYY-MM-DD HH:mm:ss A');
    var minute = moment(time, 'YYYY-MM-DD HH:mm:ss A').minute();
    var nearestFifteen = Math.round(4 *( minute / 60)) * 15;
    var rounded = parsed.minute(nearestFifteen);
    var point = data.points[time];
    point.dayOfWeek = rounded.weekday() % 7;
    point.timeOfDay = rounded.hour() * 60 + rounded.minute();
    var hasXBikes = (point.statusKey === 1) ? point.availableBikes : 0;
    var counts = data.bikeCounts[hasXBikes];

    ['statusValue', 'timeOfDay', 'dayOfWeek', 'temperature', 'summary'].forEach(function(input) {
      if(!data.bikeCounts[input]) {
        data.bikeCounts[input] = {};
      }
      var bike = data.bikeCounts[input][point[input]];
      if(!bike) {
        bike = {total: 0, points: {}};
      }
      bike.points[hasXBikes] = (bike.points[hasXBikes] || 0) + 1;
      bike.total = bike.total + 1;

      data.bikeCounts[input][point[input]] = bike;
    });
  });
  filename = './stations2/' + id + '.json';
  jf.writeFileSync(filename, data);
};


var addWeatherData = function(id) {
  var filename = './stations/' + id + '.json';
  var data = jf.readFileSync(filename);
  var times = Object.keys(data.points);
  var weather = {};
  times.forEach(function(time) {
    var parsed = moment(time, 'YYYY-MM-DD HH:mm:ss A');
    var date = parsed.format('YYYY-MM-DD');
    var hour = parsed.hour();
    var minute = parsed.minute();

    if(!weather[parsed]) {
      weather[parsed] = jf.readFileSync('weather/' + date + '.json');
    }
    var weatherData = weather[parsed].hourly.data[hour];

    var nearestFifteen = Math.round(4 *( minute / 60)) * 15;
    var rounded = parsed.minute(nearestFifteen);
    data.points[time].temperature = Math.floor(weatherData.temperature / 10) * 10;
    data.points[time].summary = weatherData.summary;
  });

  jf.writeFileSync(filename, data);
};


var writeBrowserData = function(id) {
  var filename = './stations/' + id + '.json';
  var data = jf.readFileSync(filename);
  delete data.points;
  jf.writeFileSync('./site/public/stations/' + id + '.2.json', data);
};

//addWeatherData(48);
processStation(48);
//writeBrowserData(48);
