angular.module('angular-persona-jwt', [
    'angular-persona-jwt.navigator'
])

    .service('persona', function Persona($http, $window, $q, $log, personaNavigator) {
        var persona = this;

        persona.login = function () {
            return personaNavigator.requestLogin()
                .then(function validateAssertion(assertion) {
                    return $http.post('/auth/login', {assertion: assertion});
                })
                .catch(function handleInvalidAssertion(response) {
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
            return personaNavigator.logout();
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