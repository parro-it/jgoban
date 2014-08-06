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

//var $ = require('jquery');
var mf = require('minifunct');
var domFind = require('jquery');
var JGOCoordinate = require('./JGOCoordinate');
var JGOBoard = require('./JGOBoard');
var EventEmitter = require('node-events');


// additional types used internally by the library - should not be set directly using set() method
var JGO_DEAD_BLACK = 3, // dead black stone (translucent)
    JGO_DEAD_WHITE = 4, // dead white stone (translucent)
    JGO_FILL = 5; // board color fill to occlude the board intersection lines (used for labels)

// CSS classes used for different types of intersections    
var jgo_classes = [
    'jgo_c',
    'jgo_b',
    'jgo_w',
    'jgo_d jgo_b', // order is important because last one will
    'jgo_d jgo_w', // be prefixed for _s and other board sizes
    'jgo_f'
];

var jgo_shadow = [false, true, true, false, false, false]; // whether the type casts a shadow

// Marker code to CSS class mapping
// some values have a default and reverse color options (for displaying marker on black stone)
var jgo_markers = {
    '_': ['black', 'white'], // labels such as '2', 'A', etc.
    '#': ['square_b', 'square_w'], // square
    '*': ['cross_b', 'cross_w'], // cross ('X')
    '/': ['triangle_b', 'triangle_w'], // triangle
    '0': ['circle_b', 'circle_w'], // circle
    '<': ['hover_b', 'hover_b'], // black stone hover
    '>': ['hover_w', 'hover_w'], // white stone hover
    '.': 'territory_b', // black territory - will cause underlying stones to appear dead
    ',': 'territory_w' // white territory - will cause underlying stones to appear dead
};



function jgo_renderDiv(html, props) {
    html.push('<div ');
    if ('className' in props) {
        html.push('class=\'');
        html.push(props.className);
        html.push('\' ');
    }
    if ('id' in props) {
        html.push('id=\'');
        html.push(props.id);
        html.push('\' ');
    }
    html.push('style=\'left: ');
    html.push(props.left);
    html.push('px; top: ');
    html.push(props.top);
    html.push('px;');
    if ('width' in props) {
        html.push(' width: ');
        html.push(props.width);
        html.push('px;');
    }
    if ('height' in props) {
        html.push(' height: ');
        html.push(props.height);
        html.push('px;');
    }
    if ('position' in props) {
        html.push(' background-position: ');
        html.push(props.position);
        html.push(';');
    }
    html.push('\'>');
    if ('content' in props)
        html.push(props.content);
    html.push('</div>');
}

var jgo_setups = {
    'normal': {
        classPrefix: '', // prefix to add to any size-related classes
        topLeft: [28, 28], // top left coordinate of the board in board.jpg
        bottomRight: [619, 657], // bottom right coordinate of the board
        squareSize: [31, 33], // size of board square (inside intersection lines)
        aaPosition: [45, 47], // coordinates of top left intersection (aa / A19)

        stoneSize: [30, 30], // size of stone image
        shadowSize: [57, 50], // size of shadow image
        stoneOffset: [13, 5], // how stone is positioned inside the shadow

        coordSize: [24, 24] // size of coordinate - they are positioned just outside board
    },

    'small': {
        classPrefix: '_s', // prefix to add to any size-related classes
        topLeft: [19, 19],
        bottomRight: [418, 437],
        squareSize: [21, 22],
        aaPosition: [30, 31],

        stoneSize: [20, 20],
        shadowSize: [38, 33],
        stoneOffset: [8, 3],

        coordSize: [16, 16]
    }
};

/**
 * Generate a 19x19 go board inside a table element. Basically makes a 21x21 table with inner cells as
 * intersections - these cells have their coordinates (like 'K12', 'A4', etc.) as their ids. The
 * resulting structure is very straightforward and you can inspect it using FireBug if you want, but
 * you don't need to because the method returns a JGOBoard which is tied to the table element and will
 * update all changes to the board in the table.
 *
 * @param {JQuery} board The board table element as jQuery object - created via statement such as $('#board')
 * @param {string} prefix (optional) A unique prefix to separate several boards on one page
 */
