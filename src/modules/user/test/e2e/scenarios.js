describe('Angular CMF User Login', function() {
  beforeEach(function() {
    browser().navigateTo('index.html');
  });

  it ('should display a login form', function () {
    expect(element('input[name="username"]').count()).toBe(1);
    expect(element('input[name="password"]').count()).toBe(1);
    expect(element('input[name="submit"]').count()).toBe(1);
  });
});
