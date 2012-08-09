/* vim: set nu filetype=c shiftwidth=4 expandtab textwidth=80: */

var io      = require('socket.io').listen(8080),
    twitter = require('ntwitter'),
    arrays  = require('./lib/arrays'),
    config  = require('./config');

var twit = new twitter(config.twitter);

clients = [];
history = [];

twit.search(config.search, {'include_entities': 'true'}, function(err, data) {
    logDebug(data);

    data.results.reverse();
    data.results.forEach(function(elem) {
      prepareSearchData(elem,function(d) {
        pushHistory(d);
      });
    });
});

io.sockets.on('connection', function (socket) {
  clients.push(socket);

  history.forEach(function(elem) {
    socket.emit('tweet',elem);
  });
  socket.on('disconnect', function () {
    clients.remove(socket);
  });
});


twit.stream('statuses/filter', {track: config.search}, function(stream) {
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

function prepareStreamData(data, callback) {
  // TODO: reassamble data to new data object to unify
  //       data between streaming and normal API  
  callback(data);  
}

function prepareSearchData(data, callback) {
  // TODO: reassamble data to new data object to unify
  //       data between streaming and normal API  
  callback(data);  
}

function pushHistory(data) {
  history.push(data);

  if(history.length > config.history) {
    history.splice(0,1);
  }
}

function logDebug(data) {
  if (config.DEBUG===1) {
    console.log(data);
  } 
}
