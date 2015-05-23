function animateCard(card, direction, position){
  position = typeof position !== 'undefined' ? position : "-"+window.innerHeight+"px";
  direction = typeof direction !== 'undefined' ? direction : "bottom";
  card.css(direction, position);
  card.addClass('animate-card');
  card.show();
  card.css(direction, "0");
}
