(() => {
  const config = window.toolHubGoogleConfig || {};
  const root = document.getElementById('google-consent-root');
  const storageKey = 'tool-hub-google-consent-v1';
  const analyticsId = /^G-[A-Z0-9]+$/i.test(config.analyticsMeasurementId || '') ? config.analyticsMeasurementId : '';
  let consent = readConsent();
  let analyticsLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  document.querySelectorAll('[data-cookie-settings]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    showPreferences();
  }));

  if (window.location.hash === '#cookie-settings') showPreferences();
  else if (!consent && analyticsId) showBanner();
  else if (consent) activateAnalytics();

  function readConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && typeof saved.analytics === 'boolean') return { analytics: saved.analytics };
    } catch {}
    return null;
  }

  function showBanner() {
    root.innerHTML = `
      <section class="consent-banner" aria-label="Privacy choice">
        <div class="consent-copy">
          <strong>Privacy choices</strong>
          <p>Optional Google Analytics stays off unless allowed. OCR images and text stay in your browser; AI proofreading is currently unavailable.</p>
        </div>
        <div class="consent-actions">
          <button type="button" data-consent="settings">Settings</button>
          <button type="button" data-consent="reject">Reject optional</button>
          <button class="primary" type="button" data-consent="accept">Accept optional</button>
        </div>
      </section>`;
    root.querySelector('[data-consent="settings"]').addEventListener('click', showPreferences);
    root.querySelector('[data-consent="reject"]').addEventListener('click', () => saveConsent(false));
    root.querySelector('[data-consent="accept"]').addEventListener('click', () => saveConsent(true));
  }

  function showPreferences() {
    const analyticsChecked = Boolean(consent && consent.analytics);
    root.innerHTML = `
      <section class="consent-banner" role="dialog" aria-label="Privacy preferences">
        <div class="consent-copy">
          <strong>Privacy preferences</strong>
          <p>Choose whether optional Google Analytics may run. File processing remains on your device.</p>
          <div class="consent-options">
            <label><input id="analytics-consent" type="checkbox" ${analyticsChecked ? 'checked' : ''} ${analyticsId ? '' : 'disabled'}><span>Google Analytics<small>${analyticsId ? 'Helps us understand site usage.' : 'Inactive until a valid G- measurement ID is configured.'}</small></span></label>
          </div>
        </div>
        <div class="consent-actions">
          <button type="button" data-consent="cancel">Cancel</button>
          <button type="button" data-consent="reject">Reject optional</button>
          <button class="primary" type="button" data-consent="save">Save choice</button>
        </div>
      </section>`;
    root.querySelector('[data-consent="cancel"]').addEventListener('click', restoreConsentView);
    root.querySelector('[data-consent="reject"]').addEventListener('click', () => saveConsent(false));
    root.querySelector('[data-consent="save"]').addEventListener('click', () => {
      saveConsent(Boolean(root.querySelector('#analytics-consent')?.checked));
    });
    root.querySelector('#analytics-consent')?.focus();
  }

  function restoreConsentView() {
    root.replaceChildren();
    if (!consent && analyticsId) showBanner();
  }

  function saveConsent(analytics) {
    consent = { analytics: Boolean(analytics && analyticsId), savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(storageKey, JSON.stringify(consent));
    } catch {
      consent = null;
    }
    window.location.reload();
  }

  function activateAnalytics() {
    const allowed = Boolean(consent.analytics && analyticsId);
    window.gtag('consent', 'update', { analytics_storage: allowed ? 'granted' : 'denied' });
    if (allowed) loadAnalytics();
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;
    script.onload = () => {
      window.gtag('js', new Date());
      window.gtag('config', analyticsId);
    };
    document.head.append(script);
  }
})();
