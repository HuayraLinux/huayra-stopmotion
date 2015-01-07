var app = angular.module('app');

app.directive('huayraVersion', function() {
  return {
    restrict: "E",
    transclude: true,
    controller: function($scope, $http) {
      $scope.data = {};
      $scope.data.version = "0.4.13";
      $scope.data.changelog_sorted = [];
      $scope.data.changelog_visible = false;

      $scope.show_changelog = function() {
        $scope.data.changelog_visible = true;
      };

      $scope.hide_changelog = function() {
        $scope.data.changelog_visible = false;
      };


      $http.get('./changelog.json').then(function(result) {
        $scope.data.changelog = result.data;

        for (var i=0; i<result.data.all_tags.length; i++) {
          var tag_name = result.data.all_tags[i];

          if (tag_name === 'current')
            continue;

          var item = result.data.changelog[tag_name];
          $scope.data.changelog_sorted.push(item);
        }

      });
    },
    scope: {
      url_new_version: "&",
    },
    templateUrl: "partials/directives/huayra-version.html",
  };
});
