var jwt = require('jwt-simple'),
    moment = require('moment'),
    conf = require('./conf');

var authMiddleware = {};

authMiddleware.ensureAuthenticated = function (request, response, next) {
    if (!request.headers.authorization) {
        return response.status(401).send({message: 'Please make sure your request has an Authorization header'});
    }
    var token = request.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token, conf.TOKEN_SECRET);
    if (payload.exp <= moment().unix()) {
        return response.status(401).send({message: 'Token has expired'});
    }
    request.user = payload.user;
    next();
};

module.exports = authMiddleware;