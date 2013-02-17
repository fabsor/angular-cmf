'use strict';
var angular;

var content = angular.module('cmf.content', ['ngResource']);

content.factory('TypeService', function ($resource) {
  var CreateResource = function (baseUrl) {
    return $resource(baseUrl + '/types/:id');
  }
  return CreateResource;
});

content.factory("Widgets", function () {
  var Widgets = {};
  Widgets.textfield = {
    types: ["http://schema.org/string", "http://schema.org/integer"],
  };

});

/**
 * The content service
 */
content.factory('ContentService', function ($resource) {
  var CreateResource = function (baseUrl, type) {
    var ContentResource = $resource(baseUrl + '/content/' + type, {}, {
      update: { method: 'PUT' },
    });
  };
  return CreateResource;
});

content.directive("ctable", function () {
  var directive = {
    restrict: 'E',
    replace: true,
    scope: { data: '=data', properties: "=properties" },
    template: '<table class="table">' +
      '<tr ng-repeat="item in data">' +
      '<td><input type="checkbox" ng-model="item.checked" /></td>' +
      '<td ng-repeat="properties in property">{{ data[property] }}</td>' +
      '</tr>' +
      '</table>'
  };
  return directive;
});
