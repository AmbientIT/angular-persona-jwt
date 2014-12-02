angular.module('demo.app', [
    'angular-persona-jwt'
])

    .controller('DemoAppController', function ($scope, $http, $window, persona) {
        $scope.onLogin = function () {
            console.log('Logged In (scope method passed as directive attribute)', persona.loggedUser);
            $scope.loggedUser = persona.loggedUser;
        };

        $scope.onLogout = function () {
            console.log('Logged Out (scope method passed as directive attribute)', persona.loggedUser);
            $scope.loggedUser = null;
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
    })

    .run(function (persona) {
        persona.addLoginListener(function (loggedUser) {
            console.log('Logged In (listener added to persona service)', loggedUser);
        });
        persona.addLogoutListener(function () {
            console.log('Logged Out (listener added to persona service)');
        });
        persona.addLoginFailListener(function () {
            console.log('Login Failed (listener added to persona service)');
        });
    });