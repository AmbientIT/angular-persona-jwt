angular.module('demo.app', [
    'angular-persona-jwt'
])

    .controller('DemoAppController', function ($scope) {
        $scope.onLogin = function () {
            console.log('Logged In');
        };
    });