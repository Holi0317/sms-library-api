function animateCard(card, direction, position){
  position = typeof position !== 'undefined' ? position : "-1000px";
  direction = typeof direction !== 'undefined' ? direction : "bottom";
  card.css(direction, position);
  card.addClass('animate-card');
  card.show();
  card.css(direction, "0");
}

$(document).ready(function(){
  $(".card-ready").css({"visibility":"visible","opacity":"1","height":"auto"});
  animateCard($(".card-ready"));
});
