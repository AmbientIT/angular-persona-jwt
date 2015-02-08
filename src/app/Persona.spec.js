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
        dummyToken = 'Dummy Token';

    beforeEach(module('angular-persona-jwt', function ($provide) {
        personaNavigatorMock = {};
        $provide.value('personaNavigator', personaNavigatorMock);
    }));
    beforeEach(inject(function (_persona_, _$rootScope_, _$httpBackend_, _$q_, _$window_, _$log_, _$http_) {
        persona = _persona_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        $q = _$q_;
        $window = _$window_;
        $log = _$log_;
        $http = _$http_;
        personaNavigatorMock.logout = function () {
            return $q(function () {
            });
        };
        spyOn(personaNavigatorMock, 'logout').and.callThrough();
    }));
    afterEach(function () {
        $httpBackend.verifyNoOutstandingRequest();
        $httpBackend.verifyNoOutstandingExpectation();
    });

    function expectNotToBeExecuted() {
        expect('path').toBe('not executed');
    }

    describe('given personaNavigator provides assertion', function () {
        beforeEach(function () {
            personaNavigatorMock.requestLogin = function () {
                return $q(function (resolve) {
                    resolve(dummyAssertion);
                });
            };
        });
        afterEach(function () {
            $httpBackend.flush(); // Expect in all cases to validate the assertion on the server
        });

        describe('given the assertion is valid', function () {

            describe('when the server responds with a token', function () {
                beforeEach(function () {
                    $httpBackend.expectPOST('/auth/login', {'assertion': dummyAssertion})
                        .respond({loggedUser: dummyUser, token: dummyToken});
                });

                it('resolves login promise with the logged user', function () {
                    persona.login().then(function (loggedUser) {
                        expect(loggedUser).toBe(dummyUser);
                    });
                });

                it('stores token in local storage', function () {
                    persona.login().then(function () {
                        var token = $window.localStorage.getItem('angular-persona-jwt-token');
                        expect(token).toBe(dummyToken);
                    });
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
                $httpBackend.whenPOST('/auth/login', {'assertion': dummyAssertion})
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

    it('calls personaNavigator.logout()', function () {
        persona.logout().then(function () {
            expect(personaNavigatorMock.logout).toHaveBeenCalled();
        });
    });

});