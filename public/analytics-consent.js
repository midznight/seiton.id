(function () {
  "use strict";
  const GTM_CONTAINER_ID = "GTM-K3LKMTF3";
  const CONSENT_STORAGE_KEY = "seiton-analytics-consent-v1";
  const ALLOWED_PRODUCTION_HOSTS = new Set(["seiton.biz.id", "www.seiton.biz.id"]);
  const currentScript = document.currentScript;
  const productionBuildEnabled = currentScript?.dataset.analyticsEnabled === "true";
  const canLoadAnalytics = productionBuildEnabled && ALLOWED_PRODUCTION_HOSTS.has(window.location.hostname);
  if (window.__seitonAnalyticsConsentInitialized) return;
  window.__seitonAnalyticsConsentInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  function readConsent() {
    try {
      const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      return value === "granted" || value === "denied" ? value : null;
    } catch { return null; }
  }
  function loadTagManager() {
    if (!canLoadAnalytics || window.__seitonGtmLoaded) return;
    window.__seitonGtmLoaded = true;
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const script = document.createElement("script");
    script.id = "seiton-gtm-loader";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_CONTAINER_ID);
    document.head.appendChild(script);
  }
  function updateConsent(choice) {
    try { window.localStorage.setItem(CONSENT_STORAGE_KEY, choice); } catch {}
    const granted = choice === "granted";
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    if (granted) loadTagManager();
  }
  const banner = document.createElement("section");
  banner.id = "analytics-consent-banner";
  banner.className = "analytics-consent-banner";
  banner.hidden = true;
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-labelledby", "analytics-consent-title");
  banner.innerHTML = [
    '<div class="analytics-consent-copy">',
    '<p class="analytics-consent-kicker">PREFERENSI PRIVASI</p>',
    '<h2 id="analytics-consent-title">Bantu kami memperbaiki website Seiton.id?</h2>',
    '<p>Analytics membantu kami memahami halaman yang bermanfaat dan memperbaiki pengalaman website. Tag Google Analytics hanya dimuat jika kamu mengizinkannya. Pilihan dapat diubah kapan saja melalui Pengaturan privasi.</p>',
    '<a href="/privasi/">Baca Kebijakan Privasi</a>',
    '</div><div class="analytics-consent-actions">',
    '<button type="button" class="analytics-consent-reject" id="analytics-consent-reject">Tolak analitik</button>',
    '<button type="button" class="analytics-consent-accept" id="analytics-consent-accept">Izinkan analitik</button>',
    '</div>'
  ].join("");
  document.body.appendChild(banner);
  const settingsButton = document.createElement("button");
  settingsButton.type = "button";
  settingsButton.id = "analytics-settings";
  settingsButton.className = "analytics-settings-trigger";
  settingsButton.textContent = "Pengaturan privasi";
  const settingsHost = document.querySelector(".footer-bottom") || document.querySelector("footer");
  if (settingsHost) settingsHost.appendChild(settingsButton);
  const acceptButton = banner.querySelector("#analytics-consent-accept");
  const rejectButton = banner.querySelector("#analytics-consent-reject");
  acceptButton.addEventListener("click", function () {
    updateConsent("granted");
    banner.hidden = true;
  });
  rejectButton.addEventListener("click", function () {
    updateConsent("denied");
    banner.hidden = true;
  });
  settingsButton.addEventListener("click", function () {
    banner.hidden = false;
    rejectButton.focus();
  });
  const savedChoice = readConsent();
  if (savedChoice) updateConsent(savedChoice);
  else banner.hidden = false;
})();