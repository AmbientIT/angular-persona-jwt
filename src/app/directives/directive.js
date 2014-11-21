(function (angular) {
    'use strict';

    function personaLogin($window) {
        function login() {
            $window.navigator.id.request();
        }

        return {
            restrict: 'EA',
            scope: {
                onlogin: '='
            },
            transclude: true,
            controller: function () {
                this.login = login;
            },
            controllerAs: 'persona',
            template: '<div ng-transclude ng-click="persona.login()"></div>'
        };
    }

    function personaLogout($window) {
        function logout() {
            $window.navigator.id.logout();
        }

        return {
            restrict: 'EA',
            transclude: true,
            scope: true,
            controller: function ($scope, persona) {
                this.logout = logout;
                $scope.$watch(function () {
                    return persona.loggedInUser;
                }, function (value) {
                    if (value) {
                        $scope.onLogin();
                    }
                });
            },
            controllerAs: 'persona',
            template: '<div ng-transclude ng-click="persona.logout()"></div>'
        };
    }

    angular.module('angular-persona-jwt.directives', [])
        .directive('personaLogin', personaLogin)
        .directive('personaLogout', personaLogout);

})(angular);



