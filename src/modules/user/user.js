'use strict';
var angular;
(function (angular) {
  var cmfUser = angular.module('cmf.user', ['ngResource', 'cmf.logger', 'ngCookies']);

  /**
   * The user resource expects a restful resource at
   * /user.
   */
  cmfUser.factory("UserService", function ($resource) {
    var CreateResource = function (baseUrl) {
      var UserService = $resource(baseUrl + '/content/user/:id', {}, {
        update: { method: 'PUT' },
      });
      return UserService;
    }
    return CreateResource;
  });

  /**
   * The login resource is a special resource
   * for creating a token to use.
   */
  cmfUser.factory('LoginService', function ($resource) {
    var CreateResource = function (baseUrl) {
      var LoginService = $resource(baseUrl + '/login/:id', {}, {
        update: { method: 'PUT' },
      });

      /**
       * Log a user in through the login service.
       */
      LoginService.login = function (username, password, loggedInFn, loginFailedFn) {
        this.save({ "username": username, "password": password }, function (result) {
          loggedInFn(result.token);
        }, function (result) {
          loginFailedFn(result.error);
        });
      };

      /**
       * Log a user in through the login service.
       */
      LoginService.logout = function (token, loggedOutFn, logoutFailedFn) {
        this.delete({ token: token  }, function (result) {
          loggedOutFn();
        }, function (result) {
          logoutFailedFn(result.errors);
        });
      };

      return LoginService;
    }
    return CreateResource;
  });

  /**
   * A basic session service that keeps track of a client-side
   * session.
   */
  cmfUser.factory('SessionService', function ($cookieStore) {
    return {
      createSession: function (token) {
        var session = {
          token: token,
          save: function () {
            $cookieStore.put("cmf_session", this);
          },
          remove: function () {
            $cookieStore.remove("cmf_session");
          }
        };
        return session;
      },
      getSession: function () {
        return $cookieStore.get("cmf_session");
      },
    };
  });


  /**
   * A very basic login controller. Can be used to
   * show a login screen.
   */
  cmfUser.controller('LoginController', function ($scope, LoginService, Logger, SessionService) {
    $scope.logger = new Logger();
    $scope.login = function () {
      $scope.logger.clear();
      LoginService.login($scope.username, $scope.password, function (token) {
        SessionService.createSession(token);
      }, function (errors) {
        $scope.logger.addMessage("error", errors);
      });
    };
  });

  /**
   * The login directive can be used to insert
   * a login form into a website.
   */
  cmfUser.directive('login', function () {
    var directive = {
      restrict: 'E',
      replace: true,
      scope: { login: '=login' },
      template: '<form class="login" ng-submit="login()">' +
        '<input type="text" name="username" ng-model="username" placeholder="Username" required />' +
        '<input type="password" name="password" ng-model="password" placeholder="Password" required />' +
        '<input type="submit" name="submit" value="Log in" />' +
        '</form>'
    };
    return directive;
  });
}(angular));
