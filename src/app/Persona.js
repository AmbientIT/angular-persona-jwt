angular.module('angular-persona-jwt', [
    'angular-persona-jwt.navigator'
])

    .constant('PERSONA_TOKEN_STORAGE_KEY', 'angular-persona-jwt-token')
    .constant('PERSONA_LOGGED_USER_STORAGE_KEY', 'angular-persona-jwt-logged-user')

    .provider('persona', function personaProvider() {

        var options = {};

        return {

            config: function (userOptions) {
                options = userOptions ? userOptions : {};
            },

            $get: function Persona($http, $window, $q, $log, personaNavigator, PERSONA_TOKEN_STORAGE_KEY, PERSONA_LOGGED_USER_STORAGE_KEY) {
                var persona = this;
                var loggedUser = null;

                persona.login = function () {
                    return personaNavigator.get()
                        .then(function validateAssertion(assertion) {
                            var serverUrl = options.authBackendUrl ? options.authBackendUrl : '';
                            return $http.post(serverUrl + '/auth/login', {assertion: assertion});
                        })
                        .catch(function handleInvalidAssertionError(response) {
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
                            $window.localStorage.setItem(PERSONA_TOKEN_STORAGE_KEY, data.token);
                            $window.localStorage.setItem(PERSONA_LOGGED_USER_STORAGE_KEY, JSON.stringify(data.loggedUser));
                            return data.loggedUser;
                        });
                };

                persona.logout = function () {
                    loggedUser = null;
                    $window.localStorage.removeItem(PERSONA_TOKEN_STORAGE_KEY);
                    $window.localStorage.removeItem(PERSONA_LOGGED_USER_STORAGE_KEY);
                };

                persona.getLoggedUser = function () {
                    if (!loggedUser)
                        loggedUser = JSON.parse($window.localStorage.getItem(PERSONA_LOGGED_USER_STORAGE_KEY));
                    return loggedUser;
                };

                return persona;
            }

        };
    })

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push(function ($window, PERSONA_TOKEN_STORAGE_KEY) {
            return {
                request: function addTokenToHeader(httpConfig) {
                    var token = $window.localStorage.getItem(PERSONA_TOKEN_STORAGE_KEY);
                    if (token) {
                        httpConfig.headers.Authorization = 'Bearer ' + token;
                    }
                    return httpConfig;
                }
            };
        });
    });