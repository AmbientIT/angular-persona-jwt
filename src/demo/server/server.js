var express = require('express'),
    http = require('q-io/http'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    jwt = require('jwt-simple'),
    moment = require('moment');

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
                audience: 'http://localhost:5200'
            })
        ],
        headers: {
            'Content-Type': 'application/json'
        }
    };
    http.request(options).then(function (verificationResult) {
        verificationResult.body.read().then(function (body) {
            var user = {
                email: JSON.parse(body).email
            };
            var payload = {
                user: user,
                iat: moment().valueOf(),
                exp: moment().add(7, 'days').valueOf()
            };
            response.json({
                user: user,
                token: jwt.encode(payload, 'MyTokenSecret')
            });
        });
    });
});

app.listen(5210);

console.log('Demo node server started on port ' + 5210);