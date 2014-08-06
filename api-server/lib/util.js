'use strict';

var error = require('hapi').error;
var multiline = require('multiline');

function adminRoute(fn) {
    return function(request, reply) {
        var user = request.auth.credentials;
        //console.dir(user);
        if ( !user || !user.admin ) {
            return reply(error.forbidden('Administration permissions required'));
        }

        return fn(request, reply);
    };
}

function servePromise(fn){
    return function(request, reply) {
        
        var promise = fn(request);
        
        promise
            .then(function(result) {
                if (result === null) {
                    return reply(error.notFound('resource not found'));
                }
                reply(result);
            }).
            catch (function(err) {
                reply(error.internal('while reading resource', err));
            });
    };
}

Function.prototype.hapiNotes = function(fn){
    this.notes = multiline(fn);
};

Function.prototype.hapiDescription = function(fn){
    if (typeof fn === 'string') {
        this.description = fn;
        return;
    }
    this.description = multiline(fn);
};

function makeConfig(fn,validate) {
    return {
        handler: fn,
        notes: fn.notes,
        description: fn.description,
        validate: validate
    };
}



module.exports = {
    adminRoute: adminRoute,
    servePromise: servePromise,
    makeConfig: makeConfig

};