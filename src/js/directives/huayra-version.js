var app = angular.module('app');

app.directive('huayraVersion', function() {
  return {
    restrict: "E",
    transclude: true,
    controller: function($scope, $http, $timeout) {
      $scope.data = {};
      $scope.data.version = "0.4.17";
      $scope.data.info_url = "";
      $scope.data.status = 'query'; // 'ok' 'update' 'error'


      function compare(left, right) {
        if (typeof left + typeof right != 'stringstring')
        return false;

        var a = left.split('.')
        ,   b = right.split('.')
        ,   i = 0, len = Math.max(a.length, b.length);

        for (; i < len; i++) {
          if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
            return 1;
          } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
            return -1;
          }
        }

        return 0;
      }



      function consultar_version() {
        $http.get('http://devel.huayra.conectarigualdad.gob.ar/pkg/version/huayra-stopmotion').
          then(function(response) {
            var current_version = response.data.current_version;
            $scope.data.info_url = response.data.info_url;


            var value = compare($scope.data.version, current_version);
            console.log($scope.data.version, current_version, value);

            console.log({
              "version": $scope.data.version,
              "current_version": current_version,
              "value": value
            });

            if (value >= 0)
              $scope.data.status = "ok";
            else
              $scope.data.status = "update";


          }).
          catch(function(response) {
            console.error("error", response);
            $scope.data.status = "error";
          });
      }

      $scope.abrir_link = function(url) {
        var gui = require('nw.gui');
        gui.Shell.openExternal(url);
      };

      $timeout(consultar_version, 4000);
    },
    scope: {
      url_new_version: "&",
    },
    templateUrl: "partials/directives/huayra-version.html",
  };
});
