'use strict';

var util = require('./util');
var servePromise = util.serveGtpPromise;
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
        //.delay(5000)
        .then(function() {
            return session.genMove(session.color);
        });

});

var start = servePromise(function() {
    return session.genMove(session.color);
    
});


var score = servePromise(function() {
    return session.finalScore();
    
});


var showBoard = servePromise(function() {
    return session.showBoard();
    
});


var undo = servePromise(function() {
    return session.undo().then(function(){
        return session.undo();
    });
    
});

function register(plugin, options, next) {
    plugin.route([{
        path: '/gnugo/playing/{color}',
        method: 'GET',
        handler: playing
    }]);

     plugin.route([{
        path: '/gnugo/score',
        method: 'GET',
        handler: score
    }]);

     plugin.route([{
        path: '/gnugo/showboard',
        method: 'GET',
        handler: showBoard
    }]);

     plugin.route([{
        path: '/gnugo/undo',
        method: 'GET',
        handler: undo
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
