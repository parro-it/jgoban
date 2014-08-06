/*!
 * jGoBoard v1.0
 * http://www.jgoboard.com/
 *
 * This software is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License:
 * http://creativecommons.org/licenses/by-nc/3.0/
 * If you want to negotiate on a commercial license, please contact the author.
 *
 * Date: 2011-02-17
 */
'use strict';

var JGOCoordinate = require('./JGOCoordinate');
var mf = require('minifunct');
var EventEmitter = require('node-events');

// fixed intersection types - DO NOT CHANGE VALUES, they are used as indices in arrays!
var JGO_CLEAR = 0, // no stone
    JGO_BLACK = 1, // black stone
    JGO_WHITE = 2; // white stone

/**
 * Go board class which has several helper methods to deal with common tasks such
 * as adjacent stones/liberties to a coordinate, or searching connected stones.
 * All changes to board contents need to go through the set(c,s) method!
 *
 * @param {int} width The width of the board
 * @param {int} height The height of the board - if not set, a square board is created
 */
function JGOBoard(width, height) {
    EventEmitter.call(this);
    this.markers = {}; // lookup table for markers with SGF coordinate as the key

    this.width = width;

    if (height !== undefined)
        this.height = height;
    else
        this.height = this.width;

    this.board = [];

    for (var i = 0; i < width; ++i) {
        var column = [];

        for (var j = 0; j < height; ++j)
            column.push(JGO_CLEAR);

        this.board.push(column);
    }
}

JGOBoard.prototype = new EventEmitter();


/**
 * Get the contents of the board at given coordinate.
 *
 * @param {JGOCoordinate} c The coordinate.
 * @returns {int} Either JGO_CLEAR, JGO_BLACK, or JGO_WHITE
 */
JGOBoard.prototype.get = function(c) {
    return this.board[c.i][c.j];
};

/**
 * Set the contents of the board at given coordinate(s).
 *
 * @param c The coordinate as JGOCoordinate object, or an array of JGOCoordinates
 */
JGOBoard.prototype.set = function(c, s) {
    if (c instanceof JGOCoordinate) {
        this.board[c.i][c.j] = s;
        this.onChange(c, s);
    } else if (c instanceof Array) {
        for (var i = 0, len = c.length; i < len; ++i) {
            var coord = c[i];
            this.board[coord.i][coord.j] = s;
            this.onChange(coord, s);
        }
    }
};


// Additional function to clear current markers
JGOBoard.prototype.clearMarkers = function() {
    var me = this;
    mf.each(Object.keys(this.markers), function(sgf) {
        me.mark(new JGOCoordinate(sgf), '');
    });
};

// Add a function to place markers. Marker value '' clears a marker if it exists.
// Special marker codes can be found from top of this file (jgo_markers).
JGOBoard.prototype.mark = function(coord, marker) {
    if (coord instanceof Array) { // handle arrays by calling ourselves
        var me = this;
        mf.each(coord, function(c) {
            me.mark(c, marker);
        });
        return;
    }

    var sgf = coord.sgf();

    if (marker === '')
        delete this.markers[sgf];
    else
        this.markers[sgf] = marker;

    this.onChange(coord, this.get(coord));

};


JGOBoard.prototype.onChange = function(coord, stone) {
    var sgf = coord.sgf();
    this.emit('change', {
        coord: sgf,
        stone: stone,
        marker: this.markers[sgf]
    });
};

/**
 * Get neighboring stones of given type as coordinate array.
 *
 * @param {JGOCoordinate} c The coordinate
 * @param {int} s The type of stones to look for (JGO_CLEAR / JGO_BLACK / JGO_WHITE)
 * @returns {Array} The array of adjacent coordinates of given type (may be an empty array)
 */
JGOBoard.prototype.getAdjacent = function(c, s) {
    var coordinates = [],
        i = c.i,
        j = c.j;

    if (i > 0 && this.board[i - 1][j] == s)
        coordinates.push(new JGOCoordinate(i - 1, j));
    if (i + 1 < this.width && this.board[i + 1][j] == s)
        coordinates.push(new JGOCoordinate(i + 1, j));
    if (j > 0 && this.board[i][j - 1] == s)
        coordinates.push(new JGOCoordinate(i, j - 1));
    if (j + 1 < this.height && this.board[i][j + 1] == s)
        coordinates.push(new JGOCoordinate(i, j + 1));

    return coordinates;
};


/**
 * Search all stones belonging to the group at the given coordinate - can also be used to find clear areas.
 *
 * @param {JGOCoordinate} cood The coordinate from which to start search - defines also the type of neighbors to search
 * @retuns {Array} A list of connected coordinates of the same type
 */
