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

var jgoban = require('../lib/jgoban.js');

describe('jgoban', function(){
    it('is defined', function(){
      jgoban.should.be.a('function');
    });

});
