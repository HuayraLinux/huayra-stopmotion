var app = angular.module('app');

app.directive('zippy', function(){
  return {
    restrict: 'C',
    replace: true,
    transclude: true,
    scope: {
      title: '@zippyTitle',
      date: '@date',
    },
    template: '<div>' +
    '<div class="title"> {{title}} </div>' +
    '<div class="body zippy-body" ng-transclude></div>' +
    '</div>',
    link: function(scope, element, attrs) {
      var title = angular.element(element.children()[0]),
      opened = true;

      title.bind('click', toggle);

      function toggle() {
        opened = !opened;
        element.removeClass(opened ? 'closed' : 'opened');
        element.addClass(opened ? 'opened' : 'closed');
      }

      toggle();
    }
  };
});
