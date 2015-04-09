function animateCard(card, direction, position){
  position = typeof position !== 'undefined' ? position : "-1000px";
  direction = typeof direction !== 'undefined' ? direction : "bottom";
  card.css(direction, position);
  card.addClass('animate-card');
  card.show();
  card.css(direction, "0");
}


$(document).ready(function(){
  animateCard($(".card-ready"));
  $(".card-ready").removeClass("card-ready");
});
