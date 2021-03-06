'use strict';
var angular, _;
var cmfUser = angular.module('cmf.user', ['ngResource', 'cmf.logger', 'ngCookies', "cmf.content", "ui", "hallo"]);

/**
 * Configure fields and widgets for users and roles.
 */
cmfUser.config(function (cmfWidgetProvider, cmfFieldProvider) {
  /**
   * The password entry widget is handy for entering and
   * verifying passwords.
   */
  cmfWidgetProvider.widget("PasswordEntry", {
    template: '<label for="{{name}}">{{label}}</label><passwordentry password="data"></passwordentry>',
    fields: ["http://angular-cmf.org/Password"]
  });

  /**
   * Password field handler.
   */
  cmfFieldProvider.field("http://angular-cmf.org/Password", {
    name: "Password",
    defaultWidget: "PasswordEntry"
  });
});

/**
 * The user resource expects a restful resource at
 * /user.
 */
cmfUser.factory("UserService", function ($resource) {
  return function (baseUrl) {
    var UserService = $resource(baseUrl + '/content/user/:id', {}, {
      update: { method: 'PUT' },
    });
    return UserService;
  };
});

/**
 * The role service creates resources for getting
 * roles from a content repository.
 */
cmfUser.factory("RoleService", function ($resource) {
  return function (baseUrl) {
    var RoleService = $resource(baseUrl + '/content/role/:id', {}, {
      update: { method: 'PUT' },
    });
    return RoleService;
  };
});

/**
 * The login resource is a special resource
 * for creating a token to use.
 */
cmfUser.factory('LoginService', function ($resource) {
  return function (baseUrl) {
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
  };
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
      session.save();
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

// User admin helper function for controlling an
// admin page.
cmfUser.factory('UserAdmin', function () {
  var UserAdmin = function (logger, service, $scope) {
    $scope.logger = logger;
    $scope.statusName = function (status) {
      return status ? "Active" : "Blocked";
    };
    $scope.title = "Users";
    $scope.properties = ["username", "email"];
    $scope.boxesChecked = function () {
      return _.some($scope.users, function (user) { return user.checked });
    };
    service.query({}, function (data) {
      $scope.users = data;
    }, function (data) {
      if (data.status === 401) {
        logger.log("error", "Could not access this page.");
      }
    });
    $scope.performOperation = function () {

    };
  };
  return UserAdmin;
});

// User admin helper function for controlling an
// admin page.
cmfUser.factory('UserAdd', function ($location) {
  var UserAdd = function (logger, service, typeservice, $scope) {
    $scope.user = {};
    typeservice.get({ id: 'user' }, function (userType) {
      $scope.context = userType.context;
      $scope.properties = userType.properties;
      $scope.logger = logger;
      $scope.createUser = function () {
        service.save($scope.user, function () {
          logger.addMessage("status", "User added");
          $location.path('/');
        }, function (data) {
          if (data.status === 406) {
            _.each(data.data.errors, function (error) {
              logger.log("error", error);
            });
          }
          if (data.status === 401) {
            logger.log("error", "You don't have access to create this user.");
          }
        });
      };
    });
  };
  return UserAdd;
});

/**
 * Function for viewing and potentially edit a user.
 */
cmfUser.factory('UserView', function () {
  var UserView = function (id, service, roleservice, logger, $scope) {
    $scope.logger = logger;
    service.get({ id: id }, function (user) {
      roleservice.query({}, function (roles) {
        $scope.user = user;
        $scope.properties = _.keys(user.context());
        $scope.show = true;
        $scope.roles = _.pluck(roles, 'name');
        $scope.changeRole = false;
        $scope.availableRoles = function (role) {
          var roles = _.difference($scope.roles, $scope.user.roles);
          roles.push(role);
          return roles;
        };
        $scope.addRole = function () {
          $scope.user.roles.push("");
        };
        $scope.removeRole = function (role) {
          $scope.user.roles = _.without($scope.user.roles, role);
        };
        $scope.editUser = function () {
          service.update(
            { id: $scope.user.id },
            $scope.user,
            function () {
              logger.log('status', "User updated");
            },
            function (error) {
              console.log(error);
              logger.log('error', "Something went wrong.");
            });
        };
      }, function (data) {
        logger.log("error", "Could not retrieve roles");
      });
    }, function (data) {
      console.log(data);
      if (data.status === 401) {
        logger.log("error", "You don't have access to this information.");
      }
    });
  };
  return UserView;
});

cmfUser.directive("passwordentry", function () {
  var directive = {
    restrict: 'E',
    replace: true,
    controller: function ($scope) {
      $scope.passwordLabel = $scope.newpassword ? "Password" : "New password";

    },
    scope: { password: '=password', newpassword: "=newpassword" },
    template: '<fieldset class="password"><legend>Password</legend>' +
      '<div class="control-group" ng-show="newpassword">' +
      '<label for="password">Current password</label>' +
      '<input type="password" name="current_password" ng-model="currentPassword" placeholder="Current password" />' +
      '</div>' +
      '<div class="control-group">' +
      '<label for="new_password">{{passwordlabel}}</label>' +
      '<input type="password" name="password" ng-model="password" placeholder="New password" />' +
      '</div>' +
      '<div class="control-group">' +
      '<label for="passwordverify">Confirm password</label>' +
      '<input type="password" name="passwordverify" ng-model="passwordverify" placeholder="Confirm new password" />' +
      '</div></fieldset>'
  };
  return directive;
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
    template: '<form class="login form-horizontal" ng-submit="login(username, password)">' +
      '<div class="control-group"><input type="text" name="username" ng-model="username" placeholder="Username" required /></div>' +
      '<div class="control-group"><input type="password" name="password" ng-model="password" placeholder="Password" required /></div>' +
      '<div class="control-group"><input type="submit" name="submit" value="Log in" class="btn btn-primary" /></div>' +
      '</form>'
  };
  return directive;
});
