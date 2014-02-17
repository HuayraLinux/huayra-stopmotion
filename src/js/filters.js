var app = angular.module('app');

app.filter('range', function() {
  return function(arr, lower, upper) {
    for (var i = lower; i <= upper; i++){
      arr.push(i);
    }
    return arr;
  };
});

app.filter('incrementar', function() {
  return function(input) {
    return parseInt(input, 10) + 1;
    ;
  };
});