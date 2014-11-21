import Ember from 'ember';

export function percent(input) {
  return Math.round(input * 10000) / 100 + '%';
}

export default Ember.Handlebars.makeBoundHelper(percent);
