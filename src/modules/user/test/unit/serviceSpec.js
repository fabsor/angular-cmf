'use strict';
var describe, it, beforeEach, inject, expect, spyOn;

describe("Login service", function () {
  var LoginService, $httpBackend;
  beforeEach(module('cmf.user'));
  beforeEach(inject(function (_$httpBackend_, $injector, _LoginService_) {
    $httpBackend = _$httpBackend_;
    LoginService = _LoginService_;
  }));

  it("should return a token when logging in.", function () {
    $httpBackend.expectPOST('/login').respond({ token: "a-token" });
    LoginService.login("username", "password", function (token) {
      expect(token).toBe("a-token");
    });
  });

  it("should return an error when specifiyng wrong username and password.", function () {
    $httpBackend.expectPOST('/login').respond(401, { errors: ["Invalid login and password"] });
    LoginService.login("username", "password", function (token) {}, function (errors) {
      expect(errors).toBe(["Invalid login and password"]);
    });
  });

  it("should be possible to log out", function () {
    $httpBackend.expectDELETE('/login').respond(401, { errors: ["Invalid login and password"] });
    LoginService.logout("a-token", function () {
      expect(true).toBe(true);
    });
  });
});
