describe('Persona', function () {

    var personaNavigatorMock;

    var persona,
        $rootScope,
        $httpBackend,
        $q,
        $window,
        $log,
        $http;

    var dummyAssertion = 'Dummy Assertion',
        dummyUser = 'Dummy User',
        dummyToken = 'Dummy Token',
        dummyAuthBackendUrl = 'http://dummy.domain.com:123456';

    beforeEach(module('angular-persona-jwt', function mockPersonaNavigator($provide) {
        personaNavigatorMock = {
            get: function () {
                return $q(function (resolve) {
                    resolve(dummyAssertion);
                });
            }
        };
        $provide.value('personaNavigator', personaNavigatorMock);
    }));

    function configWithCustomAuthBackendURL() {
        beforeEach(module(function (personaProvider) {
            personaProvider.config({
                authBackendUrl: dummyAuthBackendUrl
            });
        }));
    }

    function injectDependencies() {
        beforeEach(inject(function (_persona_, _$rootScope_, _$httpBackend_, _$q_, _$window_, _$log_, _$http_) {
            persona = _persona_;
            $rootScope = _$rootScope_;
            $httpBackend = _$httpBackend_;
            $q = _$q_;
            $window = _$window_;
            $log = _$log_;
            $http = _$http_;
        }));
        afterEach(function () {
            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();
        });
    }

    afterEach(function () {
        $window.localStorage.clear();
    });

    function expectNotToBeExecuted() {
        expect('path').toBe('not executed');
    }

    describe('given NO custom auth backend url', function () {
        injectDependencies();

        describe('given personaNavigator provides assertion', function () {
            afterEach(function () {
                $httpBackend.flush(); // Expect in all cases to validate the assertion on the server
            });

            describe('given the assertion is valid', function () {

                describe('given the server responds with a token', function () {
                    beforeEach(function () {
                        $httpBackend.expectPOST('/auth/login', {'assertion': dummyAssertion})
                            .respond({loggedUser: dummyUser, token: dummyToken});
                    });

                    it('resolves login promise with the logged user', function () {
                        persona.login().then(function (loggedUser) {
                            expect(loggedUser).toBe(dummyUser);
                        });
                    });

                    describe('when user logs in', function () {
                        // TODO Find out why this doesn't work and remove duplication
                        //beforeEach(function (done) {
                        //    persona.login().finally(done);
                        //});

                        it('stores token in local storage', function () {
                            persona.login().then(function () {
                                var token = $window.localStorage.getItem('angular-persona-jwt-token');
                                expect(token).toBe(dummyToken);
                            });
                        });

                        it('returns logged user', function () {
                            persona.login().then(function () {
                                expect(persona.getLoggedUser()).toBe(dummyUser);
                            })
                        });

                        it('adds token to subsequent HTTP request headers', function () {
                            var expectedHeaders = {
                                Accept: 'application/json, text/plain, */*',
                                Authorization: 'Bearer ' + dummyToken
                            };
                            $httpBackend.expectGET('/url', expectedHeaders).respond('OK');
                            persona.login().then(function () {
                                $http.get('/url');
                            });
                        });

                        describe('when user logs out', function () {

                            it('does NOT return logged user', function () {
                                persona.login().then(function () {
                                    persona.logout();
                                    expect(persona.getLoggedUser()).toBe(null);
                                })
                            });

                            it('does NOT add token to subsequent HTTP request headers', function () {
                                var expectedHeaders = {
                                    Accept: 'application/json, text/plain, */*'
                                };
                                $httpBackend.expectGET('/url', expectedHeaders).respond('OK');
                                persona.login().then(function () {
                                    persona.logout();
                                    $http.get('/url');
                                });
                            });

                        });

                    });
                });

                describe('when the server responds WITHOUT a token', function () {
                    beforeEach(function () {
                        $httpBackend.expectPOST('/auth/login', {'assertion': dummyAssertion})
                            .respond({loggedUser: dummyUser, token: null});
                    });

                    it('rejects the login promise', function () {
                        persona.login()
                            .then(expectNotToBeExecuted)
                            .catch(function (error) {
                                expect(error.message).toContain('missing');
                                expect(error.message).toContain('token');
                            });
                    });

                    it('logs the error', function () {
                        persona.login()
                            .then(expectNotToBeExecuted)
                            .catch(function () {
                                var error = $log.error.logs[0][0];
                                expect(error).toContain('missing');
                                expect(error).toContain('token');
                            });
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
                            expect(error.message).toBe('invalid assertion');
                        });
                });
            });

        });

    });

    describe('given custom auth backend url', function () {
        configWithCustomAuthBackendURL();
        injectDependencies();

        it('sends assertion validation requests on provided URL', function () {
            $httpBackend.expectPOST(dummyAuthBackendUrl + '/auth/login')
                .respond({loggedUser: dummyUser, token: dummyToken});
            persona.login();
            $httpBackend.flush();
        });
    });

    it('returns logged user from local storage', function () {
        $window.localStorage.setItem('angular-persona-jwt-logged-user', dummyUser);
        expect(persona.getLoggedUser()).toBe(dummyUser);
    });

});