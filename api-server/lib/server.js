'use strict';

var Hapi = require('hapi');
var authBasic = require('hapi-auth-basic');
var server = new Hapi.Server(8080, 'localhost');
var Promise = require('bluebird');
var gnugo = require('./gnugo');
var staticApp = require('./static-app');

var plugins = [
    gnugo,
    authBasic,
    staticApp

];

function startServer() {
    return new Promise(function(resolve, reject) {
        server.pack.register(plugins, function(err) {
            if (err) {
                return reject(err);
            }
/*
            server.auth.strategy('default', 'basic', 'required', {
                validateFunc: users.validate
            });
*/
            server.start(function() {
                resolve(server);
            });
        });

    });
}

exports.start = startServer;
