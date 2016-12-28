"use strict";

let _ = require('underscore');
const utils = require('./utils');
const basicAuth = require('basic-auth');
const moment = require('moment');

const bookBike = ({ classId, bikeId,
  // TODO ability to read in facilityId dynamically
  facilityId = process.env.EQUINOX_FACILITY_ID }) => {
    let bookUrl = `${process.env.EQUINOX_API_ROOT}/v2/bookaclass/${classId}/book/${facilityId}?bikeId=${bikeId}`;
    return utils.makeRequest(bookUrl, 'PUT');
  };

const cancelBike = ({ classId }) => {
  let cancelUrl = process.env.EQUINOX_API_ROOT + `/v1/bookaclass/${classId}/cancel`;
  return utils.makeRequest(cancelUrl, 'DELETE');
};

const getCheckins = ({ month = moment().format('M'), year = moment().year() }) => {
  let checkinUrl = process.env.EQUINOX_API_ROOT + '/v2.6/me/check-ins/' +
    year + '/' + month;
  return utils.makeRequest(checkinUrl, 'GET').then(data => {
    let weekTotal = 0;
    let checkins = Object.keys(data.checkIns).map(f => data.checkIns[f].startDate);

    data.checkIns.forEach(checkin => {
      if (utils.thisWeek(checkin.startDate)) {
        weekTotal++;
      }
    });
    return {
      totals: {
        month: data.checkIns.length,
        week: weekTotal
      },
      checkins
    };
  });
};

const getClasses = ({ startDate, facilityId = process.env.EQUINOX_FACILITY_ID,
  isBookingRequired = false }) => {
    const classUrl = process.env.EQUINOX_API_ROOT + '/v1/classes/allclasses';
    if (typeof startDate !== 'string') {
      if (moment().hour() < 19) {
        startDate = moment();
      } else {
        startDate = moment().add(1, 'day');
      }
    }
    const formData = {
        facilityIds: [facilityId],
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(startDate).add(1, 'day').format('YYYY-MM-DD'),
        isBookingRequired: isBookingRequired
    };
    return utils.makeRequest(classUrl, 'POST', formData).then(response => {
      const parseInstructorName = (instructors) => {
        const instructor = instructors[0].substitute || instructors[0].instructor;
        return `${instructor.firstName} ${instructor.lastName}`;
      }
      const classKeys = ['name', 'startDate', 'endDate', 'displayTime', 'timeSlot',
        'status', 'isOnCalendar']
      const classes = response.classes.map(gymClass =>
        Object.assign({}, _.pick(gymClass, classKeys), {
          id: gymClass.classInstanceId,
          facility: gymClass.facility.mobileName,
          instructor: parseInstructorName(gymClass.instructors),
          category: gymClass.primaryCategory.categoryName,
          isBookingRequired: gymClass.bookingType === 'Online'
      }));
      return {
        classDate: moment(startDate).format('YYYY-MM-DD'),
        classes: classes
      };
    });
  };

const getOpenBikes = ({ classId }) => {
  const bikeUrl = process.env.EQUINOX_API_ROOT + '/v2/classes/bikes/' + classId;
  return utils.makeRequest(bikeUrl, 'GET').then(data => {
    const openBikes = data.layout.bikes
    .filter(bike => !bike.reserved)
    .map(bike => ({
      name: bike.localId,
      id: bike.reservableEquipmentId
    }));
    return Object.assign({},
      _.pick(data, ['isFull', 'isClosed']), { bikes: openBikes })
  });
};

const getCalendar = ({ fromDate, toDate }) => {
  if (!fromDate || !toDate) {
    throw Error('Query parameters "fromDate" and "toDate" are required');
  }
  const calendarUrl = process.env.EQUINOX_API_ROOT + '/v3/me/calendar/'
    + `?fromDate=${fromDate}&toDate=${toDate}`;
  return utils.makeRequest(calendarUrl, 'GET');
};

const addToCalendar = ({ classId }) => {
  const calendarUrl = process.env.EQUINOX_API_ROOT + '/v3/me/calendar/' + classId;
  return utils.makeRequest(calendarUrl, 'POST');
};

const removeFromCalendar = ({ classId }) => {
  const calendarUrl = process.env.EQUINOX_API_ROOT + '/v3/me/calendar/remove/' + classId;
  return utils.makeRequest(calendarUrl, 'DELETE');
};

// Index of API Request Methods
const equinoxApiRequest = {
  bookBike,
  cancelBike,
  getCheckins,
  getClasses,
  getOpenBikes,
  addToCalendar,
  removeFromCalendar,
  getCalendar
};

const login = (username, password) => {
  const loginUrl = process.env.EQUINOX_API_ROOT + '/v1/authentication/login';

  return utils.makeRequest(loginUrl, 'POST', {
    username,
    password
  });
};

const makeAuthenticatedCall = (req, res, methodName, methodArguments) =>  {
  const { name, pass } = basicAuth(req);
  login(name, pass)
    .then(() => equinoxApiRequest[methodName](methodArguments))
    .then(data => res.json(data))
    .catch(err => res.json(err));
};

module.exports = { equinoxApiRequest, login, makeAuthenticatedCall };
