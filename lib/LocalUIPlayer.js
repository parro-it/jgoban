'use strict';

var Promise = require('bluebird');
var Player = require('./Player');

function LocalUIPlayer(color, ui) {
    Player.call(this,color);
    this.ui = ui;
}
var protot = LocalUIPlayer.prototype = new Player();


protot.playing = function(game) {
    Player.prototype.playing.call(this, game);
};


protot.undoRequest = function() {
    alert('opponent want to undo. Ok?');
};

protot.opponentMove = protot.start = function(move) {
    var ui = this.ui;
    function stopListening(){
        ui.removeAllListeners('moved');
        ui.removeAllListeners('resigned');
        ui.removeAllListeners('pass');
    }

    return new Promise(function(resolve, reject) {
        ui.once('moved', function(coord) {
            stopListening();
            resolve({
                ok: true,
                pass: false,
                resigned: false,
                move: coord.toString(),
                undoRequest: false
            });


        });

        ui.once('undoRequest', function(coord) {
            stopListening();
            resolve({
                ok: true,
                pass: false,
                resigned: false,
                move: null,
                undoRequest: true
            });


        });

        ui.once('resigned', function(coord) {
            stopListening();
            resolve({
                ok: true,
                pass: false,
                resigned: true,
                move: null,
                undoRequest: false
            });
        });

        ui.once('pass', function(coord) {
            stopListening();
            resolve({
                ok: true,
                pass: true,
                resigned: false,
                move: null,
                undoRequest: false
            });
        });
    });

};


module.exports = LocalUIPlayer;