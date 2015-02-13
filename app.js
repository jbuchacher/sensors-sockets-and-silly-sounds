var express = require('express')
var app = express()
var server = require('http').Server(app)

var io = require('socket.io')(server)
var cylon = require('cylon')

app.use(express.static(__dirname + '/public'))
server.listen(8080)

var getDevices = function() {
  return {
    led: { driver: 'led', pin: 13 }
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

}
