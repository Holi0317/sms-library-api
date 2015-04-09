$("#reset-button").click(function(){
  $("#setting-form")[0].reset();
  return false;
});

function post_callback(data, status){
  var clicked = true;
  // Add tones of html into document
  if ( $("#return").children().length === 0 ){
  $("#return").append('<div class="container return-status-root" id="return-status-root"> <div class="col-sm-3"></div> <div class="col-sm-6"> <div class="card"> <div class="col-sm-2"> <div class="card-body"> <button class="" id="return-button"><i id="return-button-icon"></i></button> </div> </div> <div class="col-sm-4"> <div class="card-body" id="return-message"> </div> </div> </div> </div> <div class="col-sm-3"></div> </div>');
  clicked = false;
  }

  // write message informations into html
  switch (data.status) {
    case "success":
      $("#return-button-icon").attr("class", "mdi-navigation-check");
      $("#return-button").attr("class", "btn btn-fab btn-raised btn-success");
      $("#return-message").children().remove();
      $("#return-message").append("<p>"+data.message+"</p>");
      break;
    case "error":
      $("#return-button-icon").attr("class", "mdi-navigation-close");
      $("#return-button").attr("class", "btn btn-fab btn-raised btn-danger");
      $("#return-message").children().remove();
      $("#return-message").append("<p>"+data.message+"</p>");
      break;
    default:
      alert("Unknown condition");
  }

  // Animate it
  if ( ! clicked ){
    var height = $("#return-status-root").css({"visibility":"visible","opacity":"1","height":"auto"}).height();
    animateCard($("#return-status-root .card"), "right", window.innerWidth/2);
    animateCard($("#form-card"), "top", "-"+height+"px");
    animateCard($("#test-card"), "top", "-"+height+"px");
  }
}

$("#submit-button").click(function(){
  $.post(window.location, $("#setting-form").serialize(), post_callback);
  return false;
});

$("#test-success").click(function(){
  post_callback({status: 'success', message: 'Data updated'}, "success");
});

$("#test-fail").click(function(){
  post_callback({status: 'error', message: 'Incorrect data in field'}, "error");
});

$(document).ready(function(){
  $(".select").dropdown({ "autoinit" : ".select" });
});
