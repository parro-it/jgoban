/*
 * jgoban
 * https://github.com/parroit/jgoban
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */


var spawn = require('child_process').spawn;
var Promise = require('bluebird');

function GtpError() {
    var tmp = Error.apply(this, arguments);
    tmp.name = this.name = 'GtpError';

    this.message = tmp.message;
    this.stack = tmp.stack;

    return this;
}

var IntermediateInheritor = function() {};
IntermediateInheritor.prototype = Error.prototype;
GtpError.prototype = new IntermediateInheritor();


function stripControlChar(data) {
    var i = 0;
    var l = data.length;
    var result = '';
    var char = 0;

    for (; i < l; i++) {
        char = data.readUInt8(i);
        if ((char >= 32 && char != 127) || char == 10 || char == 9) {
            result = result + data.toString('ascii', i, i + 1);
        }
    }

    return result;
}

function Session() {

    this.proc = spawn('/usr/games/gnugo', ['--mode', 'gtp']);

}


Session.prototype.boardsize = function(size) {

    return this.runCommand('boardsize ' + size + '\n').return({
        ok: true
    });

};


Session.prototype.showBoard = function() {

    return this.runCommand('showboard\n')

    .then(function(result) {
        return {
            ok: true,
            result: result
        };
    });

};




Session.prototype.finalScore = function() {

    return this.runCommand('final_score\n').then(function(result) {
        return {
            result: result,
            ok: true
        };
    });

};


Session.prototype.undo = function() {

    return this.runCommand('undo\n').then(function() {
        return {
            ok: true
        };
    });

};


Session.prototype.fixedHandicap = function(stones) {

    return this.runCommand('fixed_handicap ' + stones + '\n').return({
        ok: true
    });

};

Session.prototype.play = function(color, stone) {

    return this.runCommand('play ' + color + ' ' + stone + '\n').return({
        ok: true
    });

};


Session.prototype.genMove = function(color) {

    return this.runCommand('genmove ' + color + '\n').then(function(result) {
        var pass = result === 'PASS';
        var resigned = result === 'resigned';

        return {
            ok: true,
            pass: pass,
            resigned: resigned,
            move: pass || resigned ? null : result
        };

    });

};

Session.prototype.placeFreeHandicap = function(stones) {

    return this.runCommand('place_free_handicap ' + stones + '\n').then(function(result) {
        return {
            ok: true,
            vertices: result.split(' ')
        };
    });

};



Session.prototype.komi = function(value) {

    return this.runCommand('komi ' + value + '\n').return({
        ok: true
    });

};


Session.prototype.loadSgf = function(filePath) {

    return this.runCommand('loadsgf ' + filePath + '\n').return({
        ok: true
    });

};

Session.prototype.clearBoard = function() {

    return this.runCommand('clear_board\n').return({
        ok: true
    });

};


Session.prototype.setFreeHandicap = function(vertices) {

    return this.runCommand('set_free_handicap ' + vertices.join(' ') + '\n').return({
        ok: true
    });

};


Session.prototype.runCommand = function(command) {
    var stdin = this.proc.stdin;
    var stdout = this.proc.stdout;
    var stderr = this.proc.stderr;
    //var emit = this.emit.bind(this);
    return new Promise(function(resolve, reject) {
        var result = '';
        stdout.on('data', function(data) {
            var chunk = stripControlChar(data);
            result += chunk;

            if (result.slice(-2) == '\n\n') {

                if (result[0] == '=') {
                    resolve(result.slice(2, -2));
                } else if (result[0] == '?') {
                    reject(new GtpError(result.slice(2, -2)));
                } else {
                    var err = new Error('Protocol error: unexpected result ' + result);
                    reject(err);
                }

                stdout.removeAllListeners('data');
                stdout.removeAllListeners('err');
            }

        });

        stdout.once('err', function(data) {
            stdout.removeAllListeners('data');
            var err = new Error(stripControlChar(data));
            reject(err);
        });

        stdin.write(command);
    });

};


Session.prototype.quit = function(size) {
    this.proc.stdin.write('quit\n');
};

module.exports = Session;
Session.GtpError = GtpError;
