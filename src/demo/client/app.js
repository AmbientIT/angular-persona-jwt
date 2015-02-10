angular.module('demo.app', [
    'angular-persona-jwt'
])

    .config(function demoConfig(personaProvider) {
        personaProvider.config({
            authBackendUrl: 'http://localhost:5001'
        });
    })

    .controller('DemoAppController', function DemoAppController($scope, $http, $window, $log, persona) {

        $scope.persona = persona;

        $scope.login = function () {
            persona.login().then(function (loggedUser) {
                $log.info('Logged In', loggedUser);
            })
        };

        $scope.logout = function () {
            persona.logout();
            $log.info('Logged Out');
        };

        $scope.checkLoggedIn = function () {
            $http.get('http://localhost:5001/me')
                .then(function (response) {
                    $window.alert('Successfully logged in : ' + angular.toJson(response.data));
                })
                .catch(function (response) {
                    $window.alert('Error ' + response.status + ' : ' + response.data.message);
                });
        };
    });