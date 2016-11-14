var fs = require('fs');

var HUB_ADDRESS = process.argv[2] || 'http://localhost:3000';
var ID = process.argv[3] || 'sensortag1';
var SENSORTAG_ADDRESS = process.argv[4] || 'b0:b4:48:c9:57:81';

var express = require('express');
var socket = require('socket.io-client')(HUB_ADDRESS);
var SensorTag = require('sensortag');
var temp = 0;

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

function writeToFile(filename, data) {
  fs.appendFile(filename, data + '\n', function (err) {
  if (err) {
    // append failed
  } else {
    // done
  }
});
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
    writeToFile('temp.txt', ambientTemp);
    temp = ambientTemp;
  });
});

socket.on('connect', function () {
      log('SensorTag logger: connected to IOT-Hub at ' + HUB_ADDRESS);
});

var app = express();

app.get('/', function (req, res) {
  res.send(temp)
})

app.listen(3000, function () {
  console.log(temp)
})
