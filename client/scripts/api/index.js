'use strict';

define([
  'angular',
  'camunda-bpm-sdk',
  'camunda-bpm-sdk-mock'
],
function(
  angular,
  CamSDK,
  MockClient
) {
  var apiModule = angular.module('cam.tasklist.client', []);

  apiModule.value('HttpClient', CamSDK.Client);

  apiModule.value('CamForm', CamSDK.Form);

  apiModule.value('MockHttpClient', MockClient);

  apiModule.factory('camAPIHttpClient', [
          'MockHttpClient', '$rootScope', '$location', '$translate', 'Notifications',
  function(MockHttpClient,   $rootScope, $location, $translate, Notifications) {

    function AngularClient(config) {
      var Client = (config.mock === true ? MockHttpClient : CamSDK.Client.HttpClient);
      this._wrapped = new Client(config);
    }

    angular.forEach(['post', 'get', 'load', 'put', 'del', 'options', 'head'], function(name) {
      AngularClient.prototype[name] = function(path, options) {
        if (!options.done) {
          return;
        }

        if (!$rootScope.authentication) {
          return options.done(new Error('Not authenticated'));
        }

        var original = options.done;

        options.done = function(err, result) {
          $rootScope.$apply(function() {
            // in case the session expired
            if (err && err.status === 401) {
              // broadcast that the authentication changed
              $rootScope.$broadcast('authentication.changed', null);
              // set authentication to null
              $rootScope.authentication = null;


              $translate([
                'SESSION_EXPIRED',
                'SESSION_EXPIRED_MESSAGE'
              ]).then(function(translations) {
                Notifications.addError({
                  status: translations.SESSION_EXPIRED,
                  message: translations.SESSION_EXPIRED_MESSAGE,
                  exclusive: true
                });
              });
              
              // broadcast event that a login is required
              // proceeds a redirect to /login
              $rootScope.$broadcast('authentication.login.required');

              return;
            }

            original(err, result);
          });
        };

        this._wrapped[name](path, options);
      };
    });

    angular.forEach(['on', 'once', 'off', 'trigger'], function(name) {
      AngularClient.prototype[name] = function() {
        this._wrapped[name].apply(this, arguments);
      };
    });

    return AngularClient;
  }]);


  apiModule.factory('camAPI', [
          'camAPIHttpClient',
  function(camAPIHttpClient) {
    var conf = {
      apiUri:     'engine-rest/engine',
      HttpClient: camAPIHttpClient
    };

    if (window.tasklistConf) {
      for (var c in window.tasklistConf) {
        conf[c] = window.tasklistConf[c];
      }
    }

    return new CamSDK.Client(conf);
  }]);

  // apiModule.factory('camForm', ['CamForm', function(CamEmbeddedForm) {
  //   return
  // }]);

  return apiModule;
});
