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

function setupTopPanel(uiEvents){
    $('body').prepend(
        '<div id="top-panel">'+
            '<button class="awesome large blue button" id="pass">Pass</button>'+
            '<button class="awesome large red button" id="resign">Resign</button>'+
            '<button class="awesome large blue button" id="undo">Undo</button>'+
        '</div>'
    );

    var $pass = $('#pass');
    var $resign = $('#resign');
    var $undo = $('#undo');
    var $all = $('#pass,#resign,#undo');
    
    $pass.click(uiEvents.emit.bind(uiEvents,'pass'));
    $resign.click(uiEvents.emit.bind(uiEvents,'resign'));

    return {
        enable: function(){
            $all.prop('disabled',false);
        },
        disable: function(){
            $all.prop('disabled',true);
        }
          
    };
}

function setupJgoban() {
    

    $('body').append('<div class="jgo_board"></div>');
    var board = new JGOBoard(19, 19);
    var $board = boardUi($('.jgo_board'),board);

    var topPanel = setupTopPanel($board.events);

    startNewGame();

    function moved(player, move){
        if (move.pass || move.resign) {
            return;
        }
        var coord = new Coordinate(move.move);

        board.play(coord, player.color);
        board.markLastMove(coord);    
    }

    function willMove(player) {
        if (player instanceof LocalUIPlayer) {
            board.updateHoverEffects(player.color);
            topPanel.enable();
        } else {
            topPanel.disable();
            board.clearHoverEffects();
        }

        
    }

    var white;
    function gameEnd(){
        alert('both player passed.');
        white.score().then(function(result){
            alert(result);
        });

    }
    function startNewGame() {
        white = new RemoteWebSocketPlayer(stones.WHITE, 'http://localhost:8080/');
        var black = new LocalUIPlayer(stones.BLACK, $board.events);
        var game = new Game(white, black, {});
        game.on('moved',moved);
        game.on('willmove',willMove);
        game.on('end',gameEnd);
        game.start();
    }


}

$(document).ready(setupJgoban);

