'use strict'
var angular;

// Specify your base url here.
var backendBaseUrl = 'http://192.168.50.2/angular-cmf/index.php';

var project = angular.module("project", ["cmf.user", "ngResource"]);

project.config(function ($routeProvider) {
  $routeProvider
    .when('/login', { controller: 'Login', template: '<status logger="logger"></status><login login="login"></login>' })
    .when('/', { controller: 'User', templateUrl: "../modules/user/templates/user-admin.html" });
});

project.controller('User', function ($scope, UserService, Logger, UserAdmin, SessionService) {
  var session = SessionService.getSession();
  if (!session) {
    // Set up backend url.
    var User = UserService(backendBaseUrl);
    UserAdmin(User, $scope);
  }
});

project.controller('Login', function ($scope, LoginService, Logger, SessionService) {
  var session = SessionService.getSession();
  var Login = LoginService(backendBaseUrl);
  $scope.logger = new Logger();
  $scope.login = function (username, password) {
    Login.login(username, password, function (token) {
      SessionService.createSession(token);
    }, function (errors) {
      $scope.logger.addMessage("error", errors);
    });
  };
});
