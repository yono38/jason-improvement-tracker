const PORT = process.env.PORT || 4555;
const equinox = require('./lib/equinox.js');
const logger = require('morgan');
const basicAuth = require('basic-auth');
const moment = require('moment');
const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');

var app = express();
const { auth, unauthorized } = require('./lib/utils');

app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());

app.get('/docs', (req, res) => {
  const docs = {
    'GET /checkins': {
      description: 'Returns all month & week totals, and a list of checkin timestamps for the month',
      queryParams: {
        'month': 'Number 1-12',
        'year': '4-digit year'
      }
    },
    'GET /classes': {
      description: 'Returns all classes for a day. Defaults to current day until 7pm when it switches to next day',
      queryParams: {
        'startDate': 'Datetime string for day to grab class data'
      }
    },
    'GET /classes/:classId/bikes': {
      description: 'List of available bikes for a class'
    },
    'POST /classes/:classId': {
      description: 'Book a bike'
    },
    'DELETE /classes/:classId': {
      description: 'Cancel a booked bike'
    },
  };
  res.json(docs);
});

app.get('/auth', auth, (req, res) => {
  const { name, pass } = basicAuth(req);
  equinox.login(name, pass)
    .then(data => res.json(data))
    .catch(err => {
      console.error(err.message);
      return unauthorized(res);
    });
});

app.get('/classes', auth, (req, res) => {
  equinox.makeAuthenticatedCall(req, res, 'getClasses', {
    startDate: req.query.startDate
  });
});

app.get('/classes/:classId/bikes', auth, (req, res) => {
  equinox.makeAuthenticatedCall(req, res, 'getOpenBikes', {
    classId: req.params.classId
  });
});


app.get('/classes/:classId', auth, (req, res) => {
  equinox.makeAuthenticatedCall(req, res, 'getClass', {
    classId: req.params.classId
  });
});


app.delete('/classes/:classId', auth, (req, res) => {
  equinox.makeAuthenticatedCall(req, res, 'cancelBike', {
    classId: req.params.classId
  });
});

app.post('/classes/:classId', auth, (req, res) => {
  equinox.makeAuthenticatedCall(req, res, 'bookBike', {
    classId: req.params.classId,
    bikeId: req.body.bikeId,
    facilityId: req.body.facilityId
  });
});

app.post('/calendar/:classId', auth, (req, res) => {
  equinox.makeAuthenticatedCall(req, res, 'addToCalendar', {
    classId: req.params.classId
  });
});

app.delete('/calendar/:classId', auth, (req, res) => {
  equinox.makeAuthenticatedCall(req, res, 'removeFromCalendar', {
    classId: req.params.classId
  });
});

app.get('/calendar', auth, (req, res) => {
  equinox.makeAuthenticatedCall(req, res, 'getCalendar', {
    fromDate: req.query.fromDate,
    toDate: req.query.toDate
  });
});

app.get('/checkins', auth, (req, res) => {
  equinox.makeAuthenticatedCall(req, res, 'getCheckins', {
    month: req.query.month,
    year: req.query.year
  });
});

app.get('/workouts', auth, (req, res) => {
  equinox.makeAuthenticatedCall(req, res, 'getActivity', {
    month: req.query.month,
    year: req.query.year
  });
});

app.use(cors());

app.listen(PORT, function () {
  console.log('API listening on port: ' + PORT);
});
