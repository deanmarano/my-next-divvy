import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('stations', {path: '/'}, function() {
    this.resource('station', {path: '/station/:id'}, function() {
      this.route('multi', {path: '/'}, function() {
      });
    });
  });
});

export default Router;
