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

var mf = require('minifunct');

var jgo_coord = 'ABCDEFGHJKLMNOPQRST'.split(''); // 'J18' style of coordinates
var jgo_sgf = 'abcdefghijklmnopqrstuvwxyz'.split(''); // 'ai' style of coordinates


/**
 * Create a helper class to create coordinates from (1,2) (zero-based), 'ah' and 'J18' types of input.
 * You can create a coordinate with no arguments, in which case it defaults to (0,0), or with one argument,
 * in which case it tries to parse 'J18' or 'ai' type of string coordinate, or with two arguments, (i,j).
 */
function JGOCoordinate(i, j) {
    if (i !== undefined) {
        if (j !== undefined) {
            this.i = i;
            this.j = j;
        } else { // try to parse coordinates from first parameter
            this.i = 0;
            this.j = 0;

            if (typeof i != 'string')
                return;

            if (i.substr(0, 1).toUpperCase() == i.substr(0, 1)) { // capital letter, assume 'J18' type
                this.i = mf.indexOf(jgo_coord,i.substr(0, 1) ); // now also works for IE
                this.j = 19 - parseInt(i.substr(1));
            } else { // assume SGF-type coordinate
                this.i = mf.indexOf(jgo_sgf,i.substr(0, 1) );
                this.j = mf.indexOf(jgo_sgf,i.substr(1) );
            }
        }
    } else { // called without both parameters
        this.i = 0;
        this.j = 0;
    }
}

/**
 * Make a human readable 'J18' type string representation of the coordinate.
 *
 * @returns String representation
 */
JGOCoordinate.prototype.toString = function() {
    return jgo_coord[this.i] + (19 - this.j);
};

/**
 * Make an SGF-type 'ai' string representation of the coordinate.
 *
 * @returns String representation
 */
JGOCoordinate.prototype.sgf = function() {
    return jgo_sgf[this.i] + jgo_sgf[this.j];
};

/**
 * Make a copy of this coordinate.
 *
 * @returns {JGOCoordinate} A copy of this coordinate
 */
JGOCoordinate.prototype.copy = function() {
    return new JGOCoordinate(this.i, this.j);
};

module.exports = JGOCoordinate;

JGOCoordinate.sgf = jgo_sgf;
JGOCoordinate.coord = jgo_coord;