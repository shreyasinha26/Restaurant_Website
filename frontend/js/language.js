// Language switching for the website
document.addEventListener("DOMContentLoaded", () => {
  const switchBtn = document.getElementById("lang-switch");
  let currentLang = localStorage.getItem("lang") || "en";

  // Base Google Maps URL (no language param)
  const MAP_BASE_URL =
    "https://www.google.com/maps?q=Aleksanterinkatu+15+Helsinki&output=embed";

  // Change the language of the embedded Google Map (if present)
  function setMapLanguage(lang) {
    const iframe = document.querySelector(".map-frame-wrapper iframe");
    if (!iframe) return; // not on Find Us page

    const hl = lang === "fi" ? "fi" : "en";
    iframe.src = `${MAP_BASE_URL}&hl=${hl}`;
  }

  function applyTranslations() {
    // Translate text content
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      el.innerHTML = translations[currentLang][key] || key;
    });

    // Translate placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (translations[currentLang][key]) {
        el.placeholder = translations[currentLang][key];
      }
    });

    // Update Google Maps language if iframe exists
    setMapLanguage(currentLang);
  }

  // Switch language
  switchBtn?.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "fi" : "en";
    localStorage.setItem("lang", currentLang);
    applyTranslations();
  });

  // Apply on page load
  applyTranslations();
});