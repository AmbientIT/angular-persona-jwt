'use strict';

/**
 * @ngdoc directive
 * @name angular-persona-jwt.directives:personaLogin
 * @element div
 * @function
 *
 * @description
 * encapsulate the button of your choices with transclusion,
 * when clicking show the Mozilla pop-up.
 *
 * @example
 <example module="rfx">
 <file name="index.html">
 <persona-login>
 <button></md-button>
 </persona-login>
 </file>
 </example>
 */
function personaLogin($window, persona) {
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
        controller: function ($scope, persona) {
            this.login = login;
            $scope.$watch(function () {
                return persona;
            }, function () {
                if (persona.loggedUser && $scope.onLogin) {
                    $scope.onLogin();
                }
            }, true);
        },
        controllerAs: 'persona',
        template: '<div ng-transclude ng-click="persona.login()"></div>'
    };
}

/**
 * @ngdoc directive
 * @name angular-persona-jwt.directives:personaLogout
 * @element div
 * @function
 *
 * @description
 * encapsulate the button of your choices with transclusion,
 * when clicking logout the user.
 *
 * @example
 <example module="rfx">
 <file name="index.html">
 <persona-logout>
 <button>Logout</button>
 </persona-logout>
 </file>
 </example>
 */
function personaLogout($window, persona) {
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