var express = require('express'),
    app = express(),
    server = app.listen(8080),
    favicon = require('serve-favicon'),
    _ = require('lodash'),
    io = require('socket.io').listen(server),
    redis = require('redis'),
    redisClient = redis.createClient();

var user = '';

app.set('view engine', 'jade');

app.use(express.static('public'));
app.use(express.static('bower_components'));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.get('/', function(req, res) {
  res.render('index', {title: 'Hello world', message: 'This is Black Box, right on time.'});
});

app.get('/chat', function(req, res) {
  res.render('chat');
});

var users = {};

/**
 * Store messages in redis list
 */
var storeMessages = function(name, data) {
  var message = JSON.stringify({name: name, data: data});
  redisClient.lpush('messages', message, function(err, response) {
    redisClient.ltrim('messages', 0, 9);
  });
};

/**
 * Store user in redis set
 */
var setUser = function(data) {
  redisClient.sadd('users', data.email);
};

/**
 * Store user's details in redis hash
 */
var setUserDetails = function(data) {
  redisClient.hmset(data.email, data);
};

var getUser = function(data) {
  redisClient.hgetall(data.email, function(err, response) {
    console.log('||||||||||', response);
    return response;
  });
};

var checkUser = function(data) {
  console.log(data.email);
  console.log(redisClient.sismember('users', data.email));
  //if (redisClient.sismember('users', data.email)) {
  //  console.log(data.email);
  //  console.log('===:- user exists'); 
  //} else {
  //  console.log('===:- user doesnt exist'); 
  //}
};

io.on('connection', function(socket) {

  socket.on('join', function(data) {
    users[socket.id] = data; // add to global list
    socket.user = data; // add user to socket session

    setUser(data);
    checkUser(data);

    redisClient.lrange('messages', 0, -1, function(err, messages) {
      messages = messages.reverse();
      messages.forEach(function(message){
        message = JSON.parse(message);
        socket.emit('message', message.nickname + ': ' + message.data);
      }); 
    });
  });

  socket.on('message', function(message) {
    io.sockets.emit('message', users[socket.id].nickname + ': ' + message);
    storeMessages(users[socket.id].nickname, message);
  });
});

exports = module.exports = app;
