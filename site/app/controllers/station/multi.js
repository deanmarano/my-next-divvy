import Ember from 'ember';
/* global _ */

export default Ember.Controller.extend({
  needs: ['station'],
  current: Ember.computed.alias('controllers.station.current'),
  predictionForCount: function(data, current, bikeCount) {
    var variables = ["timeOfDay", "dayOfWeek", "temperature", "summary"];
    var truePs = variables.map(function(v) {
      var dayOfWeek = data.bikeCounts[v][current[v]];
      // number of times it's Sunday and there are 6 bikes
      var dayHasXBikes = dayOfWeek.points[bikeCount] || 0;
      // total number of times there are 6 bikes
      var allHasXBikes = Object.keys(data.bikeCounts[v]).map(function(weekday) {
        return weekday === current[v] ? 0 : data.bikeCounts[v][weekday].points[bikeCount] || 0;
      }).reduce(function(a, b) { return a + b; });

      return dayHasXBikes / allHasXBikes;
    }).reduce(function(a, b) { return a * b;});

    var falsePs = variables.map(function(v) {
      // number of times it's sunday and there are not 6 bikes
      var dayOfWeek = data.bikeCounts[v][current[v]];
      var dayHasXBikes = dayOfWeek.points[bikeCount] || 0;
      var dayNotHaveXBikes = dayOfWeek.total - dayHasXBikes;
      // total number of times there are not 6 bikes
      var allNotHaveXBikes = Object.keys(data.bikeCounts[v]).map(function(weekday) {
        var day = data.bikeCounts[v][weekday];
        return weekday === current[v]? 0 : day.total - day.points[bikeCount] || 0;
      }).reduce(function(a, b) { return a + b; });
      return dayNotHaveXBikes / allNotHaveXBikes;
    }).reduce(function(a, b) { return a * b;});

    var percent = truePs / (truePs + falsePs);
    return {
      numBikes: bikeCount,
      percent: percent,
      style: 'width: %@%;'.fmt(percent * 100)
    };
  },
  predictions: function() {
    var p = [];
    for(var i = 0; i < this.get('model').maxDocs; i++) {
      p.push(this.predictionForCount(this.get('model'), this.get('current'), i));
    }
    return p;
  }.property('model', 'current'),
  bestPrediction: function() {
    return _.last(_.sortBy(this.get('predictions'), 'percent'));
  }.property('predictions')
/*
  P(dayOfWeek = Sunday | hasBikes = true) = 14.33%
  P(timeOfDay = 3:00 PM | hasBikes = true) = 1.04%
  P(degrees = 40°s | hasBikes = true) = 23.32%
  P(conditions = Light Rain | hasBikes = true) = 2.54%

  P(dayOfWeek = Sunday | hasBikes = false) = 5.42%
  P(timeOfDay = 3:00 PM | hasBikes = false) = 0.83%
  P(degrees = 40°s | hasBikes = false) = 8.14%
  P(conditions = Light Rain | hasBikes = false) = 0.24%

  P(Sunday | true) P(3:00 PM | true) P(40°s | true) P(Light Rain | true) = 0%
  P(Sunday | false) P(3:00 PM | false) P(40°s | false) P(Light Rain | false) = 0%
  0% / (0% + 0%) = 99.04%
*/
});
