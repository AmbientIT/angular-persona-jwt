(function(angular){
  'use strict';

  function config($httpProvider,personaProvider){

  }

  angular.module('angular-persona-jwt', [
    'angular-persona-jwt.services',
    'angular-persona-jwt.directives'
  ]).config(config);
})(angular);


