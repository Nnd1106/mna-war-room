/* app.js: hash router. */
(function (root) {
  'use strict';
  const WR = root.WR;
  const UI = WR.ui;
  const app = document.getElementById('app');

  function render() {
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    document.getElementById('modal-root').innerHTML = '';
    let view;
    try {
      if (!parts[0]) view = UI.landing();
      else if (parts[0] === 'hub') view = UI.hub();
      else if (parts[0] === 'file') view = UI.fileIntro(parts[1]);
      else if (parts[0] === 'play') view = UI.play(parts[1], (parts[2] || WR.util.newSeed()).slice(0, 24));
      else if (parts[0] === 'academy') view = UI.academy();
      else if (parts[0] === 'library') view = UI.library(parts[1]);
      else if (parts[0] === 'credits') view = UI.credits();
      else view = UI.landing();
    } catch (e) {
      console.error(e);
      view = UI.h('div', { class: 'wrap crash' }, UI.h('h1', null, 'Something went wrong'), UI.h('p', null, String(e && e.message || e)), UI.h('a', { class: 'btn primary', href: '#/hub' }, 'Back to the deal files'));
    }
    app.innerHTML = '';
    app.appendChild(view);
    document.body.className = 'r-' + (parts[0] || 'landing');
    window.scrollTo(0, 0);
  }

  WR.app = { render };
  window.addEventListener('hashchange', render);
  render();
})(window);
