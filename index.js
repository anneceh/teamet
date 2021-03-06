var fs = require('fs');

var HUB_ADDRESS = process.argv[2] || 'http://localhost:3000';
var ID = process.argv[3] || 'sensortag1';
var SENSORTAG_ADDRESS = process.argv[4] || 'b0:b4:48:c9:57:81';

var express = require('express');
var socket = require('socket.io-client')(HUB_ADDRESS);
var SensorTag = require('sensortag');
var http = require('http');

var temp = 0;
var magnet = 0;
var accelometer = 0;

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

    tag.enableAccelerometer(log);
  tag.notifyAccelerometer(log);
  tag.setAccelerometerPeriod(1000, log);

    tag.enableMagnetometer(log);
  tag.notifyMagnetometer(log);
  tag.setMagnetometerPeriod(1000, log);

  return tag;
});

sensor.then(function(tag) {
  tag.on('irTemperatureChange', function(objectTemp, ambientTemp) {
    socket.emit('sensor:data', payload('irTemperature', {objectTemp, ambientTemp}));
    log(ambientTemp);
    writeToFile('temp.txt', ambientTemp);
    temp = ambientTemp;
  });
  
  tag.on('accelerometerChange', function(objectTemp, ambientTemp) {
    socket.emit('sensor:data', payload('irTemperature', {objectTemp, ambientTemp}));
    log(ambientTemp);
    writeToFile('accel.txt', ambientTemp);
    accelometer = ambientTemp;
  });

  tag.on('magnetometerChange', function(objectTemp, ambientTemp) {
    socket.emit('sensor:data', payload('irTemperature', {objectTemp, ambientTemp}));
    log(ambientTemp);
    writeToFile('magnometer.txt', ambientTemp);
    magnet = ambientTemp;
  });

});

socket.on('connect', function () {
      log('SensorTag logger: connected to IOT-Hub at ' + HUB_ADDRESS);
});

var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var router = express.Router();              // get an instance of the express Router

router.get('/api', function(req, res) {
    res.json({ temp: temp, magnet: magnet, accelometer: accelometer });   
});

var path = require('path');
global.appRoot = path.resolve(__dirname);

router.get('/', function(req, res) {
    res.sendFile(path.resolve(global.appRoot  + '/index.html'));
});

app.use('/', router);

app.listen(port);
console.log('Magic happens on port ' + port);