'use strict';

var server = require('./lib/server');

server.start()
    .then(function(server){
        console.log('Hapi server started @ ' + server.info.uri);
    }).catch(function(err){
        console.error(err);
    });