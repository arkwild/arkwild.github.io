var waypoint = new Waypoint({
  element: document.getElementById('counter-waypoint'),
  handler: function() {
    // Find the 'counter' class on the page and animate it
    $('.counter').each(function () {

      // Start the counting from a specified number - in this case, 0!
      $(this).prop('Counter',0).animate({
          Counter: $(this).text()
      }, {
          // Speed of counter in ms, default animation style
          duration: 2000,
          // Easing function
          easing: 'swing',
          step: function (now) {
            // Round up the number
              $(this).text(Math.ceil(now));
          }
      });
    });
  },
  offset: 100
})

//Cloudinary Setup
$.cloudinary.config({ 
  cloud_name: 'arkwild',
  api_key: '989323269577583',
  api_secret: 'zdKYj9b42nII5WTwIcFqsAC0Slo',
  secure: true
});

// Function to change heading background color
function changeBackgroundBg(color){
    document.getElementById("imageSlider").style.background = color;
}