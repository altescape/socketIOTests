var socket = io();

$('.chat-wrapper').hide();

$('#join').submit(function() {
  var nickname = $('#nickname').val();
  var firstname = $('#firstname').val();
  var lastname = $('#lastname').val();
  var email = $('#email').val();
  var message = {firstname: firstname, lastname: lastname, nickname: nickname, email: email};
  socket.emit('join', message);
  $('.join-wrapper').hide();
  $('.chat-wrapper').fadeIn('slow');
  return false;
});

$('form#join input').keypress(function(ev){
  if (ev.which === 13) {
    ev.preventDefault();

    var nickname = $('#nickname').val(),
        firstname = $('#firstname').val(),
        lastname = $('#lastname').val(),
        email = $('#email').val(),
        message = {firstname: firstname, lastname: lastname, nickname: nickname, email: email};

    socket.emit('join', message);
    $('.join-wrapper').hide();
    $('.chat-wrapper').fadeIn('slow');

    $('#join').submit();
  }
});

socket.on('join', function(user) {
  // store a cookie;
});

$('#chat').submit(function() {
  var msg = $('#message');
  socket.emit('message', msg.val());
  msg.val('');
  return false;
});

socket.on('message', function(msg) {
  $('#messages').append($('<li />').text(msg)); 
});