JGOBoard.prototype.getGroup = function(coord) {
    return this.getGroupColor(coord, this.get(coord));
};

JGOBoard.prototype.updateHoverEffects = function(player) {
    var marker;

    if (player == JGO_WHITE) {
        marker = '>';
    } else {
        marker = '<';
    }

    this.each(function(coordinate) {

        if (this.validMove(player, coordinate)) {
            this.mark(coordinate, marker);
        } else {
            this.mark(coordinate, '');
        }
    });
};


JGOBoard.prototype.clearHoverEffects = function() {
    return this.clearMarkers();

};


JGOBoard.prototype.markLastMove = function(coordinate) {

    this.mark(coordinate, 'O');
    if (this.lastMove) {
        this.mark(this.lastMove, '');
    }

    this.lastMove = coordinate;

};

JGOBoard.prototype.validMove = function(player, coord) {
    //coord is not clear
    if (this.get(coord) !== JGO_CLEAR) {
        return false;
    }

    //all adjacent cells are enemies    
    if (this.getAdjacent(coord, player).length === 0 && this.getAdjacent(coord, JGO_CLEAR).length === 0) {
        return false;
    }

    //the stone will reduce it's group liberties to 0 
    var wouldBeGroup = this.getGroupColor(coord, player);
    if (this.liberties(wouldBeGroup) === 0) {
        return false;
    }

    //TODO: check for ko

    //Valid move!
    return true;
};

/**
 * Search all stones belonging to the group at the given coordinate if the coord would have been
 * of the given color.
 *
 * @param {JGOCoordinate} cood The coordinate from which to start search - defines also the type of neighbors to search
 * @param {int} color The type of stones to look for (JGO_CLEAR / JGO_BLACK / JGO_WHITE)
 * @retuns {Array} A list of connected coordinates of the same type
 */
JGOBoard.prototype.getGroupColor = function(coord, color) {
    var added = {}, // hash to check if a coordinate has been added
        queue = [coord.copy()], // queue of coordinates to check
        coordinates = [], // group stone coordinates
        board = this; // needs to be saved so it can be accessed inside each() iterator
    var newQueue;

    while (queue.length > 0) { // continue until new stones are exhausted
        newQueue = [];
        mf.each(queue, function(c) {
            if (!(c.toString() in added)) { // a new coordinate found
                coordinates.push(c);
                added[c.toString()] = c;
                newQueue = newQueue.concat(board.getAdjacent(c, color)); // add connected stones to queue
            }
        }); // jshint ignore:line
        queue = newQueue;
    }

    return coordinates;
};

/**
 * Check if an array of coordinates have any liberties.
 *
 * @param {Array} group An array of JGOCoordinate instances comprising the group.
 */
JGOBoard.prototype.hasLiberties = function(group) {
    for (var i = 0, len = group.length; i < len; ++i)
        if (this.getAdjacent(group[i], JGO_CLEAR).length > 0)
            return true;

    return false;
};

/**
 * Count liberties of a group.
 *
 * @param {Array} group An array of JGOCoordinate instances comprising the group.
 */
JGOBoard.prototype.liberties = function(group) {
    var count = 0;
    var alreadyCounted = {};
    var i = 0;
    var len = group.length;
    var toString = JGOCoordinate.prototype.toString;
    var stringer = toString.call.bind(toString);

    var groupCoords = group.map(stringer);

    function sumLiberties(coord) {
        var sCoord = coord.toString();
        if (!alreadyCounted[sCoord]) {
            count++;
            alreadyCounted[sCoord] = true;
        }
    }

    for (; i < len; ++i) {
        var thisCoordLiberties = this.getAdjacent(group[i], JGO_CLEAR);

        thisCoordLiberties
            .map(stringer)
            .filter(function(coord) {
                return groupCoords.indexOf(coord) == -1;
            }) //jshint ignore:line
        .forEach(sumLiberties);

    }

    return count;
};

/**
 * Clear the board.
 */
JGOBoard.prototype.clear = function() {
    var c = new JGOCoordinate(0, 0);

    for (c.i = 0; c.i < this.width; c.i++)
        for (c.j = 0; c.j < this.height; c.j++)
            this.set(c, JGO_CLEAR);
};

/**
 * Get the difference between another board setup - i.e. the minimal amount of clear intersections,
 * black and white stones to add to this board to make it identical to another board.
 *
 * @param {JGOBoard} aBoard The target board
 * @retuns {Array} Array with three lists of coordinates: coordinates to clear, coordinates to fill with black, coordinates to fill with white
 */
