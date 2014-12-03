/**
 * angular-persona-jwt - angularJs module to authenticate an app with Mozilla Persona
 * @version v0.0.1
 * @link https://github.com/Charl---/angular-persona-jwt
 * @license MIT
 */
(function(angular) {'use strict';
angular.module('angular-persona-jwt', [
    'angular-persona-jwt.services',
    'angular-persona-jwt.directives'
]);

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
 <example module="angular-persona-jwt">
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
        controller: ["$scope", "persona", function ($scope, persona) {
            this.login = login;
            $scope.$watch(function () {
                return persona;
            }, function () {
                if (persona.loggedUser && $scope.onLogin) {
                    $scope.onLogin();
                }
            }, true);
        }],
        controllerAs: 'persona',
        template: '<div ng-transclude ng-click="persona.login()"></div>'
    };
}
personaLogin.$inject = ["$window", "persona"];

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
personaLogout.$inject = ["$window", "persona"];

angular.module('angular-persona-jwt.directives', [])
    .directive('personaLogin', personaLogin)
    .directive('personaLogout', personaLogout);

/**
 * @ngdoc service
 * @name persona
 *
 * @requires $http
 * @requires $q
 * @requires $document
 *
 * @description
 * service wich contains the init, login, and logout method.
 * this service also has a property loggedUser, wich contains ou users information.
 *
 * This service use the navigator.id api but work alongside with a properly configured webservice
 * (example ine demo folder), the configured webservice check the validity of mozilla's token
 * and send back his own token wich the service store in localStorage,
 * the service use an httpInterceptor to put the token in every http request
 *
 */

/**
 * @ngdoc service
 * @name personaProvider
 *
 * @requires $httpProvider
 * @requires $windowProvider
 *
 * @description
 * use the config method of the provider to configure the way it will help to authenticate.
 *
 */
function personaProvider($windowProvider,$httpProvider) {

    var $window = $windowProvider.$get(),
        options = {
            baseUrl: 'localhost',
            audience: $window.location.href,
            tokenStorageKey: 'angular-persona-jwt-token'
        };

    return {
        /**
         * @ngdoc function
         * @name personaProvider#config
         * @description configuration method, and add the httpInterceptor wich add the token on every http request
         * @param {object=} object with 3 attribute : baseUrl (your webservice baseUrl),
         * audience (your application url) and tokenStorageKey (the name of the locaStorage attribut where your auth token is stored).
         */
        config : function (data){
            options = angular.extend(options, data);
            $httpProvider.interceptors.push(["$q", function ($q) {
                return {
                    request: function (httpConfig) {
                        var token = $window.localStorage.getItem(options.tokenStorageKey);
                        if (token) {
                            httpConfig.headers.Authorization = 'Bearer ' + token;
                        }
                        return httpConfig;
                    },
                    responseError: function (response) {
                        return $q.reject(response);
                    }
                };
            }]);
        },
        $get : ["$http", "$q", "$document", function ($http,$q,$document){
            var self = this,
                loginListeners = [],
                logoutListeners = [],
                loginFailListeners = [];

            /**
             * @ngdoc function
             * @name persona#addLoginListener
             * @description add a login listener in an array of functions,this listener will notify you when user login
             */
            this.addLoginListener = function addLoginListener(listener) {
                loginListeners.push(listener);
            };

            /**
             * @ngdoc function
             * @name persona#addLogoutListener
             * @description add a logout listener in an array of functions, this listener will notify you when user logout
             */
            this.addLogoutListener = function addLogoutListener(listener) {
                logoutListeners.push(listener);
            };

            /**
             * @ngdoc function
             * @name persona#addLoginFailListener
             * @description add a listener in an array of functions this listener will notify you when someting goes wrong
             */
            this.addLoginFailListener = function addLoginFailListener(listener) {
                loginFailListeners.push(listener);
            };

            /**
             * @ngdoc function
             * @name persona#login
             * @description login callback for the navigator.id api, executed just after the pop up hide.
             * send a request to the webservice configured in the previous config function, store the token in the
             * localStorage and call all the login Listeners
             * @param {Object=} Mozilla Persona assertion (given by the persona lib)
             */
            this.login = function login(assertion) {
                var param = {
                    assertion: assertion,
                    audience: options.audience
                };
                $http
                    .post(options.baseUrl + '/login', param)
                    .success(function (data) {
                        self.loggedUser = data.user;
                        $window.localStorage.setItem(options.tokenStorageKey, data.token);
                        angular.forEach(loginListeners, function (listener) {
                            listener(data.user);
                        });
                    })
                    .error(function (error) {
                        angular.forEach(loginFailListeners, function (listener) {
                            listener();
                        });
                    });
            };
            /**
             * @ngdoc function
             * @name persona#logout
             * @description logout callback for the navigator.id api, clean the loggedUser attribute and the localStorage,
             * and call all the logout listeners
             * @param {Object} Mozilla Persona assertion (given by the persona lib)
             */
            this.logout = function logout() {
                self.loggedUser = null;
                $window.localStorage.removeItem(options.tokenStorageKey);
                angular.forEach(logoutListeners, function (listener) {
                    listener();
                });
            };

            /**
             * @ngdoc function
             * @name persona#init
             * @description get the mozilla persona librairie, add it to the dom, and start the process with navigator.id
             * @return {Promise=} resolve when the mozilla librairie is loaded
             */
            this.init = function init(){
                var deferred = $q.defer();
                var scriptTag = $document[0].createElement('script');
                scriptTag.type = 'text/javascript';
                scriptTag.async = true;
                scriptTag.src = 'https://login.persona.org/include.js';
                var body = $document[0].getElementsByTagName('body')[0];
                body.appendChild(scriptTag);
                scriptTag.onload = function(){
                    $window.navigator.id.watch({
                        loggedInUser: self.loggedUser,
                        onlogin: self.login,
                        onlogout: self.logout
                    });
                    deferred.resolve();
                };
                return deferred.promise;
            };
            return this;
        }]
    };
}
personaProvider.$inject = ["$windowProvider", "$httpProvider"];

angular.module('angular-persona-jwt.services', [])
    .provider('persona', personaProvider);

})(angular);
