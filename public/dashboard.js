$(document).ready(function() {
  function makeBarChart(txns) {
    var barData = _.map(txns, function(val, key) {
      return {
        'x': moment(key, 'MMM D').format('M/D'),
        'y': val
      };
    }).slice(0, 7).reverse();

  var vis = d3.select('#visualisation'),
    WIDTH = 275,
    HEIGHT = 175,
    MARGINS = {
      top: 5,
      right: 5,
      bottom: 15,
      left: 5
    },
    xRange = d3.scale.ordinal().rangeRoundBands([MARGINS.left, WIDTH - MARGINS.right], 0.1).domain(barData.map(function (d) {
      return d.x;
    })),

    yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([0,
      d3.max(barData, function (d) {
        return d.y;
      })
    ]),

    xAxis = d3.svg.axis()
      .scale(xRange)
      .tickSize(5)
      .tickSubdivide(true),

    yAxis = d3.svg.axis()
      .scale(yRange)
      .tickSize(5)
      .orient("left")
      .tickSubdivide(true);

  vis.append('svg:g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
    .call(xAxis);

  vis.append('svg:g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
    .call(yAxis);

  vis.selectAll('rect')
    .data(barData)
    .enter()
    .append('rect')
    .attr('x', function (d) { return xRange(d.x); })
    .attr('y', function (d) { return yRange(d.y); })
    .attr('width', xRange.rangeBand())
    .attr('height', function (d) {
      return ((HEIGHT - MARGINS.bottom) - yRange(d.y));
    })
    .attr('fill', '#F4F4F9');

  vis.selectAll("text.bar")
    .data(barData)
    .enter()
    .append("text")
    .attr("class", "bar spend-value")
    .attr("text-anchor", "middle")
    .attr('x', function (d) { return xRange(d.x) + (xRange.rangeBand() / 2); })
    .attr('y', function (d) { return yRange(d.y) - 1; })
    .text(function(d) { return '$' + parseInt(d.y); });
}

  function makeTemplateData(trackerData) {
    var tileData = [
      { // Gym
        imgUrl: 'http://www.equinox.com/assets/images/sharing/equinox_logo.jpg',
        type: 'gym',
        icon: 'gym8',
        result: trackerData.gym.totals.month,
        goal: undefined,
        flip: true,
        label: 'Checkins This Month'
      },
      { // Food
        imgUrl: 'https://upload.wikimedia.org/wikipedia/en/6/63/MyFitnessPal_Logo.png',
        type: 'food',
        icon: 'restaurant23',
        result: trackerData.calories.netCalories,
        goal: 1601,
        label: 'Net Calories'
      },
       { // Duolingo
        imgUrl: 'http://media.tumblr.com/5fd6b3ccc4e8c978c87f469b236558ad/tumblr_inline_mwkqv1OuOg1ss97ol.png',
        type: 'chat',
        icon: 'chat27',
        result: trackerData.language.streak,
        goal: undefined,
        label: 'Spanish Lesson Streak'
      },   
      { // Money
        imgUrl: 'http://thefinancialbrand.com/wp-content/uploads/2015/06/Mint-logo.png',
        type: 'money',
        icon: 'money132',
        result: trackerData.language.streak,
        result: '$' + trackerData.money.recent.total.toFixed(2),
        goal: undefined,
        flip: true,
        label: 'Daily Spending'
      }
    ];
    return {
      date: trackerData.calories.date,
      classes: _.where(trackerData.gym.classes, {timeOfDay: 'Evening'}),
      classDate: trackerData.gym.classDate,
      trackers: tileData
    };
  }

  function handleFlipTile() {
    $( ".flip-tile[data-tracker]" ).on('click', function(e) {
      var trackerId = $(this).data('tracker');//.attr('data-target');
      $( "div[data-tracker='" + trackerId + "']" ).toggleClass('hide-tile');
    });
  }

  function initPage(trackerData) {
    var templateData = makeTemplateData(trackerData);
    var template = _.template(
      $( "#dash-template" ).html()
    );
    $('#dash-container').html(
      template(templateData)
    );
    makeBarChart(trackerData.money.transactions);
    handleFlipTile();
  }

  // USE CACHED DATA ON DEV
  if (window.location.hostname === 'localhost' && localStorage.getItem('trackers')) {
    initPage(JSON.parse(localStorage.getItem('trackers')));
  } else {
    $.getJSON('/trackers/all', function(trackerData) {
      initPage(trackerData);
      localStorage.setItem('trackers', JSON.stringify(trackerData));
    });
  }

});
