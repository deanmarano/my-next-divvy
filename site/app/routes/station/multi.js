import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Route.extend({
  model: function() {
    return ajax('stations/%@.2.json'.fmt(this.modelFor('station').station.id));
  }
});
