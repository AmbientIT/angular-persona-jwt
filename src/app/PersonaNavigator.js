angular.module('angular-persona-jwt.navigator', [])

    .service('personaNavigator', function PersonaNavigator($window, $q, $rootScope) {

        var resolveLoginPromise = null;
        var resolveLogoutPromise = null;

        function onLogin(assertion) {
            resolveLoginPromise(assertion);
            //$rootScope.$digest();
        }

        function onLogout() {
            resolveLogoutPromise();
            //$rootScope.$digest();
        }

        $window.navigator.id.watch({
            loggedInUser: null,
            onLogin: onLogin,
            onLogout: onLogout
        });

        this.requestLogin = function () {
            return $q(function (resolve) {
                resolveLoginPromise = resolve;
                $window.navigator.id.request();
            });
        };

        this.logout = function () {
            return $q(function (resolve) {
                resolveLogoutPromise = resolve;
                $window.navigator.id.logout();
            });
        };

    });