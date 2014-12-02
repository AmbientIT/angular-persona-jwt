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



