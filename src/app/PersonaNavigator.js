angular.module('angular-persona-jwt.navigator', [])

    .service('personaNavigator', function PersonaNavigator($window, $q) {

        this.login = function () {
            return $q(function (resolve, reject) {
                $window.navigator.id.get(function (assertion) {
                    if (assertion) resolve(assertion);
                    else reject({message: 'Invalid Persona credentials'});
                });
            })
        };

        this.logout = function () {
            $window.navigator.id.logout();
        };

    });