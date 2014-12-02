'use strict';

(function(angular){
    function DemoAppController($scope, $http, $window, persona, $log) {
        $scope.onLogin = function () {
            $log.info('Logged In (scope method passed as directive attribute)', persona.loggedUser);
            $scope.loggedUser = persona.loggedUser;
        };

        $scope.onLogout = function () {
            $log.info('Logged Out (scope method passed as directive attribute)', persona.loggedUser);
            $scope.loggedUser = null;
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
    }


    function demoConfig(personaProvider) {
        personaProvider.config({
            baseUrl: 'http://localhost:5001',
            tokenStorageKey: 'demo-token'
        });
    }



    function demoRun(persona, $log) {
        persona.init()
            .then(function(){
                persona.addLoginListener(function (loggedUser) {
                    $log.info('Logged In (listener added to persona service)', loggedUser);
                });
                persona.addLogoutListener(function () {
                    $log.info('Logged Out (listener added to persona service)');
                });
                persona.addLoginFailListener(function () {
                    $log.error('Login Failed (listener added to persona service)');
                });
            })
    }

    angular.module('demo.app', [
        'angular-persona-jwt'
    ])
        .config(demoConfig)
        .run(demoRun)
        .controller('DemoAppController', DemoAppController)

})(angular);
