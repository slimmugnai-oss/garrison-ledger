(function () {
  // Load GPT once
  const GPT_URL = 'https://www.googletagservices.com/tag/js/gpt.js';
  function loadScript(src, cb) {
    if (document.querySelector('script[src*="gpt.js"]')) return cb && cb();
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    s.onload = cb;
    document.head.appendChild(s);
  }

  function parseSizes(attr) {
    try { return JSON.parse(attr); } catch { return null; }
  }

  function initGAM() {
    window.googletag = window.googletag || { cmd: [] };
    const slots = document.querySelectorAll('.ad-slot');
    if (!slots.length) return;

    googletag.cmd.push(function () {
      const pubads = googletag.pubads();

      slots.forEach((el, idx) => {
        const unitPath = el.dataset.adUnit || '/XXXX/familymedia/placeholder';
        const sizes = parseSizes(el.dataset.sizes) || [[300, 250], [320, 100]];
        const slotName = el.dataset.slotName || ('slot_' + idx);

        // Optional: size mapping for responsive
        const mapping = googletag.sizeMapping()
          .addSize([1024, 0], sizes)                 // desktop
          .addSize([768, 0], sizes.filter(s => s[0] <= 728)) // tablet
          .addSize([0, 0], sizes.filter(s => s[0] <= 320))   // mobile
          .build();

        const slot = googletag.defineSlot(unitPath, sizes, el.id || slotName)
          .defineSizeMapping(mapping)
          .addService(pubads);

        // Targeting example (optional)
        if (el.dataset.targeting) {
          try {
            const t = JSON.parse(el.dataset.targeting);
            Object.entries(t).forEach(([k, v]) => slot.setTargeting(k, v));
          } catch (e) {}
        }
      });

      pubads.enableSingleRequest();
      googletag.enableServices();

      slots.forEach((el) => {
        const id = el.id || el.dataset.slotName;
        googletag.display(id);
        el.setAttribute('data-filled', 'true');
      });
    });
  }

  // If you want placeholders only (no ads on staging), set window.DISABLE_GAM = true
  if (window.DISABLE_GAM) return;

  loadScript(GPT_URL, initGAM);
})();
