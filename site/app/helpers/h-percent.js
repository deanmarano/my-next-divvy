import Ember from 'ember';

export function percent(input, precision) {
  if(typeof precision === 'number') {
    return Math.round(input * (10000 * precision)) / (100 * precision) + '%';
  } else {
    return Math.round(input * 10000) / 100 + '%';
  }
}

export default Ember.Handlebars.makeBoundHelper(percent);
