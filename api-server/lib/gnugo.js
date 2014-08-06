'use strict';

var util = require('./util');
var servePromise = util.servePromise;

var Session = require('../../lib/gtp.js');
var session = new Session();

var start = servePromise(function() {
    
    return session.boardsize(19);
});

var play = servePromise(function(request) {
    return session.play('B', request.params.move)
        .then(function() {
            return session.genMove('W');
        });

});


function register(plugin, options, next) {
    plugin.route([{
        path: '/gnugo/start',
        method: 'GET',
        handler: start
    }]);

    plugin.route([{
        path: '/gnugo/play/{move}',
        method: 'GET',
        handler: play
    }]);


    next();
}

register.attributes = {
    pkg: {
        name: 'gnugo'
    }
};

module.exports = {
    register: register
};
