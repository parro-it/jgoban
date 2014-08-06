var requesty = require('requesty');


function GtpClient(uri){
    var req = this.req = requesty.new().usePromises();
    
    req
        .get()
        .using(uri)
        .headers({
            'User-Agent': 'requesty'
        });

    this.start = req.using({path:'/gnugo/start'}).build();


}

GtpClient.prototype.play = function(move){
    return this.req.using({path:'/gnugo/play/'+move}).send();
};

module.exports = GtpClient;