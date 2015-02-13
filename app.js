var express = require('express')
var app = express()
var server = require('http').Server(app)

var io = require('socket.io')(server)
var cylon = require('cylon')

app.use(express.static(__dirname + '/public'))
server.listen(8080)

var getDevices = function() {
  return {
    button: { driver: 'button', pin: 2 },
    capacitive_touch: { driver: 'button', pin: 3 },
    potentiometer: { driver: 'analogSensor', pin: 0, lowerLimit: 100, upperLimit: 900 }
  }
}

var getConnections = function() {
  return {
    edison: { adaptor: 'intel-iot' }
  }
}

cylon.robot({
  connections: getConnections(),
  devices: getDevices()
}).on('ready', cylonReady);

cylon.start()

var cylonReady = function(my) {
  io
    .of('/notes')
    .on('connection', function (socket) {
      registerSocketHandlers(my, socket);
    })
}

var registerSocketHandlers = function(my, socket) {
  for (button in [my.button, my.capacitive_touch]) {
    button.on('push', function() {
      socket.emit({
        name: 'button',
        value: 'on'
      })
    })

    button.on('release', function() {
      socket.emit({
        name: 'button',
        value: 'off'
      })
    })
  }
}
