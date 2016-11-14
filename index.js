var fs = require('fs');

var HUB_ADDRESS = process.argv[2] || 'http://localhost:3000';
var ID = process.argv[3] || 'sensortag1';
var SENSORTAG_ADDRESS = process.argv[4] || 'b0:b4:48:c9:57:81';


var socket = require('socket.io-client')(HUB_ADDRESS);
var SensorTag = require('sensortag');

var log = function(text) {
  if(text) {
    console.log(text);
  }
}

var payload = function(sensor, data) {
  return {
    id: ID,
    type: 'sensortag',
    sensor: sensor,
    data: data
  };
}

var connected = new Promise((resolve, reject) => SensorTag.discoverByAddress(SENSORTAG_ADDRESS, (tag) => resolve(tag)))
  .then((tag) => new Promise((resolve, reject) => tag.connectAndSetup(() => resolve(tag), log)));

var sensor = connected.then(function(tag) {
  log('SensorTag: connected to ' + SENSORTAG_ADDRESS);
  tag.enableIrTemperature(log);
  tag.notifyIrTemperature(log);
  tag.setIrTemperaturePeriod(1000, log);

  return tag;
});

sensor.then(function(tag) {
  tag.on('irTemperatureChange', function(objectTemp, ambientTemp) {
    socket.emit('sensor:data', payload('irTemperature', {objectTemp, ambientTemp}));
log(ambientTemp);
  });
});

socket.on('connect', function () {
      log('SensorTag logger: connected to IOT-Hub at ' + HUB_ADDRESS);
});
