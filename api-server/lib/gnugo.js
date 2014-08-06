'use strict';

var util = require('./util');
var servePromise = util.servePromise;
var stones = require('../../lib/stones');
var Session = require('../../lib/gtp');
var session = new Session();

var playing = servePromise(function(request) {
    session.color =  request.params.color;
    session.otherPlayerColor = stones[session.color].other.abbrev;
    return session.boardsize(19);
});

var play = servePromise(function(request) {
    return session.play(session.otherPlayerColor, request.params.move)
        .then(function() {
            return session.genMove(session.color);
        });

});

var start = servePromise(function() {
    return session.genMove(session.color);
    
});


function register(plugin, options, next) {
    plugin.route([{
        path: '/gnugo/playing/{color}',
        method: 'GET',
        handler: playing
    }]);

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
