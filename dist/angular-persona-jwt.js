(function (angular) {
    'use strict';

    angular.module('angular-persona-jwt', [
        'angular-persona-jwt.services',
        'angular-persona-jwt.directives'
    ]);

})(angular);



(function (angular) {
    'use strict';

    function personaLogin($window) {
        function login() {
            $window.navigator.id.request();
        }

        return {
            restrict: 'EA',
            scope: {
                onlogin: '='
            },
            transclude: true,
            controller: function () {
                this.login = login;
            },
            controllerAs: 'persona',
            template: '<div ng-transclude ng-click="persona.login()"></div>'
        };
    }

    function personaLogout($window) {
        function logout() {
            $window.navigator.id.logout();
        }

        return {
            restrict: 'EA',
            transclude: true,
            scope: true,
            controller: function ($scope, persona) {
                this.logout = logout;
                $scope.$watch(function () {
                    return persona.loggedInUser;
                }, function (value) {
                    if (value) {
                        $scope.onLogin();
                    }
                });
            },
            controllerAs: 'persona',
            template: '<div ng-transclude ng-click="persona.logout()"></div>'
        };
    }

    angular.module('angular-persona-jwt.directives', [])
        .directive('personaLogin', personaLogin)
        .directive('personaLogout', personaLogout);

})(angular);




(function (angular) {
    'use strict';

    function personaProvider($windowProvider, $httpProvider) {

        var $window = $windowProvider.$get(),
            options = {
                baseUrl: 'localhost',
                audience: $window.location.href,
                tokenName: 'token'
            };
        this.config = function (data) {
            options = angular.extend(options, data);
            $httpProvider.interceptors.push(function ($q) {
                return {
                    request: function (httpConfig) {
                        var token = $window.localStorage.getItem(options.tokenName);
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
        };


        function Persona($http) {
            var service = {};

            service.login = function (assertion) {
                var param = {
                    assertion: assertion,
                    audience: options.audience
                };
                $http.post(options.baseUrl + '/login', param).success(function (data) {
                    service.loggedUser = data.user;
                    $window.localStorage.setItem(options.tokenName, data.token);
                }).error(function (err) {
                    console.log(err);
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

    angular.module('angular-persona-jwt.services', [])
        .provider('persona', personaProvider);

})(angular);



