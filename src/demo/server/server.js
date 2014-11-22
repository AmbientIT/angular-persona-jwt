var express = require('express'),
    http = require('q-io/http'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    jwt = require('jwt-simple'),
    moment = require('moment'),
    ensureAuthenticated = require('./auth.middleware').ensureAuthenticated,
    conf = require('./conf');

var app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/login', function (request, response) {
    var options = {
        url: 'https://verifier.login.persona.org/verify',
        method: 'POST',
        body: [
            JSON.stringify({
                assertion: request.body.assertion,
                audience: 'http://localhost:5000'
            })
        ],
        headers: {
            'Content-Type': 'application/json'
        }
    };
    http.request(options).then(function (personaResponse) {
        personaResponse.body.read()
            .then(function (body) {
                var personaAuthData = JSON.parse(body);
                if (personaAuthData.status === 'okay') {
                    response.json({
                        user: {email: personaAuthData.email},
                        token: createToken(personaAuthData)
                    });
                } else {
                    response.status(401).json({message: 'Persona authentication failed'});
                }
            })
            .catch(function (error) {
                console.log(error);
                response.status(500).json({message: 'Server error'});
            });
    });
});


function createToken(personaAuthData) {
    var user = {
        email: personaAuthData.email
    };
    var payload = {
        user: user,
        iat: moment().valueOf(),
        exp: moment().add(7, 'days').valueOf()
    };
    return jwt.encode(payload, conf.TOKEN_SECRET);
}

app.get('/me', ensureAuthenticated, function (request, response) {
    response.send(request.user);
});


var port = 5001;
app.listen(port);
console.log('Demo node server started on port ' + port);