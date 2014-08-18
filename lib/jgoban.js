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
var Promise = require('bluebird');
Promise.longStackTraces();
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
    $undo.click(uiEvents.emit.bind(uiEvents,'undoRequest'));
    //$resign.click(uiEvents.emit.bind(uiEvents,'resign'));
    

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
    var moves =[];
    var $board = boardUi($('.jgo_board'),board);

    var topPanel = setupTopPanel($board.events);

    startNewGame();

    function moved(player, move){
        if (move.pass || move.resign) {
            return;
        }
        var coord = new Coordinate(move.move);

        moves.push(move);
        board.play(coord, player.color);
        board.markLastMove(coord);    
    }

     function undoAccepted(){
        var i=0;
        var move;

        for (; i<2; i++) {
            move = moves.pop();
            board.set(new Coordinate(move.move), stones.CLEAR);
                
        }
        move = moves[moves.length - 1];

        board.markLastMove(new Coordinate(move.move));    
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

    $('body').append('<pre id="debug-pane" style="color: white;"></pre>');
    $('#resign').click(function(){
        white.showBoard().then(function(res){
            $('#debug-pane').html(res.data.result);
            debugger
        });
    });

    function gameEnd(){
        alert('both player passed.');
        white.finalScore().then(function(res){
            
            alert(res.result);
        });

    }
    function startNewGame() {
        white = new RemoteWebSocketPlayer(stones.WHITE, 'http://localhost:8080/');
        

        var black = new LocalUIPlayer(stones.BLACK, $board.events);
        var game = new Game(white, black, {});
        game.on('moved',moved);
        game.on('willmove',willMove);
        game.on('end',gameEnd);
        game.on('undoAccepted',undoAccepted);
        game.start();
    }


}

$(document).ready(setupJgoban);

