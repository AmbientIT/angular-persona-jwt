describe('Persona', function () {

    var personaNavigatorMock;

    var persona,
        $rootScope,
        $httpBackend,
        $q,
        $window,
        $log,
        $http,
        PERSONA_LOGGED_USER_STORAGE_KEY;

    var dummyAssertion = 'Dummy Assertion',
        dummyUser = {username: 'Dummy User'},
        dummyToken = 'Dummy Token',
        dummyAuthBackendUrl = 'http://dummy.domain.com:123456';

    beforeEach(module('angular-persona-jwt'));

    function personaNavigatorMockProvidesAssertion() {
        beforeEach(module(function mockPersonaNavigator($provide) {
            personaNavigatorMock = {
                get: function () {
                    return $q(function (resolve) {
                        resolve(dummyAssertion);
                    });
                }
            };
            $provide.value('personaNavigator', personaNavigatorMock);
        }));
    }

    function configWithCustomAuthBackendURL() {
        beforeEach(module(function (personaProvider) {
            personaProvider.config({
                authBackendUrl: dummyAuthBackendUrl
            });
        }));
    }

    function injectDependencies() {
        beforeEach(inject(function (_persona_, _$rootScope_, _$httpBackend_, _$q_, _$window_, _$log_, _$http_, _PERSONA_LOGGED_USER_STORAGE_KEY_) {
            persona = _persona_;
            $rootScope = _$rootScope_;
            $httpBackend = _$httpBackend_;
            $q = _$q_;
            $window = _$window_;
            $log = _$log_;
            $http = _$http_;
            PERSONA_LOGGED_USER_STORAGE_KEY = _PERSONA_LOGGED_USER_STORAGE_KEY_;
        }));
    }

    afterEach(function () {
        $window.localStorage.clear();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function expectNotToBeExecuted() {
        expect('path').toBe('not executed');
    }

    describe('given personaNavigator provides assertion', function () {
        personaNavigatorMockProvidesAssertion();

        describe('given NO custom auth backend url', function () {
            injectDependencies();

            describe('given the assertion is valid', function () {

                describe('given the server responds with a token', function () {
                    var loggedUser;
                    beforeEach(function () {
                        $httpBackend
                            .expectPOST('/auth/login', {'assertion': dummyAssertion})
                            .respond({loggedUser: dummyUser, token: dummyToken});
                        persona.login().then(function (_loggedUser_) {
                            loggedUser = _loggedUser_;
                        });
                        $httpBackend.flush();
                    });

                    it('resolves login promise with the logged user', function () {
                        expect(loggedUser).toEqual(dummyUser);
                    });

                    it('returns logged user', function () {
                        expect(persona.getLoggedUser()).toEqual(dummyUser);
                    });

                    it('should return same (===) logged user when calling getLoggedUser() twice in a row (otherwise might create an infinite digest loop)', function () {
                        var first = persona.getLoggedUser();
                        var second = persona.getLoggedUser();
                        expect(first).toBe(second);
                    });

                    it('adds token to subsequent HTTP request headers', function () {
                        var expectedHeaders = {
                            Accept: 'application/json, text/plain, */*',
                            Authorization: 'Bearer ' + dummyToken
                        };
                        $httpBackend.expectGET('/url', expectedHeaders).respond('OK');
                        $http.get('/url');
                        $httpBackend.flush();
                    });

                    describe('when user logs out', function () {
                        beforeEach(function () {
                            persona.logout();
                        });

                        it('does NOT return logged user', function () {
                            expect(persona.getLoggedUser()).toBe(null);
                        });

                        // TODO Remove
                        it('does NOT return logged user from local cache', function () {
                            persona.getLoggedUser();
                            persona.logout();
                            expect(persona.getLoggedUser()).toBe(null);
                        });

                        it('does NOT add token to subsequent HTTP request headers', function () {
                            var expectedHeaders = {
                                Accept: 'application/json, text/plain, */*'
                            };
                            $httpBackend.expectGET('/url', expectedHeaders).respond('OK');
                            $http.get('/url');
                            $httpBackend.flush();
                        });

                    });

                });

                describe('when the server responds WITHOUT a token', function () {
                    beforeEach(function () {
                        $httpBackend
                            .expectPOST('/auth/login', {'assertion': dummyAssertion})
                            .respond({loggedUser: dummyUser, token: null});
                    });

                    it('rejects the login promise', function () {
                        persona.login()
                            .then(expectNotToBeExecuted)
                            .catch(function (error) {
                                expect(error.message).toContain('missing');
                                expect(error.message).toContain('token');
                            });
                        $httpBackend.flush();
                    });

                    it('logs the error', function () {
                        persona.login()
                            .then(expectNotToBeExecuted)
                            .catch(function () {
                                var error = $log.error.logs[0][0];
                                expect(error).toContain('missing');
                                expect(error).toContain('token');
                            });
                        $httpBackend.flush();
                    });
                });

            });

            describe('given the assertion is NOT valid', function () {
                beforeEach(function () {
                    $httpBackend.expectPOST('/auth/login', {'assertion': dummyAssertion})
                        .respond(401);
                });

                it('rejects promise', function () {
                    persona.login()
                        .then(expectNotToBeExecuted)
                        .catch(function (error) {
                            expect(error.message).toBe('Error validating assertion on the server');
                        });
                    $httpBackend.flush();
                });
            });

        });

        describe('given custom auth backend url', function () {
            configWithCustomAuthBackendURL();
            injectDependencies();

            it('sends assertion validation requests on provided URL', function () {
                $httpBackend
                    .expectPOST(dummyAuthBackendUrl + '/auth/login')
                    .respond({loggedUser: dummyUser, token: dummyToken});
                persona.login();
                $httpBackend.flush();
            });
        });

    });

    it('returns logged user from local storage', function () {
        $window.localStorage.setItem(PERSONA_LOGGED_USER_STORAGE_KEY, JSON.stringify(dummyUser));
        expect(persona.getLoggedUser()).toEqual(dummyUser);
    });

});