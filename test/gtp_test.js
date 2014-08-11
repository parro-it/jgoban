/*
 * jgoban
 * https://github.com/parroit/jgoban
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

'use strict';

var chai = require('chai');
chai.expect();
chai.should();

var Session = require('../lib/gtp.js');

describe.only('Session', function() {
    this.timeout(1000);

    after(function() {
        this.sess.quit();
    });

    before(function() {
        this.sess = new Session();
    });

    beforeEach(function(done) {
        this.sess.clearBoard().return().then(done).catch(done);
    });

    it('is defined', function() {
        Session.should.be.a('function');
    });

    it('is creatable', function() {
        this.sess.should.be.a('object');
    });

    it('resolve boardsize', function(done) {
        this.sess.boardsize(19).then(function(result) {
            result.should.be.deep.equal({
                ok: true
            });

            done();
        }).catch(done);
    });

    it('resolve komi', function(done) {
        this.sess.komi(19).then(function(result) {
            result.should.be.deep.equal({
                ok: true
            });

            done();
        }).catch(done);
    });


    it('resolve fixedHandicap', function(done) {
        this.sess.fixedHandicap(2).then(function(result) {
            result.should.be.deep.equal({
                ok: true
            });

            done();
        }).catch(done);
    });

    it('resolve fixedHandicap', function(done) {
        this.sess.fixedHandicap(2).then(function(result) {
            result.should.be.deep.equal({
                ok: true
            });

            done();
        }).catch(done);
    });

    it('resolve setFreeHandicap', function(done) {
        this.sess.setFreeHandicap(['A1', 'A2']).then(function(result) {
            result.should.be.deep.equal({
                ok: true
            });

            done();
        }).catch(done);
    });




    it('resolve placeFreeHandicap', function(done) {

        this.sess.placeFreeHandicap(3).then(function(result) {
            result.ok.should.be.equal(true);

            result.vertices.length.should.be.equal(3);

            result.vertices.forEach(function(vert) {
                vert.should.match(/[A-Z]\d\d?/);
            });

            done();
        }).catch(done);
    });


    it('resolve clearBoard', function(done) {
        this.sess.clearBoard().then(function(result) {
            result.should.be.deep.equal({
                ok: true
            });

            done();
        }).catch(done);
    });

    it('resolve play', function(done) {
        this.sess.play('B','A2').then(function(result) {
            result.should.be.deep.equal({
                ok: true
            });

            done();
        }).catch(done);
    });

    it('resolve genMove', function(done) {
        this.sess.genMove('B').then(function(result) {
            result.ok.should.be.equal(true);
            result.resigned.should.be.equal(false);
            result.move.should.match(/[A-Z]\d\d?/);
            done();
        }).catch(done);
    });

    it('reject unknown commands', function(done) {
        this.sess.runCommand('bad\n')

        .then(function(result) {

            done(new Error('should have been rejected'));

        })

        .catch(function(err) {
            err.message.should.be.equal('unknown command');
            done();
        });
    });

});
