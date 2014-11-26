angular.module('demo.app', [
    'angular-persona-jwt'
])

    .controller('DemoAppController', function ($scope, $http, $window) {
        $scope.onLogin = function () {
            console.log('Logged In');
        };
        $scope.checkLoggedIn = function () {
            $http.get('http://localhost:5001/me')
                .then(function (response) {
                    $window.alert('Successfully logged in : ' + JSON.stringify(response.data));
                })
                .catch(function (response) {
                    $window.alert('Error ' + response.status + ' : ' + response.data.message);
                });
        };
    })

    .config(function (personaProvider) {
        personaProvider.config({
            baseUrl: 'http://localhost:5001',
            tokenStorageKey: 'demo-token'
        });
    });