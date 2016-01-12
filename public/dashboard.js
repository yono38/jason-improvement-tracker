$(document).ready(function() {
  $.getJSON('/trackall', function(data) {
    console.log(data);
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };
    var template = _.template(
      $( "#dash-template" ).html()
    );
    $('#dash-container').html(
      template(data)
    );
  });
});
