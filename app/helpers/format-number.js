import Ember from 'ember';

export function formatNumber([number, minWidth=1, ...toStringArgs]/*, hash*/) {
  const numberString = number.toString(...toStringArgs);
  return '0'.repeat(Math.max(minWidth - numberString.length, 0)) + numberString;
}

export default Ember.Helper.helper(formatNumber);
