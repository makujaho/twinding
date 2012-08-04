#!/usr/bin/env node

var io = require('socket.io').listen(8080);
var twitter = require('ntwitter');
var arrays = require('./lib/arrays');
var config = require('./config');

var twit = new twitter(config.twitter);

clients = [];
history = [];

/*
twit.search('twerfurt OR twerfurt2012', {'include_entities': 'true'}, function(err, data) {
    console.log(data);
    history = data.results;
    if(history.length > config.history) { history.splice(0,history.length-config.history); }
    history.reverse();
});
*/
io.sockets.on('connection', function (socket) {
  clients.push(socket);

  history.forEach(function(elem) {
    socket.emit('tweet',elem);
  });
  socket.on('disconnect', function () {
    clients.remove(socket);
  });
});


twit.stream('statuses/filter', {track:'twerfurt,twerfurt2012'}, function(stream) {
  stream.on('data', function (data) {
    handleData(data);
    clients.forEach(function(client) {
      client.emit('tweet',data);
    });
    history.push(data);
    if(history.length > config.history) { history.splice(0,1); }
  });
});

function handleData(data) {
        console.log(data);
        return true;
}
