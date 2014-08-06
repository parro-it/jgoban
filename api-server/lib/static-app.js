'use strict';

function register(plugin, options, next) {
    plugin.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '../dist'
            }
        }
    });
    next();
}


register.attributes = {
    pkg: {
        name: 'static app'
    }
};

module.exports = {
    register: register
};