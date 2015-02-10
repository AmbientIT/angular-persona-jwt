angular.module('angular-persona-jwt', [
    'angular-persona-jwt.navigator'
])
    .provider('persona', function personaProvider() {

        const TOKEN_STORAGE_KEY = 'angular-persona-jwt-token';
        const LOGGED_USER_STORAGE_KEY = 'angular-persona-jwt-logged-user';

        var options = {};

        return {

            config: function (userOptions) {
                options = userOptions ? userOptions : {};
            },

            $get: function Persona($http, $window, $q, $log, personaNavigator) {
                var persona = this;

                persona.login = function () {
                    return personaNavigator.login()
                        .then(function validateAssertion(assertion) {
                            var serverUrl = options.authBackendUrl ? options.authBackendUrl : '';
                            return $http.post(serverUrl + '/auth/login', {assertion: assertion});
                        })
                        .catch(function handleInvalidAssertionError(response) {
                            personaNavigator.logout();
                            if (response.status === 401)
                                return $q.reject({message: 'invalid assertion'});
                            else
                                return $q.reject(response);
                        })
                        .then(function checkHasToken(response) {
                            if (!response.data.token) {
                                var message = 'JWT token is missing';
                                $log.error(message);
                                return $q.reject({message: message});
                            }
                            return response.data;
                        })
                        .then(function storeInLocalStorage(data) {
                            $window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
                            $window.localStorage.setItem(LOGGED_USER_STORAGE_KEY, data.loggedUser);
                            return data.loggedUser;
                        });
                };

                persona.logout = function () {
                    $window.localStorage.removeItem(TOKEN_STORAGE_KEY);
                    $window.localStorage.removeItem(LOGGED_USER_STORAGE_KEY);
                    personaNavigator.logout();
                };

                persona.getLoggedUser = function () {
                    return $window.localStorage.getItem(LOGGED_USER_STORAGE_KEY);
                };

                return persona;
            }

        };
    })

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push(function ($window) {
            return {
                request: function addTokenToHeader(httpConfig) {
                    var token = $window.localStorage.getItem('angular-persona-jwt-token');
                    if (token) {
                        httpConfig.headers.Authorization = 'Bearer ' + token;
                    }
                    return httpConfig;
                }
            };
        });
    });