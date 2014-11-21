import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return [{id: 100, name: "Orleans St & Merchandise Mart Plaza"}];
  }
});
