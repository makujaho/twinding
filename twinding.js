var twinding = {},
    io       = require('socket.io').listen(8080),
    twitter  = require('ntwitter'),

    clients,
    history,
    historyLength,
    twit;

// Helper function
_logDebug(data) {
   if (twinding.DEBUG && twinding.DEBUG===1) {
        console.log(data);
    } 
}

clients       = [];
history       = [];
historyLength = 20;
twit          = {};

twinding.start = function (config) {
    if (twit && twit.search) {
        _logDebug("WARNING: Server already started");
        return;
    }

    twit = new twitter(config.twitter);

    io.sockets.on('connection', function (socket) {
        clients.push(socket);

        history.forEach(function(elem) {
            socket.emit('tweet',elem);
        });

        socket.on('disconnect', function () {
            clients.remove(socket);
        });
    });
};

initHistory = function(search) {
    if (!twit.search) {
        logDebug("ERROR: twitter Object not setup");
        return;
    } 

    twit.search(search, {'include_entities': 'true'}, function(err, data) {
        logDebug(data);

        data.results.reverse();
        data.results.forEach(function(elem) {
            prepareSearchData(elem,function(d) {
                pushHistory(d);
            });
        });
    });
};

startStream = function (search) {
    twit.stream('statuses/filter', {track: search}, function(stream) {
        stream.on('data', function (data) {
            logDebug(data);

            prepareStreamData(data, function (d) {
                pushHistory(data);

                clients.forEach(function(client) {
                    client.emit('tweet',data);
                });
            });

        });
    });
};

prepareStreamData = function (data, callback) {
    // TODO: reassamble data to new data object to unify
    //       data between streaming and normal API  
    callback(data);  
}

prepareSearchData = function (data, callback) {
    // TODO: reassamble data to new data object to unify
    //       data between streaming and normal API  
    callback(data);  
}

pushHistory = function (data) {
    history.push(data);

    if(history.length > historyLength) {
        history.splice(0,1);
    }
}

