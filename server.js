#!/usr/bin/env node

var io = require('socket.io').listen(8080);
var twitter = require('ntwitter');
var arrays = require('./lib/arrays')

var twit = new twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});

clients = [];

io.sockets.on('connection', function (socket) {
  clients.push(socket);

  socket.on('disconnect', function () {
    clients.remove(socket);
  });
});


twit.stream('statuses/filter', {track:'twerfurt,twerfurt2012'}, function(stream) {
  stream.on('data', function (data) {
    handleData(data);
    clients.forEach(function(client) {
      client.volatile.emit('tweet',data);
    });
  });
});

function handleData(data) {
        console.log(data);
        return true;
}
