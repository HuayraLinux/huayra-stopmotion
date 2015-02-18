var app = angular.module('app');

app.directive('huayraVersion', function() {
  return {
    restrict: "E",
    transclude: true,
    controller: function($scope, $http) {
      $scope.data = {};
      $scope.data.version = "0.4.17";
      $scope.data.changelog_sorted = [];
    },
    scope: {
      url_new_version: "&",
    },
    templateUrl: "partials/directives/huayra-version.html",
  };
});
