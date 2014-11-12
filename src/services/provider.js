(function(angular){
  'use strict';

  function personaProvider($windowProvider) {

    var $window = $windowProvider.$get(),
      options = {
        baseUrl: 'localhost',
        audience: $window.location.href,
        tokenName: 'token'
      };
    this.config = function (data) {
      options = angular.extend(options,data);
    };

    function Persona($rootScope, $http) {
      var service = {};

      service.loggedUser = {};

      service.login = function (assertion) {
        var param = {
          assertion: assertion,
          audience: options.audience
        };
        $http.post(options.baseUrl + '/login', param).success(function (data) {
          service.loggedUser = data.user;
          $window.localStorage.setItem(options.tokenName, data.token);
        }).error(function (err) {
          $rootScope.$broadcast('login:error', err);
        });
      };

      service.logout = function () {
        $window.localStorage.removeItem(options.tokenName);
        service.loggedUser = null;
      };

      $window.navigator.id.watch({
        loggedInUser: service.loggedUser,
        onlogin: service.login,
        onlogout: service.logout
      });
      return service;
    }

    this.$get = Persona;

  }

  angular.module('angular-persona-jwt.services',[])
    .provider('persona', personaProvider);

})(angular);



