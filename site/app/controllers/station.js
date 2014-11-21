import Ember from 'ember';
/* global moment */

export default Ember.Controller.extend({
  googleMapsUrl: function() {
    var apiKey = 'AIzaSyB4OByFbR_abmKPJ-03vHq_Jp2p2HTjqB0';
    var station = this.get('model.station');
    var latLong = "%@,%@".fmt(station.latitude, station.longitude);
    return "https://www.google.com/maps/embed/v1/view?key=%@&center=%@&zoom=17".fmt(apiKey, latLong);
  }.property('model'),
  bikeTruePoints: Ember.computed.alias('model.station.bikeCounts.truePoints'),
  bikeFalsePoints: function() {
    return this.get('model.station.totalPoints') - this.get('bikeTruePoints');
  }.property('bikeTruePoints', 'model'),
  dayOfWeek: function() {
    return moment().format('dddd');
  }.property(),
  dayOfWeekPercent: function() {
    var data = this.get('model.station').bikeCounts.dayOfWeek[moment().weekday()];
    return data.count / data.total;
  }.property(),
  nearestFifteen: function() {
    var now = moment();
    var minute = now.minute();
    var nearestFifteen = Math.round(4 *( minute / 60)) * 15;
    return now.minute(nearestFifteen);
  }.property('model'),
  nearestFifteenDisplay: function() {
    return this.get('nearestFifteen').format('h:mm A');
  }.property('nearestFifteen'),
  nearestFifteenPercent: function() {
    var rounded = this.get('nearestFifteen');
    var data = this.get('model.station').bikeCounts.timeOfDay[rounded.hour() * 60 + rounded.minute()];
    return data.count / data.total;
  }.property('model', 'nearestFifteen'),
  inServicePercent: function () {
    var inService = this.get('model.station').bikeCounts.statusValue['In Service'].total;
    var outOfService = this.get('model.station').bikeCounts.statusValue['Not In Service'].total;
    return inService / (inService + outOfService);
  }.property('model'),
  currentWeather: function() {
    return this.get('model.weather.hourly.data')[moment().hour()];
  }.property('model'),
  degreesInTens: function() {
    return Math.floor(this.get('currentWeather').temperature / 10) * 10;
  }.property('model'),
  degreesInTensPercent: function() {
    var data = this.get('model.station.bikeCounts.temperature')[this.get('degreesInTens')];
    return data.count / data.total;
  }.property('model'),
  summaryPercent: function() {
    var data = this.get('model.station.bikeCounts.summary.%@'.fmt(this.get('currentWeather.summary')));
    return data.count / data.total;
  }.property('model'),
  pSummaryTrue: function() {
    var data = this.get('model.station.bikeCounts.summary.%@'.fmt(this.get('currentWeather.summary')));
    return data.count / this.get('bikeTruePoints');
  }.property('model'),
  pDayOfWeekTrue: function() {
    var data = this.get('model.station.bikeCounts.dayOfWeek.%@'.fmt(moment().weekday()));
    return data.count / this.get('bikeTruePoints');
  }.property('model'),
  pDegreesTrue: function() {
    var data = this.get('model.station.bikeCounts.temperature.%@'.fmt(this.get('degreesInTens')));
    return data.count / this.get('bikeTruePoints');
  }.property('model'),
  pTimeOfDayTrue: function() {
    var rounded = this.get('nearestFifteen');
    var data = this.get('model.station.bikeCounts.timeOfDay.%@'.fmt(rounded.hour() * 60 + rounded.minute()));
    return data.count / this.get('bikeTruePoints');
  }.property('model'),
  pSummaryFalse: function() {
    var data = this.get('model.station.bikeCounts.summary.%@'.fmt(this.get('currentWeather.summary')));
    return (data.total - data.count) / this.get('bikeFalsePoints');
  }.property('model'),
  pDayOfWeekFalse: function() {
    var data = this.get('model.station.bikeCounts.dayOfWeek.%@'.fmt(moment().weekday()));
    return (data.total - data.count) / this.get('bikeFalsePoints');
  }.property('model'),
  pDegreesFalse: function() {
    var data = this.get('model.station.bikeCounts.temperature.%@'.fmt(this.get('degreesInTens')));
    return (data.total - data.count) / this.get('bikeFalsePoints');
  }.property('model'),
  pTimeOfDayFalse: function() {
    var rounded = this.get('nearestFifteen');
    var data = this.get('model.station.bikeCounts.timeOfDay.%@'.fmt(rounded.hour() * 60 + rounded.minute()));
    return (data.total - data.count) / this.get('bikeFalsePoints');
  }.property('model'),
  pTotalTrue: function() {
    var ps = this.getProperties('pSummaryTrue', 'pDayOfWeekTrue', 'pDegreesTrue', 'pTimeOfDayTrue');
    return Object.keys(ps).map(function(p) { return ps[p]; }).reduce(function(a, b) { return a * b; });
  }.property('model'),
  pTotalFalse: function() {
    var ps = this.getProperties('pSummaryFalse', 'pDayOfWeekFalse', 'pDegreesFalse', 'pTimeOfDayFalse');
    return Object.keys(ps).map(function(p) { return ps[p]; }).reduce(function(a, b) { return a * b; });
  }.property('model'),
  pHasBikes: function() {
    var ps = this.getProperties('pTotalTrue', 'pTotalFalse');
    return ps.pTotalTrue / (ps.pTotalTrue + ps.pTotalFalse);
  }.property('model')
});
