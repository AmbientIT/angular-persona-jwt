angular.module('angular-persona-jwt', [
    'angular-persona-jwt.navigator'
])

    .service('persona', function ($http, $window, $q, $log, personaNavigator) {
        var persona = this;

        persona.login = function () {
            return personaNavigator.requestLogin()
                .then(function validateAssertion(assertion) {
                    return $http.post('/auth/login', {assertion: assertion});
                })
                .then(function storeTokenInLocalStorage(response) {
                    var token = response.data.token;
                    if (!token) {
                        var message = 'JWT token is missing';
                        $log.error(message);
                        return $q.reject({message: message});
                    }
                    $window.localStorage.setItem('angular-persona-jwt-token', response.data.token);
                    return response.data.loggedUser;
                })
                .catch(function (response) {
                    if (response.status === 401)
                        return $q.reject({message: 'invalid assertion'});
                    else
                        return $q.reject(response);
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