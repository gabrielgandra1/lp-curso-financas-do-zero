(() => {
  const LINK_DE_COMPRA = 'checkout/';
  const OFERTA_TERMINA_EM = '2027-06-30T23:59:59-03:00';
  const FUSO_DA_OFERTA = 'America/Sao_Paulo';

  const root = document.documentElement;
  const status = document.getElementById('a11y-status');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-checkout]').forEach((link) => {
    link.href = LINK_DE_COMPRA;
  });

  const setupCountdown = () => {
    const countdown = document.querySelector('[data-countdown]');
    const deadline = new Date(OFERTA_TERMINA_EM);
    if (!countdown || Number.isNaN(deadline.getTime())) return;

    const format = (options) => new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO_DA_OFERTA, ...options }).format(deadline);
    const longText = `${format({ day: 'numeric', month: 'long', year: 'numeric' })}, às ${format({ hour: '2-digit', minute: '2-digit' }).replace(':', 'h')}`;
    document.querySelectorAll('[data-deadline]').forEach((element) => {
      element.setAttribute('datetime', OFERTA_TERMINA_EM);
      element.textContent = longText;
    });
    document.querySelectorAll('[data-deadline-short]').forEach((element) => {
      element.setAttribute('datetime', OFERTA_TERMINA_EM);
      element.textContent = format({ day: '2-digit', month: '2-digit', year: 'numeric' });
    });

    const body = countdown.querySelector('.countdown__body');
    const toggle = countdown.querySelector('[data-timer-toggle]');
    const units = {};
    countdown.querySelectorAll('[data-unit]').forEach((element) => {
      units[element.dataset.unit] = element;
    });
    const pad = (value) => String(value).padStart(2, '0');
    let timerId = null;

    const finish = () => {
      window.clearInterval(timerId);
      timerId = null;
      body.remove();
      const ended = document.createElement('p');
      ended.className = 'countdown__ended';
      ended.textContent = 'Esta condição especial terminou.';
      countdown.appendChild(ended);
    };

    const render = () => {
      const remaining = Math.floor((deadline.getTime() - Date.now()) / 1000);
      if (remaining <= 0) {
        finish();
        return;
      }
      units.dias.textContent = pad(Math.floor(remaining / 86400));
      units.horas.textContent = pad(Math.floor((remaining % 86400) / 3600));
      units.minutos.textContent = pad(Math.floor((remaining % 3600) / 60));
      units.segundos.textContent = pad(remaining % 60);
    };

    const start = () => {
      render();
      if (!body.isConnected) return;
      timerId = window.setInterval(render, 1000);
      toggle.textContent = 'Pausar contador';
    };

    const pause = () => {
      window.clearInterval(timerId);
      timerId = null;
      toggle.textContent = 'Retomar contador';
    };

    toggle.addEventListener('click', () => (timerId ? pause() : start()));
    start();
  };

  const setupVideo = () => {
    const frame = document.querySelector('[data-video]');
    if (!frame) return;
    const trigger = frame.querySelector('.video__play');
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const youtubeId = frame.dataset.youtubeId;
      let player;
      if (youtubeId) {
        player = document.createElement('iframe');
        player.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0`;
        player.title = 'Vídeo de apresentação do curso Finanças do Zero';
        player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        player.allowFullscreen = true;
        player.referrerPolicy = 'strict-origin-when-cross-origin';
      } else {
        player = document.createElement('video');
        const mp4 = trigger.getAttribute('href');
        [[mp4.replace(/\.mp4$/, '.webm'), 'video/webm'], [mp4, 'video/mp4']].forEach(([src, type]) => {
          const source = document.createElement('source');
          source.src = src;
          source.type = type;
          player.appendChild(source);
        });
        player.poster = trigger.querySelector('img').currentSrc;
        player.controls = true;
        player.autoplay = true;
        player.muted = true;
        player.playsInline = true;
        player.preload = 'auto';
        player.setAttribute('aria-label', 'Vídeo de apresentação do curso Finanças do Zero, sem áudio');
      }
      trigger.replaceWith(player);
      player.focus();
    });
  };

  const setupBuyBar = () => {
    const bar = document.querySelector('[data-buy-bar]');
    const hero = document.querySelector('.hero');
    if (!bar || !hero || !('IntersectionObserver' in window)) return;
    const zones = ['#oferta', '#chamada-final', '.site-footer'].map((selector) => document.querySelector(selector)).filter(Boolean);
    const visibleZones = new Set();
    let pastHero = false;
    const update = () => bar.classList.toggle('is-visible', pastHero && visibleZones.size === 0);

    new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    }).observe(hero);

    const zoneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleZones.add(entry.target);
        else visibleZones.delete(entry.target);
      });
      update();
    });
    zones.forEach((zone) => zoneObserver.observe(zone));
  };

  const setupReveal = () => {
    if (!('IntersectionObserver' in window) || reduceMotion.matches) return;
    root.classList.add('can-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  };

  const setupAccessibility = () => {
    const STORAGE_KEY = 'fz-a11y';
    const SIZES = ['100%', '112,5%', '125%', '137,5%'];
    const prefs = { fonte: 0, contraste: false };
    const contrastButton = document.querySelector('[data-a11y="contraste"]');

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) {
        prefs.fonte = Math.min(SIZES.length - 1, Math.max(0, Number(saved.fonte) || 0));
        prefs.contraste = saved.contraste === true;
      }
    } catch (error) {
      prefs.fonte = 0;
    }

    const save = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch (error) {
        return;
      }
    };

    const announce = (message) => {
      status.textContent = '';
      window.setTimeout(() => {
        status.textContent = message;
      }, 60);
    };

    const apply = () => {
      if (prefs.fonte > 0) root.setAttribute('data-fonte', String(prefs.fonte));
      else root.removeAttribute('data-fonte');
      if (prefs.contraste) root.setAttribute('data-contraste', 'alto');
      else root.removeAttribute('data-contraste');
      contrastButton.setAttribute('aria-pressed', String(prefs.contraste));
    };

    apply();

    document.querySelectorAll('[data-a11y]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.a11y;
        if (action === 'contraste') {
          prefs.contraste = !prefs.contraste;
          announce(prefs.contraste ? 'Alto contraste ativado.' : 'Alto contraste desativado.');
        } else {
          const step = action === 'mais' ? 1 : -1;
          const next = Math.min(SIZES.length - 1, Math.max(0, prefs.fonte + step));
          if (next === prefs.fonte) {
            announce(step > 0 ? `O texto já está no tamanho máximo, ${SIZES[next]}.` : `O texto já está no tamanho padrão, ${SIZES[next]}.`);
          } else {
            prefs.fonte = next;
            announce(`Tamanho do texto: ${SIZES[next]}.`);
          }
        }
        apply();
        save();
      });
    });
  };

  const setupVLibras = () => {
    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    let requested = false;
    const load = () => {
      if (requested) return;
      requested = true;
      events.forEach((name) => window.removeEventListener(name, load));
      const widget = document.createElement('div');
      widget.setAttribute('vw', '');
      widget.className = 'enabled';
      widget.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
      document.body.appendChild(widget);
      const script = document.createElement('script');
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.async = true;
      script.addEventListener('load', () => {
        if (!window.VLibras) return;
        new window.VLibras.Widget('https://vlibras.gov.br/app');
        if (document.readyState === 'complete' && typeof window.onload === 'function') window.onload();
      });
      document.body.appendChild(script);
    };
    events.forEach((name) => window.addEventListener(name, load, { passive: true }));
  };

  setupCountdown();
  setupVideo();
  setupBuyBar();
  setupReveal();
  setupAccessibility();
  setupVLibras();
})();
