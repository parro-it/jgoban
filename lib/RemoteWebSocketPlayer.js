'use strict';

var Player = require('./Player');
var requesty = require('requesty');


function RemoteWebSocketPlayer(color, uri) {
    Player.call(this, color);

    var req = this.req = requesty.new().usePromises();

    req
        .get()
        .using(uri)
        .headers({
            'User-Agent': 'jgoban'
        });

    this._playing = req.using({
        path: '/gnugo/playing/' + color.abbrev
    }).build();

    this.finalScore = req.using({
        path: '/gnugo/score'
    }).build();

    this.start = req.using({
        path: '/gnugo/start'
    }).build();


}

var proto = RemoteWebSocketPlayer.prototype = new Player();


proto.playing = function(game) {
    Player.prototype.playing.call(this, game);
    this._playing();
};

proto.opponentMove = function(move) {
    var coord = move.pass ? 'PASS' : move.move.toString();

    return this.req.using({
        path: '/gnugo/play/' + coord
    }).send()

    .then(function(res){
        
        return res.data;
    });
};


module.exports = RemoteWebSocketPlayer;