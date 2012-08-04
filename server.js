#!/usr/bin/env node

var io = require('socket.io').listen(8080);
var twitter = require('ntwitter');
var arrays = require('./lib/arrays');
var config = require('./config');

var twit = new twitter(config.twitter);

clients = [];
history = [];
io.sockets.on('connection', function (socket) {
  clients.push(socket);

  history.forEach(function(elem) {
    socket.volatile.emit('tweet',elem);
  });
  socket.on('disconnect', function () {
    clients.remove(socket);
  });
});


twit.stream('statuses/filter', {track:'nv1ttest'}, function(stream) {
  stream.on('data', function (data) {
    handleData(data);
    clients.forEach(function(client) {
      client.volatile.emit('tweet',data);
    });
    history.push(data);
    if(history.length > config.history) { history.splice(0,1); }
  });
});

function handleData(data) {
        console.log(data);
        return true;
}
