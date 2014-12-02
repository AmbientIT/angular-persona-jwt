(function (angular) {
    'use strict';

    angular.module('angular-persona-jwt', [
        'angular-persona-jwt.services',
        'angular-persona-jwt.directives'
    ]);

})(angular);



(function (angular) {
    'use strict';

    function personaLogin($window,persona) {
        function login() {
            $window.navigator.id.request();
        }

        return {
            restrict: 'EA',
            scope: {
                onLogin: '=',
                onLogout: '='
            },
            transclude: true,
            controller: function ($scope,persona) {
                this.login = login;
                $scope.$watch(function () {
                    return persona;
                }, function () {
                    if (persona.loggedUser && $scope.onLogin) {
                        $scope.onLogin();
                    }
                }, true);
            },
            controllerAs: 'persona',
            template: '<div ng-transclude ng-click="persona.login()"></div>'
        };
    }

    function personaLogout($window,persona) {
        function logout() {
            $window.navigator.id.logout();
        }

        return {
            restrict: 'EA',
            transclude: true,
            scope: {},
            controller: function () {
                this.logout = logout;
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
                tokenStorageKey: 'angular-persona-jwt-token'
            };
        this.config = function (data) {
            options = angular.extend(options, data);
            $httpProvider.interceptors.push(function ($q) {
                return {
                    request: function (httpConfig) {
                        var token = $window.localStorage.getItem(options.tokenStorageKey);
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

            var loginListeners = [];
            var logoutListeners = [];
            var loginFailListeners = [];

            service.addLoginListener = function (listener) {
                loginListeners.push(listener);
            };

            service.addLogoutListener = function (listener) {
                logoutListeners.push(listener);
            };

            service.addLoginFailListener = function (listener) {
                loginFailListeners.push(listener);
            };

            service.login = function (assertion) {
                var param = {
                    assertion: assertion,
                    audience: options.audience
                };
                $http
                    .post(options.baseUrl + '/login', param)
                    .success(function (data) {
                        service.loggedUser = data.user;
                        $window.localStorage.setItem(options.tokenStorageKey, data.token);
                        angular.forEach(loginListeners, function (listener) {
                            listener(data.user);
                        });
                    })
                    .error(function (error) {
                        console.log('Login failed :', error.message);
                        angular.forEach(loginFailListeners, function (listener) {
                            listener();
                        });
                    });
            };

            service.logout = function () {
                service.loggedUser = null;
                $window.localStorage.removeItem(options.tokenStorageKey);
                angular.forEach(logoutListeners, function (listener) {
                    listener();
                });
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



