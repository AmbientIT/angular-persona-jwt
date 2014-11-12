(function(angular){
  'use strict';

  function personaLogin($window){
    function login() {
      $window.navigator.id.request();
    }

    return {
      restrict: 'EA',
      scope: true,
      transclude: true,
      controller: function () {
        this.login = login;
      },
      controllerAs: 'persona',
      template: '<div ng-transclude ng-click="persona.login()"></div>'
    };
  }

  function personaLogout($window){
    function logout() {
      $window.navigator.id.logout();
    }

    return {
      restrict: 'EA',
      transclude: true,
      scope: true,
      controller: function () {
        this.logout = logout;
      },
      controllerAs: 'persona',
      template: '<div ng-transclude ng-click="persona.logout()"></div>'
    };
  }

  angular.module('angular-persona-jwt.directives',[])
    .directive('personaLogin', personaLogin)
    .directive('personaLogout', personaLogout);

})(angular);



