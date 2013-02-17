'use strict';
var angular;

// Specify your base url here.
var backendBaseUrl = 'http://192.168.50.2/angular-cmf/index.php';

var project = angular.module("project", ["cmf.user", "ngResource"]);

project.config(function ($routeProvider) {
  $routeProvider
    .when('/login', { controller: 'Login', template: '<status logger="logger"></status><login login="login"></login>' })
    .when('/', { controller: 'User', templateUrl: "../modules/user/templates/user-admin.html" })
    .when('/user/add', { controller: 'UserAdd', templateUrl: "../modules/user/templates/user-add.html" })
    .when('/user/:id', { controller: 'UserView', templateUrl: "../modules/user/templates/user-view.html" });
});

project.controller('UserAdd', function ($scope, UserService, TypeService, UserAdd, SessionService, $location) {
  var session = SessionService.getSession();
  if (!session) {
    $location.path('/login');
  } else {
    // Set up backend url.
    var Types = TypeService(backendBaseUrl), User = UserService(backendBaseUrl);
    UserAdd(User, Types, $scope);
  }
});

project.controller('UserView', function ($scope, $routeParams, UserService, SessionService, $location, UserView, RoleService) {
  var User = UserService(backendBaseUrl);
  var Role = RoleService(backendBaseUrl);
  UserView($routeParams.id, User, Role, $scope);
});

project.controller('User', function ($scope, UserService, Logger, UserAdmin, SessionService, $location) {
  var session = SessionService.getSession();
  if (!session) {
    $location.path('/login');
  } else {
    // Set up backend url.
    var User = UserService(backendBaseUrl);
    UserAdmin(User, $scope);
  }
});

project.controller('Login', function ($scope, LoginService, Logger, SessionService, $location) {
  var session = SessionService.getSession();
  if (session) {
    $location.path('/');
  } else {
    var Login = LoginService(backendBaseUrl);
    $scope.logger = new Logger();
    $scope.login = function (username, password) {
      Login.login(username, password, function (token) {
        SessionService.createSession(token);
        $location.path('/');
      }, function (errors) {
        $scope.logger.addMessage("error", errors);
      });
    };
  }
});