function jgo_generateBoard(boardElement, board, prefix, setupName) {
    var html = [],
        top, left, sgf, black = true,
        i, j, setup;

    if (setupName)
        setup = jgo_setups[setupName];
    else
        setup = jgo_setups.normal;

    var oldSet = board.set;

    //board.click = undefined; // this will be called on clicks if it is set
    //board.setup = setup; // save in case we need it later

    if (!prefix)
        prefix = '';

    board.shadowPrefix = 'jgo_sh' + prefix;
    board.stonePrefix = 'jgo_st' + prefix;
    board.markerPrefix = 'jgo_m' + prefix;

    // coordinate markers
    var topX = setup.aaPosition[0] - setup.coordSize[0] / 2,
        topY = setup.topLeft[1] - setup.coordSize[1],
        bottomY = setup.bottomRight[1] + 1,
        leftX = setup.topLeft[0] - setup.coordSize[0],
        leftY = setup.aaPosition[1] - setup.coordSize[1] / 2,
        rightX = setup.bottomRight[0] + 1,
        n;

    for (i = 0; i < 19; i++) {
        var coordClass = 'jgo_coord' + setup.classPrefix;
        n = '' + (19 - i);
        jgo_renderDiv(html, {
            left: topX,
            top: topY,
            className: coordClass,
            content: JGOCoordinate.coord[i]
        });
        jgo_renderDiv(html, {
            left: topX,
            top: bottomY,
            className: coordClass,
            content: JGOCoordinate.coord[i]
        });
        jgo_renderDiv(html, {
            left: leftX,
            top: leftY,
            className: coordClass,
            content: n
        });
        jgo_renderDiv(html, {
            left: rightX,
            top: leftY,
            className: coordClass,
            content: n
        });
        topX += setup.squareSize[0];
        leftY += setup.squareSize[1];
    }

    // background-position: top right;

    var stoneX = setup.aaPosition[0] - setup.stoneSize[0] / 2,
        stoneX2,
        stoneY = setup.aaPosition[1] - setup.stoneSize[1] / 2,
        shadowX = stoneX - setup.stoneOffset[0],
        shadowX2,
        shadowY = stoneY - setup.stoneOffset[1];

    // precalculate shadow clippings on top, bottom, left, right
    var widthRight = setup.bottomRight[0] + 1 - shadowX - setup.squareSize[0] * 18,
        heightBottom = setup.bottomRight[1] + 1 - shadowY - setup.squareSize[1] * 18,
        clipTop = 0,
        clipLeft = 0;

    if (widthRight > setup.shadowSize[0])
        widthRight = 0; // clear if it is unnecessary to clip
    if (heightBottom > setup.shadowSize[1])
        heightBottom = 0; // clear if it is unnecessary to clip
    if (shadowX < setup.topLeft[0])
        clipLeft = setup.topLeft[0] - shadowX; // only set if shadow goes over board

    /* clipping shadow top is currently not implemented, as it is not very often necessary
    if(shadowY < setup.topLeft[1])
        clipTop = setup.topLeft[1] - shadowY; // only set if shadow goes over board*/

    for (j = 0; j < 19; j++) {
        stoneX2 = stoneX;
        shadowX2 = shadowX;

        for (i = 0; i < 19; i++) {
            sgf = JGOCoordinate.sgf[i] + JGOCoordinate.sgf[j];

            var shadowProps = {
                left: shadowX2,
                top: shadowY,
                className: 'jgo_sh' + setup.classPrefix,
                id: board.shadowPrefix + sgf
            };

            if (i === 18 && widthRight)
                shadowProps.width = widthRight;
            if (j === 18 && heightBottom)
                shadowProps.height = heightBottom;

            if (i === 0 && clipLeft) {
                shadowProps.left += clipLeft;
                shadowProps.width = setup.shadowSize[0] - clipLeft;
                shadowProps.position = 'top right';
            }
            // clipping shadow top is not currently implemented, as it is unnecessary with current shadow
            // and would require extra logic for cases when both left and top clip occur

            jgo_renderDiv(html, shadowProps);
            jgo_renderDiv(html, {
                left: stoneX2,
                top: stoneY,
                className: 'jgo_c' + setup.classPrefix,
                id: board.stonePrefix + sgf
            });
            jgo_renderDiv(html, {
                left: stoneX2,
                top: stoneY,
                className: 'jgo_m' + setup.classPrefix,
                id: board.markerPrefix + sgf
            });

            stoneX2 += setup.squareSize[0];
            shadowX2 += setup.squareSize[0];
        }

        stoneY += setup.squareSize[1];
        shadowY += setup.squareSize[1];
    }

    boardElement.html(html.join(''));

    board.on('change', function(e) {
        setBoard.call(board, e.coord, e.stone, e.marker);
    });

    // logic for updating visual board with given stone/marker combo
    // needs to use setup.classPrefix for necessary CSS classes added
    function setBoard(sgfCoord, stone, marker) {
        //jshint validthis:true
        var clearMarker = true; // by default, clear text inside marker

        if (marker === '') { // clear marker
            domFind('#' + this.markerPrefix + sgfCoord).removeClass()
                .addClass('jgo_m' + setup.classPrefix);
        } else if (marker !== undefined) {
            var markerClass = jgo_markers[marker];

            if (markerClass === undefined) { // label
                if (stone == JGOBoard.intersectionTypes.BLACK)
                    domFind('#' + this.markerPrefix + sgfCoord).removeClass()
                    .addClass('jgo_m' + setup.classPrefix)
                    .addClass(jgo_markers._[1]).html(marker);
                else
                    domFind('#' + this.markerPrefix + sgfCoord).removeClass()
                    .addClass('jgo_m' + setup.classPrefix)
                    .addClass(jgo_markers._[0]).html(marker);

                if (stone == JGOBoard.intersectionTypes.CLEAR) // have a little background
                    stone = JGO_FILL;

                clearMarker = false; // this is the only case when we don't want to clear text
            } else if (marker == '.' || marker == ',') { // territory
                domFind('#' + this.markerPrefix + sgfCoord).removeClass()
                    .addClass('jgo_m' + setup.classPrefix)
                    .addClass(markerClass);

                if (stone == JGOBoard.intersectionTypes.BLACK) // mark stones inside territory dead
                    stone = JGO_DEAD_BLACK;
                else if (stone == JGOBoard.intersectionTypes.WHITE)
                    stone = JGO_DEAD_WHITE;

            } else { // other type of marker
                if (stone == JGOBoard.intersectionTypes.BLACK)
                    domFind('#' + this.markerPrefix + sgfCoord).removeClass()
                    .addClass('jgo_m' + setup.classPrefix)
                    .addClass(markerClass[1]);
                else
                    domFind('#' + this.markerPrefix + sgfCoord).removeClass()
                    .addClass('jgo_m' + setup.classPrefix)
                    .addClass(markerClass[0]);
            }
        }

        if (clearMarker)
            domFind('#' + this.markerPrefix + sgfCoord).html('');

        domFind('#' + this.stonePrefix + sgfCoord).removeClass().addClass(jgo_classes[stone] + setup.classPrefix);
        if (jgo_shadow[stone])
            domFind('#' + this.shadowPrefix + sgfCoord).show();
        else
            domFind('#' + this.shadowPrefix + sgfCoord).hide();
    }
    
    var result = {
        el: boardElement,
        events: new EventEmitter()
    };


    boardElement.find('.jgo_m').click(function(event) {
        
        var id = event.target.id.substring(board.markerPrefix.length);

        result.events.emit('click',new JGOCoordinate(id)); // TD id is a pure coordinate such as 'ab'
    });

    return result; 
}

module.exports =  jgo_generateBoard;
    