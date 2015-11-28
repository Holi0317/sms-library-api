import page from 'page';

(function(){
  'use strict';

  window.addEventListener('WebComponentsReady', () => {

    // We use Page.js for routing. This is a Micro
    // client-side router inspired by the Express router
    // More info: https://visionmedia.github.io/page.js/
    page('/', () => {
      app.route = 'home';
    });

    page('/user', () => {
      app.route = 'user';
    });

    // add #! before urls
    page({
      hashbang: true
    });

  });
})()
