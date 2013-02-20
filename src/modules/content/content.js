'use strict';
var angular, _;
var content = angular.module('cmf.content', ['ngResource']);

content.factory('TypeService', function ($resource) {
  return function (baseUrl) {
    return $resource(baseUrl + '/types/:id');
  };
});

content.factory("Fields", function () {
  return {
    types: {
      "http://angular-cmf.org/Text": {
        name: "Text",
        inputType: "text"
      },
      "http://angular-cmf.org/Number": {
        name: "Number",
        inputType: "number",
      },
      "http://angular-cmf.org/Email": {
        name: "Email",
        inputType: "email",
      },
      "http://angular-cmf.org/Url": {
        name: "Url",
        inputType: "url",
      },
      "http://angular-cmf.org/Longtext": {
        name: "LongText",
      }
    },
    getField: function (definition) {
      return this.types[definition];
    }
  };
});


content.factory("Widgets", function (Fields) {
  return {
    /**
     * A collection of available widgets.
     * Populated by decorating this service.
     */
    widgets: {
      // The most basic of widgets, just outputs and input.
      "InputWidget": {
        template: '<input type="{{type}}" ng-model="data" />',
        fields: ["http://angular-cmf.org/Text", "http://angular-cmf.org/Number", "http://angular-cmf.org/Email", "http://angular-cmf.org/Url"]
      }
    },

    /**
     * Get viable widgets for a particular field type.
     * @param string field
     *   the field type to filter for.
     */
    getWidgets: function (field) {
      return _.filter(Fields, function (value) {
        return _.contains(value.fields, field);
      });
    },

    getWidget: function (name) {
      return this.widgets[name];
    }
  };
});

// Generate a complete content form based on the data returned
// from a web service.
content.directive("contentform", function (Fields, Widgets) {
  var directive = {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: { entity: '=entity', context: '=context' },
    template: '<form class="form"><div class="control-group" ng-repeat="(name, type) in context"><widget type="{{type}}" widget="InputWidget" data="entity[name]"></widget></div></form>'
  };
  return directive;
});

content.directive("widget", function (Widgets, $compile) {
  var directive = {
    restrict: 'E',
    replace: true,
    scope: { type: '@type', widget: "@widget", data: "=data" },
    link: function (scope, element, attrs) {
      // Find the widget we are looking for.
      var widget = Widgets.getWidget(attrs.widget), link, template;
      // Element types can't be set after inserted into the dom,
      // so we need to handle that ourselves first.
      template = widget.template.replace("{{type}}", attrs.type);
      element.html(template);
      link = $compile(element.contents());
      console.log(scope);
      link(scope);
    },
  };
  return directive;
});

/**
 * The content service
 */
content.factory('ContentService', function ($resource) {
  var CreateResource = function (baseUrl, type) {
    var ContentResource = $resource(baseUrl + '/content/' + type, {}, {
      update: { method: 'PUT' }
    });
  };
  return CreateResource;
});

content.directive("ctable", function () {
  var directive = {
    restrict: 'E',
    replace: true,
    scope: { data: '=data', properties: "=properties" },

  };
  return directive;
});