JGOBoard.prototype.getDiff = function(aBoard) {
    var c = new JGOCoordinate(0, 0),
        diff = [
            [],
            [],
            []
        ],
        a;

    for (c.i = 0; c.i < 19; c.i++)
        for (c.j = 0; c.j < 19; c.j++)
            if (this.get(c) != (a = aBoard.get(c)))
                diff[a].push(c.copy());

    return diff;
};

/**
 * Simple iteration over all coordinates. Rather slow.
 *
 * @param {func} func The iterator method, which is called in the context of board object and passed coordinate as parameter.
 */
JGOBoard.prototype.each = function(func) {
    var c = new JGOCoordinate(0, 0);

    for (c.j = 0; c.j < 19; c.j++)
        for (c.i = 0; c.i < 19; c.i++)
            func.call(this, c.copy());
};

/**
 * Update the contents of the board using a diff element (create one with getDiff()).
 *
 * @param {Array} diff The diff to execute
 */
JGOBoard.prototype.setDiff = function(diff) {
    this.set(diff[JGO_CLEAR], JGO_CLEAR);
    this.set(diff[JGO_BLACK], JGO_BLACK);
    this.set(diff[JGO_WHITE], JGO_WHITE);
};

/**
 * Update the board to match another board.
 *
 * @param {JGOBoard} b The another board
 */
JGOBoard.prototype.setBoard = function(b) {
    var c = new JGOCoordinate(0, 0);

    for (c.i = 0; c.i < 19; c.i++) {
        for (c.j = 0; c.j < 19; c.j++) {
            var stone = b.board[c.i][c.j];

            if (this.board[c.i][c.j] != stone)
                this.set(c, stone);
        }
    }
};

/**
 * Make a copy of this board.
 *
 * @retuns {JGOBoard} A copy of this board (no shared objects)
 */
JGOBoard.prototype.copy = function() {
    var b = new JGOBoard(this.width, this.height);

    b.setBoard(this);

    return b;
};

/**
 * Make a string representation of this board
 *
 * @retuns {string} A simple string representation
 */
JGOBoard.prototype.toString = function() {
    var c = new JGOCoordinate(0, 0),
        arr = [],
        repr = ['.', '#', 'O'];

    for (c.j = 0; c.j < 19; c.j++) {
        for (c.i = 0; c.i < 19; c.i++)
            arr.push(repr[this.board[c.i][c.j]]);
        arr.push('\n');
    }

    return arr.join('');
};

/**
 * Construct a board out of string representation
 *
 * @param {string} str A simple string representation of board
 */
JGOBoard.prototype.fromString = function(str) {
    var pos = 0,
        c = new JGOCoordinate(0, 0),
        map = {
            '.': JGO_CLEAR,
            '#': JGO_BLACK,
            'O': JGO_WHITE
        };

    str = str.replace(/\n/g, ''); // works with or without newlines

    for (c.j = 0; c.j < 19; c.j++) {
        for (c.i = 0; c.i < 19; c.i++, pos++) {
            var stone = map[str.charAt(pos)];

            if (this.get(c) != stone)
                this.set(c, stone);
        }
    }
};

/**
 * Make a move on the board and capture stones if necessary.
 *
 * @param {JGOCoordinate} coord Coordinate to play
 * @param {int} stone Stone to play - JGO_BLACK or JGO_WHITE
 * @retuns {int} Number of opponent stones captured, or -1 if move not allowed (on top of another stone or suicide)
 */
JGOBoard.prototype.play = function(coord, stone) {
    var enemy = (stone == JGO_BLACK ? JGO_WHITE : JGO_BLACK),
        enemies, captures = 0,
        me = this;

    if (this.get(coord) != JGO_CLEAR)
        return -1;

    this.set(coord, stone); // put own stone on board

    enemies = this.getAdjacent(coord, enemy);

    mf.each(enemies, function(c) {
        if (me.get(c) != JGO_CLEAR) { // check that we have not already removed these enemy stones
            var group = me.getGroup(c);

            if (!me.hasLiberties(group)) {
                me.set(group, JGO_CLEAR);
                captures += group.length;
            }
        }
    });

    if (captures === 0 && !this.hasLiberties(this.getGroup(coord))) { // suicide
        this.set(coord, JGO_CLEAR); // revert changes
        return -1;
    }

    return captures;
};




module.exports = JGOBoard;

JGOBoard.fn = JGOBoard.prototype;

JGOBoard.intersectionTypes = {
    BLACK: JGO_BLACK,
    WHITE: JGO_WHITE,
    CLEAR: JGO_CLEAR

};
