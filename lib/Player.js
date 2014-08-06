'use strict';

var Promise = require('bluebird');

function Player(color) {
    this.color = color;
}

Player.prototype.playing = function(game) {
    this.game = game;
};

Player.prototype.start = function() {
    return new Promise();
};


Player.prototype.end = function() {
    return new Promise();
};


Player.prototype.opponentMove = function(move) {
    return new Promise();
};

module.exports = Player;