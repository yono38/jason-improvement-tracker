var request = require('request-promise');
var cheerio = require('cheerio');
var moment = require('moment');

function fp() {
  var BEARER_TOKEN = '';
  return {
    login: login,
    getCalorieInfo: getCalorieInfo,
    loginAndGetCalorieInfo: loginAndGetCalorieInfo
  };

  function loginAndGetCalorieInfo() {
    return login()
          .then(getBearerToken)
          .then(getCalorieInfo);
  }

  function getLoginToken() {
    // Scrape the authenticity token from https://www.myfitnesspal.com
    return request({
      url: process.env.MYFITNESSPAL_WEB_ROOT + '/account/logout',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
        'Upgrade-Insecure-Requests': '1',
        'Host': 'www.myfitnesspal.com'
      }
    }).then(function(body){
      var $ = cheerio.load(body);
      return $('input[name=authenticity_token]').val();
    });
  }

  function getBearerToken() {
    var url = 'https://www.myfitnesspal.com/user/auth_token?refresh=true';
      return request({
        url: url,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
          'Host': 'www.myfitnesspal.com'
        },
        json: true,
        jar: true
      });

  }

  function login(un, pw) {
    return getLoginToken().then(function(token){
      console.log('Login auth token acquired: ' + token);

      return request({
        url: process.env.MYFITNESSPAL_WEB_ROOT + '/account/login',
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
          'Upgrade-Insecure-Requests': '1',
          'Host': 'www.myfitnesspal.com'
        },
        form: {
          username: un || process.env.MYFITNESSPAL_USERNAME,
          password: pw || process.env.MYFITNESSPAL_PASSWORD,
          utf8: '✓',
          remember_me: '1',
          authenticity_token: token
        },
        jar: true
      }).catch(function(data) {
        console.log('Get bearer token..');
        return getBearerToken().then(function(data) {
          BEARER_TOKEN = data.token_type + ' ' + data.access_token;
          console.log('Set bearer token: ' + BEARER_TOKEN);
        });
      });
    });
  }

  function getCalorieInfo(date) {
    var infoDate;
    if (moment().hour() < 12) {
      infoDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    } else {
      infoDate = moment().format('YYYY-MM-DD');
    }
    console.log('Getting Calorie info for: ' + infoDate);

    return request({
      url: process.env.MYFITNESSPAL_API_ROOT + '/v2/diary?fields%5B%5D=energy&entry_date=' + infoDate,
      json: true,
      headers: {
        'Authorization': BEARER_TOKEN,
        'mfp-client-id': 'mfp-main-js',
        'mfp-user-id': '159709989367165',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
      }
    }).then(function(res) {
      var calories = 0;
      res.items.forEach(function(item) {
        if (item.type === 'diary_meal') {
          calories += item.nutritional_contents.energy.value;
        } else if (item.type === 'exercise_entry') {
          calories -= item.energy.value;
        }
      });
      return {
        date: infoDate,
        netCalories: calories
      };
    }).catch(function(err){
      console.log(err);
    });
  }
}
// ✓

module.exports = fp;
