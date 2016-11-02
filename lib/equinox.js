"use strict";

let request = require('request-promise');
let moment = require('moment');
let _ = require('underscore');

function eq() {
  // YAY OBJECT LITERAL SYNTAX
  return {
    bookBike,
    cancelBike,
    getCheckins,
    getClasses,
    getOpenBikes,
    login,
    loginAndGetInfo
  };

  function bookBike(classId, bikeId, facilityId = process.env.EQUINOX_FACILITY_ID) {
    let bookUrl = `${process.env.EQUINOX_API_ROOT}/v2/bookaclass/${classId}/book/${facilityId}?bikeId=${bikeId}`;
    return makeRequest(bookUrl, 'PUT');
  }

  function cancelBike(classId) {
    let cancelUrl = process.env.EQUINOX_API_ROOT + `/v1/bookaclass/${classId}/cancel`;
    return makeRequest(cancelUrl, 'DELETE');
  }

  function getCheckins(month = moment().format('M'), year = moment().year()) {
    let checkinUrl = process.env.EQUINOX_API_ROOT + '/v2.6/me/check-ins/' +
      year + '/' + month;
    return makeRequest(checkinUrl, 'GET').then(data => {
      let weekTotal = 0;
      let checkins = Object.keys(data.checkIns).map(f => data.checkIns[f].startDate);

      data.checkIns.forEach(checkin => {
        if (thisWeek(checkin.startDate)) {
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
  }

  function getClasses(startDate, facilityId = process.env.EQUINOX_FACILITY_ID,
     isBookingRequired = false) {
    let classUrl = process.env.EQUINOX_API_ROOT + '/v1/classes/allclasses';
    if (typeof startDate !== 'string') {
      if (moment().hour() < 19) {
        startDate = moment();
      } else {
        startDate = moment().add(1, 'day');
      }
    }
    var formData = {
        facilityIds: [facilityId],
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(startDate).add(1, 'day').format('YYYY-MM-DD'),
        isBookingRequired: isBookingRequired
    };
    return makeRequest(classUrl, 'POST', formData).then((response) => {
      const parseInstructorName = (instructors) => {
        const instructor = instructors[0].substitute || instructors[0].instructor;
        return `${instructor.firstName} ${instructor.lastName}`;
      }
      let classKeys = ['name', 'startDate', 'endDate', 'displayTime', 'timeSlot',
        'status']
      let classes = response.classes.map(gymClass =>
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
  }

  function getOpenBikes(classId) {
    let bikeUrl = process.env.EQUINOX_API_ROOT + '/v2/classes/bikes/' + classId;
    return makeRequest(bikeUrl, 'GET').then(data => {
      let openBikes = data.layout.bikes
      .filter(bike => !bike.reserved)
      .map(bike => ({
        name: bike.localId,
        id: bike.reservableEquipmentId
      }));
      return Object.assign({}, _.pick(data, ['isFull', 'isClosed']), openBikes);
    });
  }

  function login(username = process.env.EQUINOX_USERNAME, password = process.env.EQUINOX_PASSWORD) {
    let loginUrl = process.env.EQUINOX_API_ROOT + '/v1/authentication/login';

    return makeRequest(loginUrl, 'POST', {
        username,
        password
    });
  }

  function loginAndGetInfo() {
    return login().then(function() {
      return Promise.all([getCheckins(), getClasses()]).then(function(resolved) {
        return Object.assign({}, resolved[0], resolved[1]);
      });
    });
  }

  /**
  * Helper Functions
  */

  function makeRequest(url, method, form) {
    let requestOpts = {
      url,
      method,
      json: true,
      jar: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
        'Origin': 'https://www.equinox.com',
        'Referer': 'https://www.equinox.com/activity'
      }
    };
    if (form) {
      requestOpts.form = form;
    }
    return request(requestOpts);
  }

  function thisWeek(date) {
    let weekStart = moment().startOf('week'); // Sunday
    let weekEnd = moment().endOf('week'); // Saturday
    return moment(date).isSameOrAfter(weekStart) && moment(date).isSameOrBefore(weekEnd);
  }
}

module.exports = eq;
