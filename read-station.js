var moment = require('moment'),
    jf = require('jsonfile');

var processStation = function(id) {
  var filename = './stations/' + id + '.json';
  var data = jf.readFileSync(filename);
  var times = Object.keys(data.points);
  data.bikeCounts = {
    truePoints: 0,
    statusValue: {
    },
    timeOfDay: {
    },
    dayOfWeek: {
    },
    temperature: {
    },
    summary: {
    }
  };
  data.dockCounts = {
    truePoints: 0,
    statusValue: {
    },
    timeOfDay: {
    },
    dayOfWeek: {
    },
    temperature: {
    },
    summary: {
    }
  };
  data.totalPoints = Object.keys(data.points).length;
  times.forEach(function(time) {
    var parsed = moment(time, 'YYYY-MM-DD HH:mm:ss A');
    var minute = moment(time, 'YYYY-MM-DD HH:mm:ss A').minute();
    var nearestFifteen = Math.round(4 *( minute / 60)) * 15;
    var rounded = parsed.minute(nearestFifteen);
    var point = data.points[time];
    point.dayOfWeek = rounded.weekday() % 7;
    point.timeOfDay = rounded.hour() * 60 + rounded.minute();
    var hasBikes = (point.availableBikes > 0 ? 1 : 0) && (point.statusKey === 1);
    var hasDocks = (point.availableDocks > 0 ? 1 : 0) && (point.statusKey === 1);

    data.bikeCounts.truePoints = data.bikeCounts.truePoints + hasBikes;
    data.dockCounts.truePoints = data.dockCounts.truePoints + hasDocks;

    ['statusValue', 'timeOfDay', 'dayOfWeek', 'temperature', 'summary'].forEach(function(input) {
      var bike = data.bikeCounts[input][point[input]];
      if(!bike) {
        bike = {count: 0, total: 0};
      }
      var dock = data.dockCounts[input][point[input]];
      if(!dock) {
        dock = {count: 0, total: 0};
      }
      bike.count = bike.count + hasBikes;
      bike.total = bike.total + 1;

      dock.count = dock.count + hasDocks;
      dock.total = dock.total + 1;

      data.bikeCounts[input][point[input]] = bike;
      data.dockCounts[input][point[input]] = dock;
    });
  });
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

//addWeatherData(100);
processStation(100);

var writeBrowserData = function(id) {
  var filename = './stations/' + id + '.json';
  var data = jf.readFileSync(filename);
  delete data.points;
  jf.writeFileSync('./site/public/stations/' + id + '.json', data);
};

writeBrowserData(100);
