'use strict';

var stones = require('./stones');
var Promise = require('bluebird');
var EventEmitter = require('node-events');

function Game(whitePlayer, blackPlayer, options) {
    EventEmitter.call(this);
    options = options || {};
    options.handicap = options.handicap || 0;

    this.options = options;
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;

    whitePlayer.other = blackPlayer;
    blackPlayer.other = whitePlayer;
}

Game.prototype = new EventEmitter();

Game.prototype.start = function() {
    var lastMovePass = false;
    var lastMove = null;
    var currentPlayer;
    var emit = this.emit.bind(this);

    this.whitePlayer.playing(this);
    this.blackPlayer.playing(this);

    if (this.options.handicap) {
        currentPlayer = this.whitePlayer;
    } else {
        currentPlayer = this.blackPlayer;
    }

    nextMove(currentPlayer.start());

    function nextMove(willMove) {
        emit('willmove', currentPlayer);

        willMove
            .then(function(move) {


                if (move.undoRequest) {
                    return currentPlayer.other.undoRequest()
                        .then(function() {
                            emit('undoAccepted');
                            nextMove(currentPlayer.opponentMove(lastMove));
                        });
                } else {
                    if (!move.ok) {
                        alert(move.reason);
                    } else {
                        if (move.pass && lastMovePass) {
                            return emit('end');
                        }
                        lastMove = move;
                        lastMovePass = move.pass;

                        if (move.resign) {
                            return emit('end');
                        }


                        emit('moved', currentPlayer, move);

                    }
                }

                currentPlayer = currentPlayer.other;
                nextMove(currentPlayer.opponentMove(move));
            })
            .catch(console.log);
    }

};

module.exports = Game;
