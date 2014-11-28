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

            service.addLoginListener = function (loginListener) {
                loginListeners.push(loginListener);
            };

            service.addLogoutListener = function (logoutListener) {
                logoutListeners.push(logoutListener);
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
                        angular.forEach(loginListeners, function (loginListener) {
                            loginListener(data.user);
                        });
                    })
                    .error(function (err) {
                        console.log(err);
                    });
            };

            service.logout = function () {
                service.loggedUser = null;
                $window.localStorage.removeItem(options.tokenStorageKey);
                angular.forEach(logoutListeners, function (logoutListener) {
                    logoutListener();
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



