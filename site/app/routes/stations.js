import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return [{id: 100, name: "Orleans St & Merchandise Mart Plaza"},
            {id: 48, name: "Larrabee St & Kingsbury St"}];
  }
});
