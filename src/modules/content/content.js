'use strict';
var angular, _;
var content = angular.module('cmf.content', ['ngResource']);

content.provider("cmfField", function () {
  return {
    types: {
      "http://angular-cmf.org/Text": {
        name: "Text",
        inputType: "text",
        defaultWidget: "InputWidget",
      },
      "http://angular-cmf.org/Username": {
        name: "Text",
        inputType: "text",
        defaultWidget: "InputWidget",
      },
      "http://angular-cmf.org/Number": {
        name: "Number",
        inputType: "number",
        defaultWidget: "InputWidget",
      },
      "http://angular-cmf.org/Email": {
        name: "Email",
        inputType: "email",
        defaultWidget: "InputWidget",
      },
      "http://angular-cmf.org/Url": {
        name: "Url",
        inputType: "url",
        defaultWidget: "InputWidget",
      },
      "http://angular-cmf.org/LongText": {
        name: "LongText",
        defaultWidget: "TextAreaWidget"
      }
    },
    $get: function () {
      var self = this;
      return function (name) {
        return self.types[name];
      };
    },
    getField: function (definition) {
      return this.types[definition];
    },
    field: function (name, definition) {
      this.types[name] = definition;
    }
  };
});

content.provider("cmfWidget", function (cmfFieldProvider) {
  return {
    /**
     * A collection of available widgets.
     * Populated by decorating this service.
     */
    widgets: {
      // The most basic of widgets, just outputs and input.
      "InputWidget": {
        template: '<label for="{{name}}">{{label}}</label><input type="{{type}}" ng-model="data" name="{{name}}"  ng-required="requiredfield" />',
        fields: ["http://angular-cmf.org/Text", "http://angular-cmf.org/Number", "http://angular-cmf.org/Email", "http://angular-cmf.org/Url", "http://angular-cmf-org/Username"]
      },
      // The most basic of widgets, just outputs and input.
      "TextAreaWidget": {
        template: '<label for="{{name}}">{{label}}</label><textarea name="{{name}}" ng-model="data"></textarea>',
        fields: ["http://angular-cmf.org/LongText"]
      }
    },

    /**
     * Get viable widgets for a particular field type.
     * @param string field
     *   the field type to filter for.
     */
    getWidgets: function (field) {
      return _.filter(cmfFieldProvider.fields, function (value) {
        return _.contains(value.fields, field);
      });
    },

    $get: function () {
      var self = this;
      return function (name) {
        return self.widgets[name];
      };
    },

    widget: function (name, widget) {
      this.widgets[name] = widget;
    },

    getWidget: function (name) {
      return this.widgets[name];
    }
  };
});

content.factory('TypeService', function ($resource) {
  return function (baseUrl) {
    return $resource(baseUrl + '/types/:id');
  };
});

// Generate a complete content form based on the data returned
// from a web service.
content.directive("contentform", function (cmfField, cmfWidget) {
  var directive = {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      entity: '=entity',
      context: '=context',
      save: "=save",
      properties: "=properties"
    },
    template: '<form class="form" ng-submit="save()">' +
      '<div class="control-group" ng-repeat="(name, type) in context">' +
      '<widget type="{{type}}" name="{{ name }}" data="entity[name]" requiredfield="properties[name].required" label="{{ properties[name].label }}"></widget></div><input type="submit" class="btn btn-primary" value="Save" /></form>'
  };
  return directive;
});

content.directive("widget", function (cmfField, cmfWidget, $compile) {
  var directive = {
    restrict: 'E',
    replace: true,
    scope: {
      type: '@type',
      widget: "@widget",
      data: "=data",
      name: "@name",
      label: "@label",
      requiredfield: "=requiredfield"
    },
    link: function (scope, element, attrs) {
      // The attribute type must exist.
      var update = function (type) {
        if (type) {
          var widget, widgetName, field = cmfField(attrs.type), link, template;
          if (!field) {
            console.log(attrs.type);
          }
          if (field) {
            widgetName = attrs.widget || field.defaultWidget;
            if (widgetName) {
              widget = cmfWidget(widgetName);
              // Element types can't be set after inserted into the dom,
              // so we need to handle that ourselves first.
              template = widget.template.replace("{{type}}", field.inputType);
              element.html(template);
              link = $compile(element.contents());
              link(scope);
            }
          }
        }
      };
      update(attrs.type);
      scope.$watch('type', update);
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
