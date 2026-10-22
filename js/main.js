// Ideale Haushaltshilfe – kleine, abhängigkeitsfreie Helfer
(function () {
  'use strict';

  // Mobiles Menü
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    var setOpen = function (open) {
      menu.classList.toggle('hidden', !open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('.sr-only').textContent = open ? 'Menü schließen' : 'Menü öffnen';
      toggle.querySelector('[data-icon-open]').classList.toggle('hidden', open);
      toggle.querySelector('[data-icon-close]').classList.toggle('hidden', !open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Anfrageformulare → Formspree, danach eigene Danke-Seite
  // Ohne JavaScript funktioniert das Formular trotzdem (normaler POST an Formspree).
  document.querySelectorAll('form[data-formspree]').forEach(function (form) {
    var status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.className = 'mt-4 hidden rounded-xl bg-red-50 p-4 font-semibold text-red-800';
    form.appendChild(status);
    var button = form.querySelector('button[type="submit"]');
    var buttonText = button ? button.textContent : '';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.classList.add('hidden');
      if (button) {
        button.disabled = true;
        button.textContent = 'Wird gesendet …';
      }
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          window.location.href = 'danke.html';
        })
        .catch(function () {
          status.textContent =
            'Leider konnte Ihre Anfrage gerade nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns direkt an.';
          status.classList.remove('hidden');
          if (button) {
            button.disabled = false;
            button.textContent = buttonText;
          }
        });
    });
  });

  // Budget-Rechner (Kostenübernahme-Seite)
  // Werte gültig seit 01.01.2025 (Pflegeunterstützungs- und -entlastungsgesetz)
  var SACHLEISTUNG = { 2: 796, 3: 1497, 4: 1859, 5: 2299 };
  var ENTLASTUNG = 131;
  var euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

  var calc = document.querySelector('[data-budget-calc]');
  if (calc) {
    var out = {
      entlastung: calc.querySelector('[data-out="entlastung"]'),
      umwandlung: calc.querySelector('[data-out="umwandlung"]'),
      monat: calc.querySelector('[data-out="monat"]'),
      jahr: calc.querySelector('[data-out="jahr"]'),
      hinweis: calc.querySelector('[data-out="hinweis"]'),
    };
    var update = function () {
      var checked = calc.querySelector('input[name="pflegegrad"]:checked');
      var grad = checked ? Number(checked.value) : 1;
      var umwandlung = SACHLEISTUNG[grad] ? Math.round(SACHLEISTUNG[grad] * 0.4 * 100) / 100 : 0;
      var monat = ENTLASTUNG + umwandlung;
      out.entlastung.textContent = euro.format(ENTLASTUNG);
      out.umwandlung.textContent = umwandlung ? 'bis zu ' + euro.format(umwandlung) : 'nicht möglich';
      out.monat.textContent = 'bis zu ' + euro.format(monat);
      out.jahr.textContent = 'bis zu ' + euro.format(monat * 12);
      out.hinweis.textContent = grad === 1
        ? 'Bei Pflegegrad 1 steht Ihnen der Entlastungsbetrag zur Verfügung. Eine Umwandlung von Pflegesachleistungen ist erst ab Pflegegrad 2 möglich.'
        : 'Zusätzlich können Sie ab Pflegegrad 2 das Budget für Verhinderungspflege (gemeinsamer Jahresbetrag bis zu 3.539 €) stundenweise für uns nutzen.';
    };
    calc.addEventListener('change', update);
    update();
  }
})();
