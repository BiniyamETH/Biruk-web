/* Velora Software — shared site script (loaded on every page) */
(function () {
  var y = document.getElementById('year');
  if (y) { y.textContent = new Date().getFullYear(); }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile menu ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    var closeMenu = function () {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    };
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ---------- scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .12 });

  /* stagger: each child of a [data-stagger] container reveals on its own, in sequence */
  document.querySelectorAll('[data-stagger]').forEach(function (container) {
    Array.prototype.forEach.call(container.children, function (child, i) {
      child.classList.add('reveal');
      if (!reduce) { child.style.transitionDelay = (Math.min(i, 6) * 70) + 'ms'; }
      io.observe(child);
    });
  });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- contact form (Web3Forms) — only present on contact.html ----------
     Get a free access key at https://web3forms.com (just needs your email)
     and paste it below — submissions get emailed straight to that inbox.
     Leave it empty and the form falls back to opening the email app. */
  var sendBtn = document.getElementById('send');
  if (!sendBtn) { return; }

  var WEB3FORMS_ACCESS_KEY = '21dffafe-1061-4831-b7e4-c0cfdf95bb91';
  var EMAIL = 'velorasoftware4@gmail.com';

  sendBtn.addEventListener('click', async function () {
    var btn = this;
    var v = function (id) { return document.getElementById(id).value.trim(); };
    var note = document.getElementById('note');

    if (!v('name') || !v('reply')) {
      note.style.color = '#E0857A';
      note.textContent = 'Add your name and a way to reach you.';
      return;
    }

    var payload = {
      name: v('name'),
      business: v('business'),
      contact: v('reply'),
      needs: document.getElementById('kind').value,
      details: v('msg')
    };

    if (!WEB3FORMS_ACCESS_KEY) {
      var body = 'Name: ' + payload.name + '\nBusiness: ' + payload.business +
                 '\nContact: ' + payload.contact + '\nNeeds: ' + payload.needs +
                 '\n\n' + payload.details;
      note.style.color = '';
      note.textContent = 'Opening your email app…';
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent('Website request — ' + (payload.business || payload.name)) +
        '&body=' + encodeURIComponent(body);
      return;
    }

    btn.disabled = true;
    var label = btn.textContent;
    btn.textContent = 'Sending…';
    note.style.color = '';
    note.textContent = '';

    try {
      var res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          from_name: 'Velora',
          subject: 'Website request — ' + (payload.business || payload.name),
          name: payload.name,
          business: payload.business,
          contact: payload.contact,
          needs: payload.needs,
          message: payload.details,
          botcheck: document.getElementById('botcheck').checked
        })
      });
      var data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'bad status ' + res.status);

      document.querySelector('.form').innerHTML =
        '<div style="border:1px solid var(--gold-dim);border-radius:4px;padding:1.6rem">' +
        '<div class="label">Message sent</div>' +
        '<p style="margin:.7rem 0 0;color:var(--text)">Thanks — we\'ll reply to <strong>' +
        payload.contact.replace(/[<>&]/g, '') + '</strong> with a price and a timeline, usually the same day.</p></div>';
    } catch (err) {
      btn.disabled = false;
      btn.textContent = label;
      note.style.color = '#E0857A';
      note.innerHTML = 'That didn\'t send. Email <a href="mailto:' + EMAIL +
        '" style="color:var(--gold)">' + EMAIL + '</a> or message us on WhatsApp.';
    }
  });
})();
