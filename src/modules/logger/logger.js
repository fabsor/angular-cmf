angular.module('cmfLogger', [])
  .factory('Logger', function () {

    /**
     * A simple logger that stores things in memory.
     */
    var Logger = function () {
      this.messages = [];
      this.callbacks = [];
    }

    /**
     * Log a message.
     * @param string the type of message to log.
     */
    Logger.prototype.log = function (type, message, context) {
      message = { type: type, message: message, context: context };
      this.messages.push(message);
    }

    /**
     * Get all messages that have been logged.
     */
    Logger.prototype.getMessages = function () {
      return this.messages;
    }

    /**
     * Iterate over each message in the log.
     */
    Logger.prototype.eachMessage = function (callback) {
      _.each(this.messages, callback);
    }

    /**
     * Remove a message with a specific key.
     */
    Logger.prototype.removeMessage = function (key) {
      this.messages = this.messages.splice(key, key);
    }
    /**
     * Clear all logs.
     */
    Logger.prototype.clear = function () {
      this.messages = [];
    }

    Logger.prototype.hasErrors = function () {
      return _.some(this.messages, function (message) { return message.type == 'error' });
    }
    return Logger;
  });

  /**
   * Show current status.
   */
  .directive('status', function () {
    directive = {
      restrict: 'E',
      replace: true,
      scope: { logger: '=logger' },
      transclude: true,
      template: '<div class="status">' +
        '<div class="messages" ng-repeat="(key, message) in logger.getMessages()">' +
        '<div class="message alert alert-{{message.type}}">' +
        '<a href="#" class="close" ng-click="logger.removeMessage(key)">&times;</a>' +
        '{{message.message}}</div>' +
        '</div>' +
        '</div>'
    };
    return directive;
  });
