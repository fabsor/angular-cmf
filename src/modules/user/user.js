(function () {
var cmfUser = angular.module('cmf.user', ['ngResource', 'cmf.logger']);

/**
 * The user resource expects a restful resource at
 * /user.
 */
cmfUser.factory("User", function ($resource) {
  var User = $resource('/user/:id', {}, {
    update: { method: 'PUT' },
  });

  return User;
});

/**
 * The login resource is a special resource
 * for creating a token to use.
 */
cmfUser.factory('Login', function ($resource) {
  var Login = $resource('/login/:id', {}, {
    update: { method: 'PUT' },
  });
  return Login;
});

/**
 * The login directive can be used to insert
 * a login form into a website.
 */
cmfUser.directive('login', function(Logger, Login) {
  directive = {
    restrict: 'E',
    replace: true,
    scope: { logger: '=logger' },
    controller: function ($scope, $element) {
      $scope.login = function () {
        $scope.logger.clear();
        Login.save({ "username": $scope.username, "password": $scope.password }, function (result) {
          $cookieStore.put('user', result);
        }, function (result) {
          logger.addMessage("error", "The username and password did not match.");
        });
      }
    },
    template: '<form class="login" ng-submit="login()">' +
      '<input type="text" name="username" ng-model="username" placeholder="Username" required />' +
      '<input type="password" name="password" ng-model="password" placeholder="Password" required />' +
      '<input type="submit" name="submit" value="Log in" />' +
      '</form>'
  }
  return directive;
});
})();
