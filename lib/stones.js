'use strict';

function Stone(value){
    if (! this instanceof Stone) {
        return new Stone(value);
    }
    this.value = value;
}

Stone.prototype.valueOf = function(){
    return this.value;
};

// fixed intersection types - DO NOT CHANGE VALUES, they are used as indices in arrays!
var stones = module.exports = {
    CLEAR: new Stone(0),
    BLACK: new Stone(1),
    WHITE: new Stone(2)
};

Object.keys(stones).forEach(function(name){
    var stone = stones[name];
    stone.abbrev = name[0];
    stones[stone.abbrev] = stone;
});

stones.BLACK.other = stones.WHITE;
stones.WHITE.other = stones.BLACK;
stones.CLEAR.other = null;

module.exports = stones;