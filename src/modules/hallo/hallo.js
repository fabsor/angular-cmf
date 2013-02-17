'use strict';
var angular;
var hallo = angular.module("hallo", []);

hallo.directive("hallo", function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elm, attrs, ngModel) {
      elm.hallo();
      elm.on("hallomodified", function () {
        ngModel.$setViewValue(elm.html());
      });
    }
  };
});
