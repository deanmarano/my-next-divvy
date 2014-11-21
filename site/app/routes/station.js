import Ember from 'ember';
import ajax from 'ic-ajax';
/* global moment */

export default Ember.Route.extend({
  model: function(params) {
    return Ember.RSVP.hash({
      station: ajax('stations/%@.json'.fmt(params.id)),
      weather: ajax('weather/%@.json'.fmt(moment().format('YYYY-MM-DD')))
    });
  }
});
