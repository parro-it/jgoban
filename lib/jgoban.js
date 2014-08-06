/*
 * jgoban
 * https://github.com/parroit/jgoban
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

'use strict';
var $ = require('jquery');
var jgoboard = require('./jgoboard');
var Coordinate = jgoboard.Coordinate;
var intersectionTypes = jgoboard.intersectionTypes;
//var GtpSession = require('./gtp');
var ClientGtp = require('./client-gtp');

window.process = {
    env: {}
};


function otherPlayer(player) {
    if (player == intersectionTypes.BLACK) {
        return intersectionTypes.WHITE;
    } else {
        return intersectionTypes.BLACK;
    }

}



$(document).ready(function() { // jQuery way
    $('body').append('<div class="jgo_board"></div>');

    var board = jgoboard.generate($('.jgo_board'));


    var currentPlayer = intersectionTypes.BLACK;

    board.updateHoverEffects(currentPlayer);
/*
    var gnugo = new GtpSession();
    gnugo.boardsize(19);
*/
    var client = new ClientGtp('http://localhost:8080/');
    var opponentPlaying = true;
    client.start()
    .then(function(){
        opponentPlaying = false;
    })
    .catch(function(err){
        alert(err.message);
    });
    

    board.click = function(coord) {
        if (opponentPlaying || !this.validMove(currentPlayer, coord)) {
            return;
        }

        board.clearHoverEffects();
        board.play(coord, currentPlayer);
        board.markLastMove(coord);

        opponentPlaying = true;
        client.play(coord.toString())
        .then(function(res) {
            var result = res.data;
            var c = new Coordinate(result.move);

            if (result.resigned) {
                return alert('player resigned');
            }

            board.play(c, otherPlayer(currentPlayer));
            
            board.updateHoverEffects(currentPlayer);
            board.markLastMove(c);
            
            opponentPlaying = false;
        })
        .catch(function(err){
            alert(err.message);
        });
        
/*
        board.clearHoverEffects();
        board.play(coord, currentPlayer);

        opponentPlaying = true;
        gnugo.play('B', coord.toString())

        .then(function(result) {
            return gnugo.genMove('W');
        })

        .then(function(result) {
            if (result.resigned) {
                return alert('player resigned');
            }

            board.play(new Coordinate(result.move), otherPlayer(currentPlayer));

            
            board.updateHoverEffects(currentPlayer);
            opponentPlaying = false;
        })

        .catch(function(err) {
            alert(err.message);
        });
*/


/*
       currentPlayer = otherPlayer(currentPlayer);

       board.updateHoverEffects(currentPlayer);
*/

    };


});
