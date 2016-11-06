require('dotenv').load();
var eq = require('./lib/equinox.js')();
var fp = require('./lib/myfitnesspal.js')();
var duo = require('./lib/duolingo.js')();
var mint= require('./lib/mint.js')();
var logger = require('morgan');
var express = require('express'),
    cors = require('cors');
var Promise = require('bluebird');
var app = express();

app.use(logger('dev'));
app.use(cors());

/*
app.get('/trackers/language/streak', function(req, res) {
  duo.login().then(duo.getStreak).then(data =>  {
      res.json(data);
  });
});
*/

app.get('/docs', (req, res) => {
  const docs = {
    '/trackers/gym': {
      description: 'Aggregates all information for current day'
    },
    '/trackers/gym/checkins': {
      description: 'Returns all month & week totals, and a list of checkin timestamps for the month',
      queryParams: {
        'month': 'Number 1-12',
        'year': '4-digit year'
      }
    },
    '/trackers/gym/classes': {
      description: 'Returns all classes for a day. Defaults to current day until 7pm when it switches to next day',
      queryParams: {
        'startDate': 'Datetime string for day to grab class data'
      }
    },
    '/trackers/gym/classes/:classId/bikes': {
      description: 'List of available bikes for a class'
    },
    '/trackers/gym/classes/:classId/cancel': {
      description: 'Cancel a booked bike'
    },
    '/trackers/gym/classes/:classId/book/:bikeId': {
      description: 'Book a bike'
    }
  };
  res.json(docs);
});

app.get('/trackers/gym', (req, res) => {
  eq.loginAndGetInfo().then(data => {
    res.json(data)
  });
});

app.get('/trackers/gym/checkins', function(req, res) {
  eq.login().then(function() {
    eq.getCheckins(req.query.month, req.query.year).then(data => {
      res.json(data);
    })
  });
});

app.get('/trackers/gym/classes', function(req, res) {
  eq.login().then(() => eq.getClasses(req.query.startDate)).then(data => {
    res.json(data);
  });
});

app.get('/trackers/gym/classes/:classId/bikes', function (req, res) {
  eq.login().then(eq.getOpenBikes.bind(this, req.params.classId)).then(data => {
    res.json(data);
  });
});

app.get('/trackers/gym/classes/:classId/cancel', (req, res) => {
  eq.login().then(eq.cancelBike.bind(this, req.params.classId)).then(d => {
    res.json(d);
  });
});

app.get('/trackers/gym/classes/:classId/book/:bikeId', (req, res) => {
  eq.login().then(() => {
    eq.bookBike(req.params.classId, req.params.bikeId).then(d => {
      res.json(d);
    });
  });
});

/*
app.get('/trackers/money', function(req, res) {
  mint.loginAndGetTransactions().then((data) => {
    res.json(data);
  });
});
*/

app.get('/trackers/calories', function(req, res) {
  fp.loginAndGetCalorieInfo().then(function(data) {
    res.json(data);
  });
});

app.get('/trackers/all', function(req, res) {
  Promise.all([fp.loginAndGetCalorieInfo(), eq.loginAndGetInfo(), /*duo.loginAndGetStreak(), mint.loginAndGetTransactions()*/]).then(function(resolved) {
    var resObj = {
      calories: resolved[0],
      gym: resolved[1],
      // language: resolved[2],
      // money: resolved[3]
    };

    res.json(resObj);
  });
});

app.use(express.static('public'));
app.use(cors());

app.listen(process.env.PORT, function () {
  console.log('API listening on port: ' + process.env.PORT);
});
