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

jgoboard.fn.validMove = function(player, coord) {
    //coord is not clear
    if (this.get(coord) !== intersectionTypes.CLEAR) {
        return false;
    }

    //all adjacent cells are enemies    
    if (this.getAdjacent(coord, player).length === 0 && this.getAdjacent(coord, intersectionTypes.CLEAR).length === 0) {
        return false;
    }

    //the stone will reduce it's group liberties to 0 
    var wouldBeGroup = this.getGroupColor(coord, player);
    if (this.liberties(wouldBeGroup) === 1 ) {
        return false;
    }

    //TODO: check for ko
    
    //Valid move!
    return true;
};

function otherPlayer(player) {
    if (player == intersectionTypes.BLACK) {
        return intersectionTypes.WHITE;
    } else {
        return intersectionTypes.BLACK;
    }

}

jgoboard.fn.updateHoverEffects = function(player) {
    var marker;

    if (player == intersectionTypes.WHITE) {
        marker = '>';
    } else {
        marker = '<';
    }

    this.each(function(coordinate) {

        if ( this.validMove(player, coordinate) ) {
            this.mark(coordinate, marker);
        } else {
            this.mark(coordinate, '');
        }
    });
};


$(document).ready(function() { // jQuery way
    $('body').append('<div class="jgo_board"></div>');

    var board = jgoboard.generate($('.jgo_board'));


    var currentPlayer = intersectionTypes.BLACK;

    board.updateHoverEffects(currentPlayer);



    board.click = function(coord) {
        if (! this.validMove(currentPlayer, coord) ) {
            return;
        }

        board.play(coord, currentPlayer);

        currentPlayer = otherPlayer(currentPlayer);

        board.updateHoverEffects(currentPlayer);


    };


});
