var express = require('express');
var config = require('./config');
var eq = require('./lib/equinox.js')(config);
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/eq', function (req, res) {
  eq.login().then(function() {
    console.log('Logged in!');
    eq.getCheckins().then(function(data) {
      res.json(data);
    });
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
