hallo = angular.module "hallo", []
hallo.directive "hallo", ->
  directive =
    restrict: 'A'
    require: 'ngModel'
    link: (scope, elm, attrs, ngModel) ->
      elm.hallo
      elm.on "hallomodified", ->
        ngModel.$setViewValue elm.html()
  return directive
