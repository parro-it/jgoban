/*
 * jgoban
 * https://github.com/parroit/jgoban
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

'use strict';
var $ = require('jquery');
var boardUi = require('./boardUi');
var Coordinate = require('./JGOCoordinate');
var JGOBoard = require('./JGOBoard');
var otherPlayer = JGOBoard.otherPlayer;
var stones = require('./stones');
var RemoteWebSocketPlayer = require('./RemoteWebSocketPlayer');
var LocalUIPlayer = require('./LocalUIPlayer');
var Game = require('./Game');

//var ClientGtp = require('./client-gtp');

window.process = {
    env: {}
};


function setupJgoban() {
    $('body').append('<div class="jgo_board"></div>');
    var board = new JGOBoard(19, 19);
    var $board = boardUi($('.jgo_board'),board);

    startNewGame();

    function moved(player, move){
        var coord = new Coordinate(move.move);

        board.play(coord, player.color);
        board.markLastMove(coord);    
    }

    function willMove(player) {
        if (player instanceof LocalUIPlayer) {
            board.updateHoverEffects(player.color);

        } else {
            board.clearHoverEffects();
        }

        
    }

    function startNewGame() {
        var white = new RemoteWebSocketPlayer(stones.WHITE, 'http://localhost:8080/');
        var black = new LocalUIPlayer(stones.BLACK, $board.events);
        var game = new Game(white, black, {});
        game.on('moved',moved);
        game.on('willmove',willMove);
        game.start();
    }


}

$(document).ready(setupJgoban);

