(function (angular) {
    'use strict';

    function personaLogin($window,persona) {
        function login() {
            $window.navigator.id.request();
        }

        return {
            restrict: 'EA',
            scope: {
                onLogin: '=',
                onLogout: '='
            },
            transclude: true,
            controller: function ($scope,persona) {
                this.login = login;
                $scope.$watch(function () {
                    return persona;
                }, function () {
                    if (persona.loggedUser) {
                        $scope.onLogin();
                    }
                }, true);
            },
            controllerAs: 'persona',
            template: '<div ng-transclude ng-click="persona.login()"></div>'
        };
    }

    function personaLogout($window,persona) {
        function logout() {
            $window.navigator.id.logout();
        }

        return {
            restrict: 'EA',
            transclude: true,
            scope: {},
            controller: function () {
                this.logout = logout;
            },
            controllerAs: 'persona',
            template: '<div ng-transclude ng-click="persona.logout()"></div>'
        };
    }

    angular.module('angular-persona-jwt.directives', [])
        .directive('personaLogin', personaLogin)
        .directive('personaLogout', personaLogout);

})(angular);



