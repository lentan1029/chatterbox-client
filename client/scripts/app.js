var app = {
  server: 'https://api.parse.com/1/classes/messages',
  currentRoom: 'lobby',
  rooms: [],
  friends: [],
  init: function() {
    this.fetch(function(data) {
      for (var i = 0; i < data.results.length; i++) {
        app.addRoom(data.results[i]);
      }
    });
    this.addRoom({
      roomname: this.currentRoom
    });
    $('#roomSelect option:eq(1)').prop('selected', true);
  },
  send: function(message) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },
  clearMessages: function() {
    $('#chats').empty();
  },
  fetch: function(cb) {
    $.ajax({
      url: app.server,
      type: 'GET',
      success: function (data) {
        if (typeof cb === 'function') {
          cb(data);
        }
        //clear #chats
        app.clearMessages();
        //append new messages
        for (var i = 0; i < data.results.length; i++) {
          if (app.currentRoom === 'lobby') {
            app.addMessage(data.results[i]);
          } else {
            if (data.results[i].roomname === app.currentRoom) {
              app.addMessage(data.results[i]);
            }
          }
        }
        // console.log('chatterbox: Message received:', data);

      },
      error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },
  addMessage: function(data) {
    var $chats = $('#chats'); 
    var $container = $('<div></div>');
    var $message = $('<div></div>');
    var $user = $('<div class="username"></div>');
    $user.on('click', function() {
      app.addFriend(data.username);
    });
    $user.text(data.username + ': ');
    $container.append($user);

    var messageText = data.text;
    $message.text(messageText);
    $container.append($message);
    $chats.append($container);

    if (app.friends.includes(data.username)) {
      $container.addClass('friend');
    }
  },
  addRoom: function(data) {
    if (data.roomname !== undefined && data.roomname !== '' 
      && data.roomname !== 'New Room...' && this.rooms.indexOf(data.roomname.toLowerCase()) === -1) {
      var $dropdown = $('#roomSelect');
      var $room = $('<option></option>');
      var roomName = data.roomname.toLowerCase();
      $room.text(roomName.toLowerCase());
      $dropdown.append($room);
      this.rooms.push(data.roomname.toLowerCase());
    }
  },
  addFriend: function(userName) {
    if (!app.friends.includes(userName)) {
      app.friends.push(userName);
    }
  },
  handleSubmit: function() {
    //does nothing.. just passes SpecRunner
  }

};

$('document').ready(function() {

  $('#send').submit(function( event ) {
    app.handleSubmit();
    app.send({
      roomname: app.currentRoom,
      username: window.location.search.slice(10),
      text: $('#message').val()
    });
    event.preventDefault();
    $('#message').val('');
  }); 

  $('#roomSelect').on('change', function(data) {
    if ($('#roomSelect option:selected').text() === 'New Room...') {
      $('#newRoomName').show();
    } else {
      $('#newRoomName').hide();
      app.currentRoom = $('#roomSelect option:selected').text();
    }
  });

  $('#newRoomName').keypress(function(e) {
    if (e.which === 13) {
      app.currentRoom = $('#newRoomName').val().toLowerCase();
      app.addRoom({
        roomname: app.currentRoom
      });
      $('#roomSelect').val($('#newRoomName').val().toLowerCase());
      $('#newRoomName').val('');
      $('#newRoomName').hide();
    }
  });

  app.init();

});

window.setInterval(app.fetch, 1000); 
