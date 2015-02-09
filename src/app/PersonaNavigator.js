angular.module('angular-persona-jwt.navigator', [])

    .service('personaNavigator', function PersonaNavigator($window, $q) {

        var resolveLoginPromise = null;
        var resolveLogoutPromise = null;

        function onLogin(assertion) {
            if (resolveLoginPromise)
                resolveLoginPromise(assertion);
        }

        function onLogout() {
            if (resolveLogoutPromise)
                resolveLogoutPromise();
        }

        $window.navigator.id.watch({
            loggedInUser: null,
            onlogin: onLogin,
            onlogout: onLogout
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