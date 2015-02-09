angular.module('angular-persona-jwt', [
    'angular-persona-jwt.navigator'
])
    .provider('persona', function personaProvider() {

        var options = {};

        return {

            config: function (userOptions) {
                options = userOptions ? userOptions : {};
            },

            $get: function Persona($http, $window, $q, $log, personaNavigator) {
                var persona = this;

                persona.login = function () {
                    return personaNavigator.requestLogin()
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
                        .then(function storeTokenInLocalStorage(data) {
                            $window.localStorage.setItem('angular-persona-jwt-token', data.token);
                            return data.loggedUser;
                        });
                };

                persona.logout = function () {
                    $window.localStorage.removeItem('angular-persona-jwt-token');
                    return personaNavigator.logout();
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