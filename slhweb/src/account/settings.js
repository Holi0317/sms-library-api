function post_callback(data, status){
  var clicked = true;
  // Add tones of html into document
  if ( $("#return").children().length === 0 ){
  $("#return").append('<div class="container return-status-root" id="return-status-root"> <div class="col-sm-3"></div> <div class="col-sm-6"> <div class="card"> <div class="col-sm-2"> <div class="card-body"> <button class="" id="return-button"><i id="return-button-icon"></i></button> </div> </div> <div class="col-sm-10"> <div class="card-body" id="return-message"> </div> </div> </div> </div> <div class="col-sm-3"></div> </div>');
  clicked = false;
  }

  // write message informations into html
  switch (status) {
    case "success":
      $("#return-button-icon").attr("class", "mdi-navigation-check");
      $("#return-button").attr("class", "btn btn-fab btn-raised btn-success");
      $("#return-message").empty();
      $("#return-message").append(data.message);
      break;
    case "error":
      $("#return-button-icon").attr("class", "mdi-navigation-close");
      $("#return-button").attr("class", "btn btn-fab btn-raised btn-danger");
      $("#return-message").empty();
      $("#return-message").append(data.message);
      break;
    default:
      alert("Unknown condition");
      console.log(status);
  }

  // Animate it
  if ( ! clicked ){
    var height = $("#return-status-root").css({"visibility":"visible","opacity":"1","height":"auto"}).height();
    animateCard($("#return-status-root .card"), "right", window.innerWidth/2);
    animateCard($("#form-card"), "top", "-"+height+"px");
    animateCard($("#test-card"), "top", "-"+height+"px");
  }
}

// When module is toggled, decide if information should be shown or not
function toggleModule (){
  var information = $(this).parents("fieldset").children('.module-toggle');
  information.toggleClass('module-toggle-show');
}

// toggle module, version init
function toggleModuleInit (){
  $("fieldset").each(function(){
    var button = $(this).find("input[type=checkbox]");
    var information = $(this).children(".module-toggle");
    information.removeClass("module-toggle-show");
    if ( button.prop("checked")) {
      information.addClass("module-toggle-show");
    }});
}

// ajax error handler
$(document).ajaxError(function(event, jqxhr, settings, thrownError){
  post_callback(jqxhr.responseJSON, 'error');
});

// display or hide modules settings on click
$(".togglebutton input").on("click", toggleModule);

// Override form submition action
$("form").on("submit", function(){
  $.post(window.location, $("form").serialize(), post_callback);
  return false;
});

// Extend reset method
$("form").on('reset', function(){
  toggleModuleInit();
});

// Implement delete button action 
$("button[name=delete]").on("click", function(){
  $("input[name=action]").val("delete");
  $.ajax({
    url: window.location,
    method: "POST",
    data: $("form").serialize(),
    success: function(data, textStatus) {
      window.location.href = window.location.origin;
      }
    }
);});

$(document).ready(function(){
  // init script for dropdown.js (dropdown menu)
  $(".select").dropdown({ "autoinit" : ".select" });
  // Reset form to default value to prevent bug
  $("form").trigger('reset');
});
