var app = angular.module('app');

app.config(function($routeProvider) {
  $routeProvider.
    when('/index', {
      controller: 'IndexCtrl',
      templateUrl: 'partials/index.html'
    }).
    otherwise({
      redirectTo:'/index'
    });
});
