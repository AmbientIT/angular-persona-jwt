angular.module('demo.app', [
    'angular-persona-jwt'
])

    .controller('DemoAppController', function ($scope) {
        $scope.onLogin = function () {
            console.log('Logged In');
        };
    })

    .config(function (personaProvider) {
        personaProvider.config({
            baseUrl: 'http://localhost:5210',
            tokenName: 'demo-token'
        });
    });