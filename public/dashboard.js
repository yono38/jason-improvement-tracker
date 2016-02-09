$(document).ready(function() {
  function makeTemplateData(trackerData) {
    var tileData = [
      { // Gym
        imgUrl: 'http://www.equinox.com/assets/images/sharing/equinox_logo.jpg',
        icon: 'gym8',
        result: trackerData.gym.totals.month,
        goal: undefined,
        label: 'Checkins This Month'
      },
      { // Food
        imgUrl: 'https://upload.wikimedia.org/wikipedia/en/6/63/MyFitnessPal_Logo.png',
        icon: 'restaurant23',
        result: trackerData.calories.netCalories,
        goal: 1601,
        label: 'Net Calories'
      },
       { // Duolingo
        imgUrl: 'http://media.tumblr.com/5fd6b3ccc4e8c978c87f469b236558ad/tumblr_inline_mwkqv1OuOg1ss97ol.png',
        icon: 'chat27',
        result: trackerData.language.streak,
        goal: undefined,
        label: 'Spanish Lesson Streak'
      },   
      { // Money
        imgUrl: 'http://thefinancialbrand.com/wp-content/uploads/2015/06/Mint-logo.png',
        icon: 'money132',
        result: trackerData.language.streak,
        result: '$' + trackerData.money.recent.total.toFixed(2),
        goal: undefined,
        label: 'Daily Spending'
      }
    ];
    return {
      date: trackerData.calories.date,
      trackers: tileData
    };
  }

  $.getJSON('/trackall', function(trackerData) {
    var templateData = makeTemplateData(trackerData);
    var template = _.template(
      $( "#dash-template" ).html()
    );
    $('#dash-container').html(
      template(templateData)
    );
  });
});
