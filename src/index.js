(function(angular){
  'use strict';

  function config($httpProvider,personaProvider){
    $httpProvider.interceptors.push(function ($q) {
      return {
        request: function (httpConfig) {
          var token = localStorage.getItem(personaProvider.getTokenName());
          if (token) {
            httpConfig.headers.Authorization = 'Bearer ' + token;
          }
          return httpConfig;
        },
        responseError: function (response) {
          return $q.reject(response);
        }
      };
    });
  }

  angular.module('angular-persona-jwt', [
    'angular-persona-jwt.services',
    'angular-persona-jwt.directives'
  ]).config(config);
})(angular);


