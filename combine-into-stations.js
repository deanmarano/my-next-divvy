jf = require('jsonfile');
var walk    = require('walk');
var _ = require('lodash');

var getFileList = function() {
  var filesToProcess   = [];
  var walker = walk.walk('./archive', { followLinks: false });

  walker.on('file', function(root, stat, next) {
      // Add this file to the list of files
      if(stat.name.indexOf('divvy') === 0) {
        filesToProcess.push(root + '/' + stat.name);
      }
      next();
  });

  walker.on('end', function() {
    jf.writeFileSync('files-to-process.json', filesToProcess);
  });
};

var initializeStation = function(station) {
  return {
    id: station.id,
    points: {}
  };
};

var processStation = function(when, station) {
  var stationFileName = './stations/' + station.id + '.json';
  var data = {};
  try {
    data = jf.readFileSync(stationFileName);
  } catch (e) {
    data = initializeStation(station);
  }
  data.points[when] = station;
  jf.writeFileSync(stationFileName, data);
};

var processFile = function(filename) {
  var data = jf.readFileSync(filename);
  var when = data.executionTime;
  data.stationBeanList.forEach(function(station) {
    processStation(when, station);
  });
};

var process = function() {
  var processedStations = jf.readFileSync('processed-stations.json');
  var filesToProcess = jf.readFileSync('files-to-process.json');
  try {
  filesToProcess.slice(0, 500).forEach(function(filename) {
    console.log(filename);
    if(!processedStations[filename]) {
      processFile(filename);
      processedStations[filename] = true;
    }
  });
  } catch(e) {
    console.log(e);
  } finally {
    jf.writeFileSync('processed-stations.json', processedStations);
  }
};

var getStationList = function() {
  var filesToProcess = jf.readFileSync('files-to-process.json');
  var stations = {};
  filesToProcess.forEach(function(filename) {
    console.log(filename);
    try {
    var dataFile = jf.readFileSync(filename);
    dataFile.stationBeanList.forEach(function(station) {
      stations[station.id] = true;
    });
    } catch(e) {
      console.log('error reading file: ' + filename);
    }
  });
  jf.writeFileSync('station-ids.json', Object.keys(stations));
};

//getStationList();

var processSingle = function(id) {
  console.log('processing id: ' + id);
  var filesToProcess = jf.readFileSync('files-to-process.json');
  var allData = {id: id, points: {}};
  try {
    filesToProcess.forEach(function(filename) {
      try {
      var data = jf.readFileSync(filename);
      var when = data.executionTime;
      data.stationBeanList.forEach(function(station) {
        if(station.id === id) {
          allData.points[when] = station;
        }
      });
      } catch (e) {
        console.log('bad file: ' + filename);
      }
    });
  } catch(e) {
    console.log(e);
  } finally {
    jf.writeFileSync('./stations/' + id + '.json', allData);
  }
};

var processAll = function () {
  var ids = jf.readFileSync('station-ids.json');
  ids.forEach(processSingle);
};

//processAll();

var removeUnchangedVariables = function(id) {
  var stationData = jf.readFileSync('./stations/' + id + '.json');
  var whens = Object.keys(stationData.points);
  var keys = Object.keys(stationData.points[whens[0]]);
  var unchangedKeys = [];
  keys.forEach(function(key) {
    var result = whens.map(function(when) {
      return stationData.points[when][key];
    });
    if(_.uniq(result).length === 1) {
      console.log('unchanged key: ' + key);
      unchangedKeys.push(key);
    }
  });
  // hoist unchanged keys
  var firstDataPoint = stationData.points[whens[0]];
  unchangedKeys.forEach(function(key) {
    stationData[key] = firstDataPoint[key];
  });
  // remove unchanged keys
  whens.forEach(function(when) {
    unchangedKeys.forEach(function(key) {
      delete stationData.points[when][key];
    });
  });
  jf.writeFileSync('./stations/' + id + '.json', stationData);
};

//removeUnchangedVariables(5);
var cleanupAll = function () {
  var ids = jf.readFileSync('station-ids.json');
  ids.forEach(removeUnchangedVariables);
};

cleanupAll();
