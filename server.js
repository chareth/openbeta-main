var express = require('express');
var cors = require('cors');
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', express.static(__dirname + '/'));

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

app.listen(server_port, server_ip_address, function () {
  console.log('App listening on ' + server_ip_address + ":" + server_port);
});
